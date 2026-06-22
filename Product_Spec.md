# Product Spec: DIAL Receptionist MVP

## 1. Product Name

**DIAL Receptionist MVP**

## 2. Core Promise

A user can claim a DIAL address, create a simple AI receptionist, let visitors message that receptionist, and receive a clean summary by email.

The first successful user story is:

> I created `adi.dial`.
> Someone messaged my receptionist.
> The receptionist asked useful follow-up questions.
> I received a clean summary by email.

## 3. MVP Scope

This MVP includes only the basic receptionist flow.

It does not include tokens, calendar booking, Telegram, mobile app, smart contracts, DID infrastructure, verifiable credentials, advanced agent routing, custom domains, or autonomous actions.

The MVP is:

`DIAL address → public receptionist page → chat → follow-up questions → summary → email to owner`

## 4. Target User

The first target user is an individual founder, consultant, creator, researcher, operator, or builder who wants a lightweight AI receptionist.

Example user:

**Adi** wants a public contact point called `adi.dial`. Visitors can message `adi.dial` while Adi is offline. The receptionist collects useful context and forwards a summary to Adi.

## 5. User Roles

### 5.1 Owner

The person who claims a DIAL address and creates a receptionist.

Example:

`Adi` owns `adi.dial`.

### 5.2 Visitor

The person who messages the receptionist.

Example:

`James` visits `adi.dial` and leaves a message for Adi.

### 5.3 Admin

The platform operator who can review abuse, suspend addresses, and inspect operational issues.

## 6. MVP User Journey

### 6.1 Owner Journey

1. Owner lands on DIAL.
2. Owner searches for an address, e.g. `adi`.
3. System shows `adi.dial` is available.
4. Owner claims `adi.dial`.
5. Owner creates receptionist profile.
6. Owner enters forwarding email.
7. Owner publishes receptionist.
8. Public page becomes available at `dial.app/adi`.
9. The page displays the address as `adi.dial`.

### 6.2 Visitor Journey

1. Visitor opens `dial.app/adi`.
2. Visitor sees Adi’s receptionist.
3. Visitor starts chat.
4. Receptionist greets visitor.
5. Receptionist asks for name, contact details, topic, urgency, and desired next step.
6. Receptionist asks follow-up questions if the message is unclear.
7. Once enough information is collected, the receptionist closes the conversation politely.
8. System generates a structured summary.
9. Summary is emailed to Adi.

### 6.3 Owner Receives Summary

Owner receives an email containing:

* visitor name;
* visitor contact;
* organization, if provided;
* topic;
* urgency;
* summary;
* suggested next step;
* original conversation.

## 7. Functional Requirements

## 7.1 Address Claiming

### Description

Users must be able to claim a unique DIAL address.

### Requirements

* User can enter a desired address string.
* System checks availability.
* System normalizes the address.
* Address is displayed as `<name>.dial`.
* Address must be unique.
* Address must be linked to one owner account.
* Reserved or abusive terms must be blocked.
* Claimed address has status `claimed` or `active`.

### Example

Input:

`adi`

Output:

`adi.dial`

### Address Rules

Allowed:

* lowercase letters;
* numbers;
* hyphens;
* minimum 3 characters;
* maximum 32 characters.

Not allowed:

* spaces;
* special symbols;
* uppercase rendered as canonical;
* reserved terms;
* brand-protected terms during manual review phase;
* offensive terms.

## 7.2 Receptionist Creation

### Description

After claiming an address, the owner creates a receptionist.

### Required Fields

* owner name;
* receptionist name;
* owner bio;
* greeting;
* forwarding email;
* active status.

### Default Example

Owner name:

`Adi`

Receptionist name:

`Adi Receptionist`

Owner bio:

`Adi works on onchain business systems, tokenization, and AI infrastructure.`

Greeting:

`Hi, I’m Adi’s receptionist. I can take a message and forward a summary to him.`

Forwarding email:

`adi@example.com`

## 7.3 Public Receptionist Page

### Description

Each active DIAL address gets a public page.

### URL

Initial implementation:

`https://dial.app/adi`

Displayed address:

`adi.dial`

### Page Contents

The public page should show:

* DIAL address;
* receptionist name;
* owner name;
* short owner bio;
* greeting;
* chat interface.

### Example Page

```text
adi.dial

Adi Receptionist

Hi, I’m Adi’s receptionist. I can take a message and forward a summary to him.

[Start chat]
```

## 7.4 Chat Interface

### Description

Visitors can chat with the receptionist on the public page.

### Requirements

