---
name: OpenAI blueprint scaffolds
description: Why the OpenAI integration blueprint's auto-added files can break a project and what to do.
---

The `javascript_openai_ai_integrations` blueprint copies example files into
`client/replit_integrations/audio/*`, `server/replit_integrations/{audio,chat,image,batch}/*`,
and `shared/models/chat.ts`.

**Problem:** `shared/models/chat.ts` defines its own `conversations` and `messages`
Drizzle tables (serial ids, generic shape). If the app already has those tables in
`shared/schema.ts`, this collides — and the scaffold's storage/routes import the
generic shape, producing type errors during `tsc`.

**Rule:** When the app already has its own OpenAI usage (its own `server/openai.ts`),
delete the unused scaffold dirs/files. They are examples, not wiring.

**Credentials:** The integration sets `AI_INTEGRATIONS_OPENAI_BASE_URL` /
`AI_INTEGRATIONS_OPENAI_API_KEY`. If the user instead supplies a personal key,
read it with a fallback chain and only set `baseURL` when the integration proxy var
is present (otherwise the SDK defaults to api.openai.com). Env var NAMES are
case-sensitive — confirm the exact key name the user created (e.g. `OpenAI_API_KEY`)
rather than assuming canonical `OPENAI_API_KEY`.
