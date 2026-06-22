---
name: Public address page visibility & profile links
description: When a .dial address is publicly viewable and how profile links must be validated.
---

# Public address page = profile + optional receptionist

The public page (`/a/:name`, backed by `GET /api/public/:name`) is the address's
profile AND the receptionist chat combined. The chat panel only renders when an
active receptionist agent exists; otherwise the page shows just the profile.

## Visibility rule
An address is publicly viewable when **profile is published OR an active agent exists**.
Addresses in `checkout_started` or `expired` status are always hidden. This lives in
`storage.getPublicPageByNormalized`. Note this differs from the older
`getPublicAgentByNormalized`, which required `status === "active"` (i.e. an agent).

**Why:** a user may want a public profile page before (or without ever) setting up a
receptionist, so visibility can't depend solely on agent existence.

## Profile links must be http(s)-only
Profile `links[].url` are rendered into `<a href>` on a public, unauthenticated page.
They MUST be validated to `http:`/`https:` only — on write (zod `.refine` in the PUT
profile route) AND filtered again on render (`isSafeUrl` in Public.tsx).

**Why:** without scheme validation, a `javascript:`/`data:` URL stored by an owner
becomes a script/phishing injection vector for anyone clicking the link on the public
page. Keep both layers — old rows may predate the write-time check.