* Chat starts when visitor clicks “Start chat.”
* Visitor messages are saved.
* Receptionist replies are saved.
* Conversation has a status.
* Conversation is linked to the relevant agent.
* Visitor does not need an account.
* Visitor can provide name and contact inside the chat.

### Conversation Statuses

* `open`
* `collecting_info`
* `ready_for_summary`
* `summarized`
* `emailed`
* `closed`
* `failed`

## 7.5 Receptionist Behavior

### Description

The receptionist is a constrained intake agent. It is not a general-purpose assistant and must not pretend to be the owner.

### Core Tasks

The receptionist must:

1. greet the visitor;
2. explain that it is the owner’s receptionist;
3. collect visitor name;
4. collect visitor contact details;
5. collect organization, if relevant;
6. collect topic;
7. collect urgency;
8. collect desired next step;
9. ask follow-up questions if unclear;
10. summarize the conversation;
11. close politely.

### Restrictions

The receptionist must not:

* pretend to be the owner;
* make commitments on behalf of the owner;
* promise meetings;
* negotiate terms;
* provide legal, financial, medical, or professional advice as the owner;
* send messages from the owner;
* access private owner data;
* book calendar events;
* accept payments;
* perform external actions.

## 7.6 Follow-Up Logic

### Description

The system should determine whether enough information has been collected.

### Minimum Required Information

A conversation is ready for summary when it has:

* visitor name or identifier;
* contact method;
* topic;
* reason for contacting owner;
* desired next step.

### Optional Information

* organization;
* urgency;
* relevant links;
* deadline;
* background context.

### Example Follow-Up Questions

If the visitor says:

`I want to talk to Adi.`

Receptionist should ask:

`Sure. Can you share your name, contact details, and what you would like to discuss with Adi?`

If visitor says:

`I have a business proposal.`

Receptionist should ask:

`Thanks. Can you share your organization, the topic of the proposal, and what next step you are hoping for?`

If visitor says:

`I want to meet Adi at a conference.`

Receptionist should ask:

`Which conference are you referring to, what dates will you be there, and what would you like to discuss with Adi?`

## 7.7 Summary Generation

### Description

Once enough information has been collected, the system generates a structured summary.

### Summary Format

```text
New message via {address}

From:
{Name}

Organization:
{Organization if provided}

Contact:
{Contact details}

Topic:
{Topic}

Urgency:
{Low / Medium / High / Unknown}

Summary:
{Short clean summary}

Suggested next step:
{Suggested action}

Original conversation:
{Conversation transcript}
```

### Example

```text
New message via adi.dial

From:
James

Organization:
ADB

Contact:
james@example.com

Topic:
Tokenized insurance project

Urgency:
Medium

Summary:
James wants to discuss a possible tokenized insurance project with Adi. He is interested in exploring whether there is room for a call or collaboration.

Suggested next step:
Reply personally or send a scheduling link.

Original conversation:
Visitor: I want to speak to Adi about a tokenized insurance project.
Receptionist: Can you share your name, organization, contact details, and what you would like from Adi?
Visitor: I’m James from ADB. I’d like to discuss a possible project and see if Adi is open to a call.
```

## 7.8 Email Forwarding

### Description

The generated summary must be emailed to the owner.

### Requirements

* Email is sent to the agent’s forwarding email.
* Email subject includes the DIAL address.
* Email includes structured summary.
* Email includes original conversation.
* Email delivery status is stored.
* If email fails, notification status is marked `failed`.

### Email Subject

`New message via adi.dial`

## 7.9 Owner Inbox

### Description

The owner should be able to view received conversations inside DIAL.

### MVP Requirement

Owner inbox can be simple.

It should show:

* visitor name;
* topic;
* status;
* urgency;
* created date;
* summary;
* original conversation.

### Inbox Row Example

```text
James · Tokenized insurance project · Medium · Summarized
```

## 8. Non-Goals for MVP

The MVP will not include:

* token sending;
* wallet resolution;
* calendar booking;
* Telegram integration;
* WhatsApp integration;
* mobile-native app;
* voice calls;
* file uploads;
* DIDs;
* verifiable credentials;
* onchain identity;
* agent-to-agent communication;
* custom knowledge base;
* team workspaces;
* analytics dashboard;
* paid priority messages;
* autonomous replies by the owner;
* direct email sending from the owner’s account.

## 9. Data Model

## 9.1 users

Stores owner accounts.

Fields:

```text
id
email
name
created_at
updated_at
```

## 9.2 addresses

Stores claimed DIAL addresses.

Fields:

