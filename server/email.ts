import { z } from "zod";
import { Resend } from "resend";

// Email delivery via Resend. Unlike Replit Mail (which only delivers to the
// workspace owner), Resend can deliver to any recipient — so each receptionist's
// summaries go to that owner's own forwarding address.
//
// NOTE: Resend requires the `from` address to use a domain you have verified in
// your Resend account. Until a domain is verified you may only use the shared
// `onboarding@resend.dev` sender, which can ONLY deliver to the email address
// that owns the Resend account. Set RESEND_FROM (e.g. "DIAL <hello@yourdomain>")
// once your domain is verified to send to arbitrary recipients.
export const zSmtpMessage = z.object({
  to: z.string().email(),
  subject: z.string(),
  text: z.string().optional(),
  html: z.string().optional(),
});

export type SmtpMessage = z.infer<typeof zSmtpMessage>;

const DEFAULT_FROM = "DIAL <onboarding@resend.dev>";

function getClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY || process.env.Resend_API_KEY;
  if (!apiKey) {
    throw new Error("Resend API key is not set (RESEND_API_KEY)");
  }
  return new Resend(apiKey);
}

export async function sendEmail(message: SmtpMessage): Promise<{
  accepted: string[];
  rejected: string[];
  messageId: string;
  response: string;
}> {
  const resend = getClient();
  const from = process.env.RESEND_FROM || DEFAULT_FROM;

  const { data, error } = await resend.emails.send({
    from,
    to: message.to,
    subject: message.subject,
    text: message.text ?? "",
    html: message.html,
  });

  if (error) {
    throw new Error(error.message || "Failed to send email");
  }

  const messageId = data?.id ?? "";
  return {
    accepted: [message.to],
    rejected: [],
    messageId,
    response: `Email sent successfully with ID: ${messageId}`,
  };
}
