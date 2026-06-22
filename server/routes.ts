import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { randomUUID } from "crypto";
import { storage } from "./storage";
import {
  setupAuth,
  registerAuthRoutes,
  isAuthenticated,
} from "./replit_integrations/auth";
import {
  generateReply,
  extractConversationData,
  generateSummary,
  type ExtractionResult,
} from "./openai";
import { sendEmail } from "./email";
import { insertAgentSchema } from "@shared/schema";
import { z } from "zod";

const RESERVED_TERMS = new Set([
  "admin",
  "root",
  "support",
  "help",
  "dial",
  "www",
  "api",
  "system",
  "abuse",
  "security",
  "official",
]);

function normalizeAddress(input: string): string {
  return input.trim().toLowerCase();
}

function validateAddress(name: string): { ok: boolean; error?: string } {
  if (!/^[a-z0-9-]+$/.test(name)) {
    return {
      ok: false,
      error: "Only lowercase letters, numbers, and hyphens are allowed.",
    };
  }
  if (name.length < 3 || name.length > 32) {
    return { ok: false, error: "Address must be 3–32 characters." };
  }
  if (RESERVED_TERMS.has(name)) {
    return { ok: false, error: "This address is reserved." };
  }
  return { ok: true };
}

const PLANS: Record<string, { label: string; amountCents: number }> = {
  free_beta: { label: "Free Beta", amountCents: 0 },
  personal_beta: { label: "Personal — Test checkout", amountCents: 900 },
};

const MAX_MESSAGE_LENGTH = 2000;

// Lightweight fixed-window in-memory rate limiter. Protects the unauthenticated
// public chat endpoint (which triggers paid OpenAI calls + emails) from abuse.
function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return function check(key: string): boolean {
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    if (entry.count >= limit) return false;
    entry.count += 1;
    return true;
  };
}

// Per-IP: 20 messages/min. Per-agent: 120 messages/min (protects one owner's key).
const ipLimiter = createRateLimiter(20, 60_000);
const agentLimiter = createRateLimiter(120, 60_000);