```text
id
address
normalized_address
owner_user_id
status
created_at
updated_at
```

Example:

```text
address: adi.dial
normalized_address: adi
owner_user_id: user_123
status: active
```

## 9.3 agents

Stores receptionist configuration.

Fields:

```text
id
address_id
owner_user_id
owner_name
receptionist_name
owner_bio
greeting
instructions
forwarding_email
active
created_at
updated_at
```

## 9.4 conversations

Stores visitor conversations.

Fields:

```text
id
agent_id
address_id
visitor_name
visitor_contact
visitor_organization
topic
urgency
status
summary
suggested_next_step
email_sent_at
created_at
updated_at
```

## 9.5 messages

Stores individual chat messages.

Fields:

```text
id
conversation_id
role
content
created_at
```

Roles:

```text
visitor
receptionist
system
```

## 9.6 notifications

Stores outbound summary emails.

Fields:

```text
id
conversation_id
type
recipient
subject
body
status
sent_at
created_at
```

Types:

```text
email
```

Statuses:

```text
pending
sent
failed
```

## 10. API Requirements

## 10.1 Check Address Availability

Endpoint:

```text
POST /api/addresses/check
```

Request:

```json
{
  "address": "adi"
}
```

Response:

```json
{
  "available": true,
  "display_address": "adi.dial"
}
```

## 10.2 Claim Address

Endpoint:

```text
POST /api/addresses/claim
```

Request:

```json
{
  "address": "adi"
}
```

Response:

```json
{
  "address_id": "addr_123",
  "display_address": "adi.dial",
  "status": "claimed"
}
```

## 10.3 Create Agent

Endpoint:

```text
POST /api/agents
```

Request:

```json
{
  "address_id": "addr_123",
  "owner_name": "Adi",
  "receptionist_name": "Adi Receptionist",
  "owner_bio": "Adi works on onchain business systems, tokenization, and AI infrastructure.",
  "greeting": "Hi, I’m Adi’s receptionist. I can take a message and forward a summary to him.",
  "forwarding_email": "adi@example.com"
}
```

Response:

```json
{
  "agent_id": "agent_123",
  "status": "active"
}
```

## 10.4 Load Public Agent Page

Endpoint:

```text
GET /api/agents/public/adi
```

Response:

```json
{
  "address": "adi.dial",
  "owner_name": "Adi",
  "receptionist_name": "Adi Receptionist",
  "owner_bio": "Adi works on onchain business systems, tokenization, and AI infrastructure.",
  "greeting": "Hi, I’m Adi’s receptionist. I can take a message and forward a summary to him.",
  "active": true
}
```

## 10.5 Send Chat Message

Endpoint:

```text
POST /api/chat/adi
```

Request:

```json
{
  "conversation_id": "conv_123",
  "message": "I want to speak to Adi about a tokenized insurance project."
}
```

Response:

```json
{
  "conversation_id": "conv_123",
  "reply": "Sure. Can you share your name, organization, contact details, and what you would like from Adi?",
  "status": "collecting_info"
}
```

## 10.6 Generate Summary

Endpoint:

```text
POST /api/conversations/{conversation_id}/summarize
```

Response:

```json
{
  "status": "summarized",
  "summary": "James wants to discuss a possible tokenized insurance project with Adi.",
  "suggested_next_step": "Reply personally or send a scheduling link."
}
```

## 10.7 Send Summary Email

Endpoint:

```text
POST /api/conversations/{conversation_id}/send-summary-email
```

Response:

```json
{
  "status": "sent"
}
```

## 11. Receptionist Prompt

Base prompt:

```text
You are {{receptionist_name}}, the receptionist for {{owner_name}}.

You are not {{owner_name}}.
You are their receptionist.

Your job is to:
1. greet visitors;
2. collect their name, organization, contact details, topic, urgency, and desired next step;
3. ask follow-up questions if the request is unclear;
4. summarize the request clearly;
5. forward the summary to {{owner_name}}.

You must not pretend to be {{owner_name}}.
You must not make promises on behalf of {{owner_name}}.
You must not book meetings.
You must not negotiate.
You must not give professional advice as {{owner_name}}.
You must not say that {{owner_name}} has agreed to anything.

Owner bio:
{{owner_bio}}

Greeting:
{{greeting}}

Conversation objective:
Collect enough information so {{owner_name}} can decide whether and how to respond.
```

## 12. Conversation Completion Logic

A conversation is ready for summary when the system has:

```text
visitor_name OR identifiable sender
visitor_contact
topic
reason_for_contact
desired_next_step
```

If any of these are missing, the receptionist asks a follow-up question.

