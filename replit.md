# DIAL Receptionist

## Overview
DIAL is an AI receptionist platform. A user claims a `name.dial` address, completes a
beta checkout, and creates an AI receptionist with a public chat page. Visitors leave
a message; the receptionist asks focused follow-up questions, then generates a clean
summary and emails it to the owner. The owner reviews summaries in an inbox.

The product is a full vertical slice (MVP): Address → Agent → Conversation → Summary →
Email → Inbox.

## Tech Stack
- **Frontend:** React 18 + Vite, Wouter (routing), TanStack Query, Tailwind CSS.
- **Backend:** Node + Express (TypeScript, ESM), served by Vite middleware in dev.
- **Database:** PostgreSQL via Drizzle ORM (`drizzle-kit push` for schema sync).
- **Auth:** Replit Auth (OpenID Connect) — real login.
- **AI:** OpenAI through Replit AI Integrations (no personal API key; billed to credits).
- **Email:** Replit Mail.

## Project Structure
- `shared/schema.ts` — Drizzle tables + Zod insert schemas (single source of truth).
- `server/` — Express app: `index.ts` (bootstrap), `routes.ts` (all API endpoints),
  `storage.ts` (DB access layer), `openai.ts` (reply/extraction/summary), `email.ts`
  (Replit Mail), `db.ts`, `vite.ts`, `replit_integrations/auth/*` (Replit Auth).
- `client/src/` — React app: `pages/` (Landing, Claim, Setup, Dashboard,
  ConversationView, Public, NotFound), `components/Shell.tsx`, `hooks/use-auth.ts`,
  `lib/` (queryClient, utils, auth-utils).

## Key API Contract
- `POST /api/addresses/check` — availability check.
- `POST /api/checkout/start` + `/api/checkout/complete` — fake/beta checkout.
- `POST /api/agents` — create receptionist for a reserved address.
- `GET /api/me/dashboard` — owner addresses + agents + conversations (snake_case).
- `GET /api/me/conversations/:id` — single conversation detail (owner-only).
- `GET /api/public/:name` — public receptionist info (returns `agent_id`).
- `POST /api/public/message` — single endpoint that creates the conversation on the
  first message, generates a reply, extracts intake data, and once enough info is
  collected, summarizes + emails the owner and returns `completed: true`.

## Design Language
Editorial / technical "blueprint document" aesthetic, matching dial.lionscraft.io:
- Cream paper background (`#F0EFEA`), near-black ink, red accent (`#E8112D`).
- Bold black sans (Inter) headlines, monospace technical labels (JetBrains Mono),
  serif italic accents (Georgia). Grid background lines + corner brackets.
- Tailwind colors: `paper`, `ink`, `accent`, `line`, `muted`.

## Running
- Workflow **Start application** runs `npm run dev` on port 5000 (Vite + Express).
- `npm run db:push` syncs the schema. `npm run check` typechecks.

## Important Constraints / Notes
- **Replit Mail** only delivers to the workspace owner's verified Replit email, not to
  arbitrary `forwarding_email` values. The `forwarding_email` is stored on the agent
  for records and a future upgrade, but summary emails go to the workspace owner.
- **OpenAI** uses Replit AI Integrations (env vars `AI_INTEGRATIONS_OPENAI_BASE_URL`
  and `AI_INTEGRATIONS_OPENAI_API_KEY`), billed to the user's Replit credits — no API
  key required. Model is set in `server/openai.ts`.
- The checkout is simulated — no real payment is processed.

## User preferences
- Stack: React + Node + Postgres + Drizzle + OpenAI (confirmed).
- Real Replit Auth login (confirmed).
- Design must match the DIAL reference site's blueprint aesthetic (confirmed).
