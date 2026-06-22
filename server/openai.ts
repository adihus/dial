import OpenAI from "openai";
import type { Agent, Message } from "@shared/schema";

// Uses the user's OpenAI API key. Falls back to Replit AI Integrations env vars
// if present. Instantiated lazily so the server can boot before a key is set.
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    const apiKey =
      process.env.AI_INTEGRATIONS_OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.OpenAI_API_KEY;
    // Only set when using the Replit AI Integrations proxy; otherwise the SDK
    // defaults to api.openai.com for a personal key.
    const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || undefined;
    if (!apiKey) {
      throw new Error(
        "OpenAI is not connected yet. Add an OpenAI API key to enable the receptionist."
      );
    }
    _openai = new OpenAI({ apiKey, baseURL });
  }
  return _openai;
}

const MODEL = "gpt-5-mini";

function buildSystemPrompt(agent: Agent): string {
  return `You are ${agent.receptionistName}, the receptionist for ${agent.ownerName}.

You are NOT ${agent.ownerName}. You are their receptionist.

Your job is to:
1. greet visitors warmly and briefly;
2. collect their name, organization (if relevant), contact details, topic, urgency, and desired next step;
3. ask focused follow-up questions if the request is unclear or incomplete;
4. once you have enough information, thank them and let them know you will pass a summary to ${agent.ownerName}.

Hard rules — you must NOT:
- pretend to be ${agent.ownerName};
- make promises or commitments on behalf of ${agent.ownerName};
- book meetings, negotiate terms, or accept payments;
- give legal, financial, medical, or professional advice as ${agent.ownerName};
- claim that ${agent.ownerName} has agreed to anything.

Keep replies short, professional, and human. Ask only one or two questions at a time.

Owner bio:
${agent.ownerBio ?? "(not provided)"}

${agent.instructions ? `Additional owner instructions:\n${agent.instructions}\n` : ""}
Greeting style reference:
${agent.greeting ?? ""}`;
}

function toChatMessages(messages: Message[]) {
  return messages.map((m) => ({
    role: m.role === "visitor" ? ("user" as const) : ("assistant" as const),
    content: m.content,
  }));
}

export async function generateReply(
  agent: Agent,
  history: Message[]
): Promise<string> {
  const response = await getOpenAI().chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: buildSystemPrompt(agent) },
      ...toChatMessages(history),
    ],
  });
  return (
    response.choices[0]?.message?.content?.trim() ??
    "Thanks for your message. Could you share a bit more detail?"
  );
}

export interface ExtractionResult {
  visitorName: string | null;
  visitorContact: string | null;
  visitorEmail: string | null;
  visitorOrganization: string | null;
  topic: string | null;
  urgency: "low" | "medium" | "high" | "unknown";
  reasonForContact: string | null;
  desiredNextStep: string | null;
  readyForSummary: boolean;
}

const EXTRACTION_SCHEMA = `{
  "visitorName": string | null,
  "visitorContact": string | null,
  "visitorEmail": string | null,
  "visitorOrganization": string | null,
  "topic": string | null,
  "urgency": "low" | "medium" | "high" | "unknown",
  "reasonForContact": string | null,
  "desiredNextStep": string | null,
  "readyForSummary": boolean
}`;

export async function extractConversationData(
  history: Message[]
): Promise<ExtractionResult> {
  const transcript = history
    .map((m) => `${m.role === "visitor" ? "Visitor" : "Receptionist"}: ${m.content}`)
    .join("\n");

  const response = await getOpenAI().chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You analyze a receptionist intake conversation and extract structured data. Return ONLY JSON matching this exact shape:\n${EXTRACTION_SCHEMA}\n\nSet "readyForSummary" to true ONLY when ALL of the following are present: visitorName (or a clear identifier), a contact method (visitorContact or visitorEmail), topic, reasonForContact, and desiredNextStep. Otherwise false. Use null for any unknown field. urgency must be one of the allowed values; use "unknown" if not stated.`,
      },
      { role: "user", content: transcript },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  let parsed: any = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {};
  }
  const allowedUrgency = ["low", "medium", "high", "unknown"];
  return {
    visitorName: parsed.visitorName ?? null,
    visitorContact: parsed.visitorContact ?? null,
    visitorEmail: parsed.visitorEmail ?? null,
    visitorOrganization: parsed.visitorOrganization ?? null,
    topic: parsed.topic ?? null,
    urgency: allowedUrgency.includes(parsed.urgency) ? parsed.urgency : "unknown",
    reasonForContact: parsed.reasonForContact ?? null,
    desiredNextStep: parsed.desiredNextStep ?? null,
    readyForSummary: parsed.readyForSummary === true,
  };
}

export interface SummaryResult {
  summary: string;
  suggestedNextStep: string;
}

export async function generateSummary(
  agent: Agent,
  history: Message[],
  extraction: ExtractionResult
): Promise<SummaryResult> {
  const transcript = history
    .map((m) => `${m.role === "visitor" ? "Visitor" : "Receptionist"}: ${m.content}`)
    .join("\n");

  const response = await getOpenAI().chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You write a concise summary of a visitor's message for ${agent.ownerName}. Return ONLY JSON: {"summary": string, "suggestedNextStep": string}. The summary should be 1-3 clean sentences describing what the visitor wants. suggestedNextStep is a short recommended action for ${agent.ownerName} (e.g. "Reply personally or send a scheduling link").`,
      },
      {
        role: "user",
        content: `Known fields: ${JSON.stringify(extraction)}\n\nTranscript:\n${transcript}`,
      },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  let parsed: any = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {};
  }
  return {
    summary: parsed.summary ?? "Visitor left a message.",
    suggestedNextStep:
      parsed.suggestedNextStep ?? "Review the conversation and reply personally.",
  };
}