If the visitor refuses or cannot provide more information, the receptionist may still summarize the message as incomplete.

## 13. MVP Screens

## 13.1 Landing Page

Purpose:

Explain DIAL Receptionist and drive address claiming.

Main headline:

`Claim your DIAL address and get an AI receptionist.`

CTA:

`Claim your address`

## 13.2 Address Claim Page

Fields:

* desired address;
* availability check;
* claim button.

## 13.3 Receptionist Setup Page

Fields:

* owner name;
* receptionist name;
* owner bio;
* greeting;
* forwarding email.

CTA:

`Create receptionist`

## 13.4 Public Receptionist Page

Shows:

* address;
* owner name;
* receptionist name;
* owner bio;
* greeting;
* chat box.

## 13.5 Chat Page / Chat Component

Shows:

* conversation messages;
* input field;
* send button.

## 13.6 Owner Inbox

Shows:

* list of conversations;
* status;
* summary;
* original transcript.

## 14. Success Criteria

The MVP is successful when the following flow works end to end:

1. A user creates an account.
2. The user claims `adi.dial`.
3. The user creates Adi Receptionist.
4. A visitor opens the public page.
5. The visitor messages the receptionist.
6. The receptionist asks relevant follow-up questions.
7. The visitor provides enough information.
8. The system generates a clean summary.
9. The owner receives the summary by email.
10. The conversation appears in the owner inbox.

## 15. Acceptance Test

Test scenario:

Owner creates:

```text
adi.dial
```

Receptionist setup:

```text
Owner: Adi
Receptionist: Adi Receptionist
Bio: Adi works on onchain business systems, tokenization, and AI infrastructure.
Email: adi@example.com
```

Visitor message:

```text
I want to speak to Adi about a tokenized insurance project.
```

Expected receptionist reply:

```text
Sure. Can you share your name, organization, contact details, and what you would like to discuss with Adi?
```

Visitor response:

```text
I’m James from ADB. My email is james@example.com. I want to discuss a possible tokenized insurance project and see if Adi is open to a call.
```

Expected result:

* conversation status becomes `ready_for_summary`;
* system generates summary;
* email is sent to `adi@example.com`;
* conversation is visible in owner inbox.

## 16. Safety and Privacy Requirements

The receptionist must clearly identify itself as a receptionist agent.

The public page should include:

```text
This is an AI receptionist for Adi. It can collect and summarize messages, but it does not speak as Adi or make commitments on Adi’s behalf.
```

The system should store conversations securely.

Visitors should understand that their messages may be summarized and forwarded to the owner.

Owners should be able to delete conversations.

Admins should be able to suspend abusive addresses or agents.

## 17. Admin Requirements

Admin should be able to:

* view claimed addresses;
* view active agents;
* suspend an address;
* deactivate an agent;
* inspect failed email notifications;
* review abuse reports.

## 18. Future Iterations

After the MVP works, add:

### v1.1 Announcements

Owner can post:

```text
Adi will be at Conference Y from 10–12 September. Message here if you want to meet him.
```

### v1.2 Calendar Link

Receptionist can qualify meeting requests and send a Cal.com or Calendly link.

### v1.3 Telegram Notifications

Owner can receive summaries in Telegram.

### v1.4 Token Receiving

`adi.dial` resolves to owner wallet address.

### v1.5 Mobile App

Native DIAL app for messaging, notifications, and address discovery.

### v2 Agent Routing

Receptionist can forward certain requests to a smarter specialized agent.

## 19. Build Priority

Build in this order:

1. User accounts.
2. Address claiming.
3. Receptionist setup.
4. Public receptionist page.
5. Chat interface.
6. Receptionist runtime.
7. Conversation storage.
8. Summary generation.
9. Email forwarding.
10. Owner inbox.
11. Admin suspension controls.
12. Payment.

## 20. One-Line Summary

DIAL Receptionist MVP lets a user claim `adi.dial`, create a simple AI receptionist, receive visitor messages, and get clean summaries by email.


# Product Spec Addendum: Fake Address Purchase Flow

## 1. Purpose

The MVP should include a purchase-like flow for claiming a DIAL address.

For the first MVP, the purchase can be simulated. No real payment processing is required.

The goal is to test address purchase intent and the user experience of choosing, reserving, and activating a DIAL address.

## 2. User Story

As a user, I want to search for a DIAL address, see whether it is available, choose a plan, and reserve the address so I can create my receptionist agent.

Example:

> I searched for `adi`.
> I saw that `adi.dial` was available.
> I selected a plan.
> I completed the reservation flow.
> I created my receptionist for `adi.dial`.

