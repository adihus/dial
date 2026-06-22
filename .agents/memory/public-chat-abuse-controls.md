---
name: Public chat abuse controls
description: Required protections for unauthenticated endpoints that trigger paid AI calls or emails.
---

Any unauthenticated endpoint that triggers paid OpenAI calls and/or outbound email
(e.g. a public receptionist chat) is a cost-exhaustion + spam vector. Before deploy
it must have:

1. **Rate limiting** — per-IP and per-resource (e.g. per-agent) fixed-window caps.
2. **Body length cap** — bound the message size in the request schema.
3. **Session binding** — return a server-issued opaque token (the conversation's
   random `visitorSessionId`) on creation and require it to continue; reject
   mismatches with 403. Prevents third parties from injecting messages into a
   conversation whose id leaks.

**Why:** The owner connects their own paid key; without these, one actor can drain
credits and flood the owner's inbox. Flagged in code review as deploy-blocking.

**How to apply:** A simple in-memory fixed-window limiter is sufficient for an MVP;
the conversation row already carries a random session id, so reuse it as the token.
