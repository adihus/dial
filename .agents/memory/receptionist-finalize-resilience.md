---
name: Receptionist summary/email finalize resilience
description: Why public-chat conversations can get stuck without a summary/email, and the design that prevents it.
---

# Conversation finalize must be cheap, idempotent, and self-healing

The public chat (`POST /api/public/message`) runs several sequential gpt-5 calls
per visitor message. gpt-5 is a slow reasoning model — a single extraction can take
~16s and a summary ~7s. If the finalize step (summarize + email owner) throws or the
request is aborted/times out after the visitor's last message, the conversation gets
left at status `ready_for_summary` with no summary and the owner never gets emailed.

**Rules to keep it healthy:**
- Don't double-call the model. The per-message extraction result must be passed into
  the finalize step rather than re-extracting inside it (that was a redundant ~16s call).
- `finalizeConversation` must be idempotent: return early if already `emailed`, and
  reuse an existing saved summary when status is `summarized` (summary succeeded but
  email failed) instead of regenerating.
- Self-heal on reconnect: when a returning visitor message arrives for a conversation
  already at `ready_for_summary`/`summarized`, retry finalize before processing the new
  message. This recovers conversations stuck by a prior timeout.

**Status flow:** open → collecting_info → ready_for_summary → summarized → emailed.
A stuck conversation sits at `ready_for_summary` (info captured, owner not notified).

**How to recover a stuck one manually:** POST to `/api/public/message` with its
`conversation_id` + the stored `visitor_session_id` as `session_token`; the self-heal
path finalizes and returns `completed: true`.

**Why:** owners silently missing message emails is the worst failure for this product.
Consider a faster model for extraction/summary if latency keeps causing timeouts.

## Email delivery: why this product can't use Replit Mail
Replit Mail can ONLY deliver to the workspace owner's verified Replit email — it
ignores any recipient field — so it cannot serve a multi-user product where each owner
needs summaries at their own forwarding address. Delivery therefore uses Resend.

**Critical Resend constraint:** Resend will not deliver to arbitrary recipients until a
sending domain is verified; in test mode it only sends from `onboarding@resend.dev` and
only to the email that owns the Resend account (others rejected with "You can only send
testing emails to your own email address"). Multi-recipient delivery requires a verified
domain AND a FROM address on that domain.
**Why:** this is the most common "email is broken" cause — the code can be correct while
every send still fails purely due to unverified-domain restrictions.