function clientIp(req: Request): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) return fwd.split(",")[0].trim();
  return req.ip ?? "unknown";
}

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  function userId(req: Request): string {
    return (req.user as any).claims.sub as string;
  }

  // ----- Address check -----
  app.post("/api/addresses/check", async (req: Response | any, res: Response) => {
    const schema = z.object({ address: z.string() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

    const normalized = normalizeAddress(parsed.data.address);
    const valid = validateAddress(normalized);
    if (!valid.ok) {
      return res.json({
        available: false,
        display_address: `${normalized}.dial`,
        reason: valid.error,
      });
    }
    const available = await storage.isAddressAvailable(normalized);
    res.json({
      available,
      display_address: `${normalized}.dial`,
      reason: available ? undefined : "This address is already taken.",
    });
  });

  // ----- Start checkout -----
  app.post(
    "/api/checkout/start",
    isAuthenticated,
    async (req: Request, res: Response) => {
      const schema = z.object({
        address: z.string(),
        plan: z.string().default("free_beta"),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success)
        return res.status(400).json({ message: "Invalid input" });

      const normalized = normalizeAddress(parsed.data.address);
      const valid = validateAddress(normalized);
      if (!valid.ok) return res.status(400).json({ message: valid.error });

      const plan = PLANS[parsed.data.plan] ? parsed.data.plan : "free_beta";
      const available = await storage.isAddressAvailable(normalized);
      if (!available)
        return res.status(409).json({ message: "Address is no longer available." });

      const address = await storage.createAddress({
        normalizedName: normalized,
        displayAddress: `${normalized}.dial`,
        ownerUserId: userId(req),
        status: "checkout_started",
      });

      const order = await storage.createOrder({
        userId: userId(req),
        addressId: address.id,
        plan,
        amountCents: PLANS[plan].amountCents,
        checkoutType: PLANS[plan].amountCents > 0 ? "fake" : "fake",
        paymentStatus: PLANS[plan].amountCents > 0 ? "simulated" : "none",
      });

      await storage.logEvent({
        userId: userId(req),
        addressId: address.id,
        eventType: "checkout_started",
        eventData: { plan },
      });

      res.json({
        checkout_id: order.id,
        address_id: address.id,
        display_address: address.displayAddress,
        plan,
        plan_label: PLANS[plan].label,
        amount_cents: PLANS[plan].amountCents,
        currency: "USD",
        checkout_type: order.checkoutType,
      });
    }
  );

  // ----- Complete checkout -----
  app.post(
    "/api/checkout/complete",
    isAuthenticated,
    async (req: Request, res: Response) => {
      const schema = z.object({ checkout_id: z.string() });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success)
        return res.status(400).json({ message: "Invalid input" });

      const order = await storage.getOrderById(parsed.data.checkout_id);
      if (!order || order.userId !== userId(req))
        return res.status(404).json({ message: "Checkout not found" });

      const address = await storage.getAddressById(order.addressId);
      if (!address)
        return res.status(404).json({ message: "Address not found" });

      await storage.updateOrder(order.id, {
        paymentStatus: order.amountCents > 0 ? "simulated" : "none",
        completedAt: new Date(),
      });

      const updated = await storage.updateAddress(address.id, {
        status: "reserved_beta",
        reservedAt: new Date(),
      });

      await storage.logEvent({
        userId: userId(req),
        addressId: address.id,
        eventType: "address_reserved",
      });

      res.json({
        status: "success",
        address_id: address.id,
        address: updated?.displayAddress,
        payment_status: order.amountCents > 0 ? "simulated" : "none",
        next_step: "create_receptionist",
      });
    }
  );

  // ----- Create agent -----
  app.post("/api/agents", isAuthenticated, async (req: Request, res: Response) => {
    const schema = z.object({
      address_id: z.string(),
      owner_name: z.string().min(1),
      receptionist_name: z.string().min(1),
      owner_bio: z.string().optional(),
      greeting: z.string().optional(),
      instructions: z.string().optional(),
      forwarding_email: z.string().email(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });

    const address = await storage.getAddressById(parsed.data.address_id);
    if (!address || address.ownerUserId !== userId(req))
      return res.status(404).json({ message: "Address not found" });

    const existing = await storage.getAgentByAddressId(address.id);
    if (existing)
      return res.status(409).json({ message: "Receptionist already exists for this address." });

    const agent = await storage.createAgent({
      ownerUserId: userId(req),
      addressId: address.id,
      ownerName: parsed.data.owner_name,
      receptionistName: parsed.data.receptionist_name,
      ownerBio: parsed.data.owner_bio,
      greeting: parsed.data.greeting,
      instructions: parsed.data.instructions,
      forwardingEmail: parsed.data.forwarding_email,
      active: true,
      intakeConfig: {
        required_fields: [
          "visitor_name",
          "visitor_contact",
          "topic",
          "desired_next_step",
        ],
      },
      routingConfig: {
        default_route: "email",
        email: parsed.data.forwarding_email,
        send_summary_on_completion: true,
      },
    });

    await storage.updateAddress(address.id, {
      status: "active",
      activatedAt: new Date(),
    });

    await storage.logEvent({
      userId: userId(req),
      addressId: address.id,
      agentId: agent.id,
      eventType: "agent_created",
    });

    res.json({ agent_id: agent.id, status: "active" });
  });

  // ----- Owner dashboard (addresses + agents + conversations) -----
  app.get("/api/me/dashboard", isAuthenticated, async (req: Request, res: Response) => {
    const uid = userId(req);
    const [addressList, agentList, convoList] = await Promise.all([
      storage.getAddressesByOwner(uid),
      storage.getAgentsByOwner(uid),
      storage.getConversationsByOwner(uid),
    ]);

    res.json({
      addresses: addressList.map((a) => ({
        id: a.id,
        display_address: a.displayAddress,
        status: a.status,
        profile_published: a.profilePublished,
      })),
      agents: agentList.map((a) => ({
        id: a.id,
        address_id: a.addressId,
        receptionist_name: a.receptionistName,
        owner_name: a.ownerName,
      })),
      conversations: convoList.map((c) => ({
        id: c.id,
        agent_id: c.agentId,
        visitor_name: c.visitorName,
        status: c.status,
        summary: c.summary,
        created_at: c.createdAt,
      })),
    });
  });

  // ----- Single address detail (owner only) -----
  app.get(
    "/api/me/addresses/:id",
    isAuthenticated,
    async (req: Request, res: Response) => {
      const address = await storage.getAddressById(String(req.params.id));
      if (!address || address.ownerUserId !== userId(req))
        return res.status(404).json({ message: "Address not found" });
      const agent = await storage.getAgentByAddressId(address.id);
      res.json({
        id: address.id,
        display_address: address.displayAddress,
        name: address.normalizedName,
        status: address.status,
        has_agent: !!agent,
        profile: {
          name: address.profileName ?? "",
          headline: address.profileHeadline ?? "",
          bio: address.profileBio ?? "",
          links: address.profileLinks ?? [],
          published: address.profilePublished,
        },
      });
    }
  );

  // ----- Update address profile / public page (owner only) -----
  app.put(
    "/api/me/addresses/:id/profile",
    isAuthenticated,
    async (req: Request, res: Response) => {
      const schema = z.object({
        name: z.string().max(80).optional(),
        headline: z.string().max(140).optional(),
        bio: z.string().max(2000).optional(),
        links: z
          .array(
            z.object({
              label: z.string().min(1).max(40),
              url: z
                .string()
                .min(1)
                .max(300)
                .refine(
                  (u) => {
                    try {
                      const parsed = new URL(u);
                      return (
                        parsed.protocol === "http:" ||
                        parsed.protocol === "https:"
                      );
                    } catch {
                      return false;
                    }
                  },
                  { message: "Links must be http(s) URLs" }
                ),
            })
          )
          .max(10)
          .optional(),
        published: z.boolean().optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success)
        return res
          .status(400)
          .json({ message: "Invalid input", errors: parsed.error.flatten() });

      const address = await storage.getAddressById(String(req.params.id));
      if (!address || address.ownerUserId !== userId(req))
        return res.status(404).json({ message: "Address not found" });

      const updated = await storage.updateAddress(address.id, {
        ...(parsed.data.name !== undefined
          ? { profileName: parsed.data.name }
          : {}),
        ...(parsed.data.headline !== undefined
          ? { profileHeadline: parsed.data.headline }
          : {}),
        ...(parsed.data.bio !== undefined
          ? { profileBio: parsed.data.bio }
          : {}),
        ...(parsed.data.links !== undefined
          ? { profileLinks: parsed.data.links }
          : {}),
        ...(parsed.data.published !== undefined
          ? { profilePublished: parsed.data.published }
          : {}),
      });

      await storage.logEvent({
        userId: userId(req),
        addressId: address.id,
        eventType: "profile_updated",
      });

      res.json({
        id: address.id,
        display_address: updated?.displayAddress,
        profile: {
          name: updated?.profileName ?? "",
          headline: updated?.profileHeadline ?? "",
          bio: updated?.profileBio ?? "",
          links: updated?.profileLinks ?? [],
          published: updated?.profilePublished ?? false,
        },
      });
    }
  );

  // ----- Single conversation detail (owner only) -----
  app.get(
    "/api/me/conversations/:id",
    isAuthenticated,
    async (req: Request, res: Response) => {
      const convo = await storage.getConversationById(String(req.params.id));
      if (!convo) return res.status(404).json({ message: "Not found" });
      const agent = await storage.getAgentById(convo.agentId);
      if (!agent || agent.ownerUserId !== userId(req))
        return res.status(403).json({ message: "Forbidden" });
      const address = await storage.getAddressById(convo.addressId);
      const msgs = await storage.getMessages(convo.id);
      res.json({
        conversation: {
          id: convo.id,
          visitor_name: convo.visitorName,
          visitor_email: convo.visitorEmail ?? convo.visitorContact,
          status: convo.status,
          summary: convo.summary,
          created_at: convo.createdAt,
        },
        agent: {
          receptionist_name: agent.receptionistName,
          owner_name: agent.ownerName,
        },
        address: { display_address: address?.displayAddress ?? "" },
        messages: msgs.map((m) => ({
          role: m.role,
          content: m.content,
          created_at: m.createdAt,
        })),
      });
    }
  );

  // ----- Public address page (no auth): profile + optional receptionist -----
  app.get("/api/public/:name", async (req: Request, res: Response) => {
    const normalized = normalizeAddress(String(req.params.name));
    const result = await storage.getPublicPageByNormalized(normalized);
    if (!result) return res.status(404).json({ message: "Page not found" });

    const { address, agent } = result;
    const profileName =
      address.profileName || agent?.ownerName || address.displayAddress;
    const profileBio = address.profileBio ?? agent?.ownerBio ?? null;

    const receptionist = agent
      ? {
          agent_id: agent.id,
          receptionist_name: agent.receptionistName,
          owner_name: agent.ownerName,
          greeting:
            agent.greeting ||
            `Hi, I'm ${agent.receptionistName}. I can take a message and forward a summary to ${agent.ownerName}.`,
        }
      : null;

    res.json({
      display_address: address.displayAddress,
      profile: {
        name: profileName,
        headline: address.profileHeadline ?? null,
        bio: profileBio,
        links: address.profileLinks ?? [],
        published: address.profilePublished,
      },
      receptionist,
      // Back-compat fields for any older client.
      agent_id: agent?.id ?? null,
      owner_name: agent?.ownerName ?? profileName,
      receptionist_name: agent?.receptionistName ?? null,
      owner_bio: profileBio,
      greeting: receptionist?.greeting ?? null,
    });
  });

  // ----- Public chat message (no auth) -----
  // Creates the conversation on first message (conversation_id null), generates
  // a reply, extracts intake data, and — once enough info is gathered —
  // summarizes + emails the owner and marks the conversation completed.
  app.post("/api/public/message", async (req: Request, res: Response) => {
    const schema = z.object({
      agent_id: z.string(),
      conversation_id: z.string().nullable().optional(),
      session_token: z.string().nullable().optional(),
      message: z.string().min(1).max(MAX_MESSAGE_LENGTH),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ message: "Invalid input" });

    // Abuse controls: each call triggers paid OpenAI usage and may send email.
    if (!ipLimiter(clientIp(req)) || !agentLimiter(parsed.data.agent_id)) {
      return res
        .status(429)
        .json({ message: "Too many messages. Please slow down and try again shortly." });
    }

    const agent = await storage.getAgentById(parsed.data.agent_id);
    if (!agent || !agent.active)
      return res.status(404).json({ message: "Receptionist not found" });

    // Load or create the conversation. Continuation is bound to the
    // server-issued session token to stop third parties from injecting
    // messages into a conversation whose id leaks.
    let convo;
    let sessionToken: string;
    if (parsed.data.conversation_id) {
      convo = await storage.getConversationById(parsed.data.conversation_id);
      if (!convo || convo.agentId !== agent.id)
        return res.status(404).json({ message: "Conversation not found" });
      if (
        !convo.visitorSessionId ||
        convo.visitorSessionId !== parsed.data.session_token
      ) {
        return res.status(403).json({ message: "Invalid session." });
      }
      sessionToken = convo.visitorSessionId;
    } else {
      sessionToken = randomUUID();
      convo = await storage.createConversation({
        agentId: agent.id,
        addressId: agent.addressId,
        visitorSessionId: sessionToken,
      });
    }

    if (["emailed", "closed"].includes(convo.status)) {
      return res.json({
        conversation_id: convo.id,
        session_token: sessionToken,
        reply:
          "Thanks — I've already passed your message along to " +
          agent.ownerName +
          ". Is there anything else you'd like to add?",
        completed: true,
      });
    }

    // Self-heal: a previous turn gathered enough info but failed to summarize or
    // email the owner (e.g. an OpenAI/email timeout), leaving the conversation
    // stuck. Retry the finalize before processing the new message.
    if (["ready_for_summary", "summarized"].includes(convo.status)) {
      const recovered = await finalizeConversation(convo.id);
      if (recovered) {
        return res.json({
          conversation_id: convo.id,
          session_token: sessionToken,
          reply:
            "Thanks — I've passed your message along to " +
            agent.ownerName +
            ". Is there anything else you'd like to add?",
          completed: true,
        });
      }
    }

    await storage.addMessage({
      conversationId: convo.id,
      role: "visitor",
      content: parsed.data.message,
    });

    let history = await storage.getMessages(convo.id);

    let reply: string;
    try {
      reply = await generateReply(agent, history);
    } catch (err) {
      console.error("generateReply failed", err);
      return res
        .status(502)
        .json({ message: "The receptionist is unavailable right now." });
    }

    await storage.addMessage({
      conversationId: convo.id,
      role: "receptionist",
      content: reply,
    });

    history = await storage.getMessages(convo.id);

    // Extract intake data and decide whether we have enough to summarize.
    let completed = false;
    try {
      const extraction = await extractConversationData(history);
      await storage.updateConversation(convo.id, {
        visitorName: extraction.visitorName ?? convo.visitorName,
        visitorContact: extraction.visitorContact ?? convo.visitorContact,
        visitorEmail: extraction.visitorEmail ?? convo.visitorEmail,
        visitorOrganization:
          extraction.visitorOrganization ?? convo.visitorOrganization,
        topic: extraction.topic ?? convo.topic,
        urgency: extraction.urgency,
        status: extraction.readyForSummary ? "ready_for_summary" : "collecting_info",
      });

      if (extraction.readyForSummary) {
        completed = await finalizeConversation(convo.id, extraction);
      }
    } catch (err) {
      console.error("extraction failed", err);
    }

    res.json({ conversation_id: convo.id, session_token: sessionToken, reply, completed });
  });

  // Summarize a conversation, persist the summary, and email the owner.
  // Returns true when the owner has been notified.
  async function finalizeConversation(
    conversationId: string,
    knownExtraction?: ExtractionResult
  ): Promise<boolean> {
    const convo = await storage.getConversationById(conversationId);
    if (!convo) return false;
    if (convo.status === "emailed") return true; // already notified — idempotent
    const agent = await storage.getAgentById(convo.agentId);
    const address = await storage.getAddressById(convo.addressId);
    if (!agent || !address) return false;

    const history = await storage.getMessages(convo.id);

    let summaryText: string;
    let nextStep: string;
    if (convo.summary && convo.status === "summarized") {
      // A prior attempt already summarized but failed to email — reuse it
      // instead of paying for another model call.
      summaryText = convo.summary;
      nextStep =
        convo.suggestedNextStep ??
        "Review the conversation and reply personally.";
    } else {
      try {
        // Reuse the extraction the caller already computed to avoid a second
        // (slow, paid) model round-trip per message.
        const extraction =
          knownExtraction ?? (await extractConversationData(history));
        const summary = await generateSummary(agent, history, extraction);
        summaryText = summary.summary;
        nextStep = summary.suggestedNextStep;
        await storage.updateConversation(convo.id, {
          summary: summaryText,
          suggestedNextStep: nextStep,
          status: "summarized",
          summaryGeneratedAt: new Date(),
        });
        await storage.logEvent({
          agentId: agent.id,
          addressId: convo.addressId,
          eventType: "summary_generated",
        });
      } catch (err) {
        console.error("summarize failed", err);
        return false;
      }
    }

    const transcript = history
      .map((m) => `${m.role === "visitor" ? "Visitor" : "Receptionist"}: ${m.content}`)
      .join("\n");

    const fresh = await storage.getConversationById(convo.id);
    const subject = `New message via ${address.displayAddress}`;
    const body = [
      `New message via ${address.displayAddress}`,
      "",
      `From:\n${fresh?.visitorName ?? "Unknown"}`,
      "",
      `Organization:\n${fresh?.visitorOrganization ?? "—"}`,
      "",
      `Contact:\n${fresh?.visitorContact ?? fresh?.visitorEmail ?? "—"}`,
      "",
      `Topic:\n${fresh?.topic ?? "—"}`,
      "",
      `Urgency:\n${fresh?.urgency ?? "unknown"}`,
      "",
      `Summary:\n${summaryText}`,
      "",
      `Suggested next step:\n${nextStep}`,
      "",
      `Original conversation:\n${transcript}`,
    ].join("\n");

    const notification = await storage.createNotification({
      conversationId: convo.id,
      agentId: agent.id,
      recipient: agent.forwardingEmail,
      subject,
      body,
      status: "pending",
    });

    try {
      await sendEmail({ to: agent.forwardingEmail, subject, text: body });
      await storage.updateNotification(notification.id, {
        status: "sent",
        sentAt: new Date(),
      });
      await storage.updateConversation(convo.id, {
        status: "emailed",
        emailSentAt: new Date(),
      });
      await storage.logEvent({
        agentId: agent.id,
        addressId: convo.addressId,
        eventType: "summary_emailed",
      });
      return true;
    } catch (err: any) {
      console.error("send email failed", err);
      await storage.updateNotification(notification.id, {
        status: "failed",
        errorMessage: err?.message ?? "unknown",
      });
      // The summary is still saved; owner can see it in the inbox.
      return false;
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