## 3. MVP Flow

### Step 1 — Search Address

User enters:

```text
adi
```

System returns:

```text
adi.dial is available
```

CTA:

```text
Reserve adi.dial
```

### Step 2 — Choose Plan

User sees simple plans.

Example:

```text
Free Beta
Reserve address + create receptionist during beta
$0

Personal
AI receptionist + email summaries
$9/month
Coming soon

Pro
More messages + custom settings
$29/month
Coming soon
```

For MVP, user selects:

```text
Free Beta
```

or simulated:

```text
Personal — Test checkout
```

### Step 3 — Fake Checkout / Reservation

User sees a checkout-style screen:

```text
Reserve adi.dial

Plan: Free Beta
Amount due today: $0

[Confirm reservation]
```

If testing purchase intent, show:

```text
Plan: Personal
Price: $9/month

This is a beta checkout. No payment will be processed.
[Continue]
```

### Step 4 — Reservation Success

System displays:

```text
adi.dial is reserved for you.

Next: create your AI receptionist.
```

CTA:

```text
Create receptionist
```

### Step 5 — Create Receptionist

User continues to receptionist setup.

## 4. Address Statuses

Add the following address statuses:

```text
available
checkout_started
reserved_beta
active
expired
suspended
```

### Status Meaning

`available`
Address can be claimed.

`checkout_started`
User began reservation but has not completed it.

`reserved_beta`
Address is reserved through fake/beta checkout.

`active`
Address has an active receptionist.

`expired`
Reservation expired or was released.

`suspended`
Address disabled by admin.

## 5. Payment Statuses

Add simulated payment fields even before real payments exist.

```text
payment_status
```

Values:

```text
none
simulated
paid
failed
refunded
```

For fake checkout, use:

```text
payment_status = simulated
```

For free beta reservation, use:

```text
payment_status = none
```

## 6. Database Changes

### addresses table

Add:

```text
status
reserved_at
activated_at
expires_at
```

### orders table

Create a simple orders table even for fake checkout.

```text
orders
- id
- user_id
- address_id
- plan
- amount
- currency
- payment_status
- checkout_type
- created_at
```

Example:

```json
{
  "user_id": "user_123",
  "address_id": "addr_123",
  "plan": "personal_beta",
  "amount": 9,
  "currency": "USD",
  "payment_status": "simulated",
  "checkout_type": "fake"
}
```

## 7. API Requirements

### Check Address

```text
POST /api/addresses/check
```

Request:

```json
{
  "address": "adi"
}
```

Response:

```json
{
  "available": true,
  "display_address": "adi.dial"
}
```

### Start Checkout

```text
POST /api/checkout/start
```

Request:

```json
{
  "address": "adi",
  "plan": "personal_beta"
}
```

Response:

```json
{
  "checkout_id": "checkout_123",
  "display_address": "adi.dial",
  "plan": "personal_beta",
  "amount": 9,
  "currency": "USD",
  "checkout_type": "fake"
}
```

### Complete Fake Checkout

```text
POST /api/checkout/complete
```

Request:

```json
{
  "checkout_id": "checkout_123"
}
```

Response:

```json
{
  "status": "success",
  "address": "adi.dial",
  "payment_status": "simulated",
  "next_step": "create_receptionist"
}
```

## 8. UX Copy

### Public Beta Version

Use this if no payment is processed:

```text
Reserve your DIAL address

No payment is required during the beta.
You can reserve your address and create your receptionist now.
```

Button:

```text
Reserve address
```

### Fake Checkout Testing Version

Use this only for internal testing or clearly disclosed beta testing:

```text
Test checkout

This checkout is part of the beta test. No payment will be processed.
```

Button:

```text
Complete test checkout
```

## 9. Acceptance Criteria

The fake address purchase flow is complete when:

1. User can search for `adi`.
2. System shows `adi.dial` is available.
3. User can select a plan.
4. User can complete a fake checkout or beta reservation.
5. System creates an order record.
6. System marks `adi.dial` as reserved.
7. User is taken to receptionist setup.
8. User can create and activate the receptionist.
9. `adi.dial` is no longer available to other users.

## 10. Future Real Payment Upgrade

The fake checkout should be designed so it can later be replaced by real payment processing.

Future real payment flow:

```text
address search
→ choose plan
→ real checkout
→ payment success
→ address reserved
→ receptionist setup
```

The rest of the product should not depend on whether payment was fake or real. It should only check:

```text
address is reserved or active
```

and

```text
user owns the address
```
