Yes. For this MVP, keep the database very simple.

You need tables for:

1. users
2. addresses
3. fake/real orders
4. receptionist agents
5. conversations
6. messages
7. email notifications
8. audit events / admin logs

The core relationship is:

```text
user
  → owns address
      → has receptionist agent
          → has conversations
              → has messages
              → creates email notifications
```

Below is a clean Postgres-style schema.

---

# 1. Core schema

```sql
create extension if not exists pgcrypto;

-- 1. USERS
create table app_users (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    name text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 2. ADDRESSES
create table addresses (
    id uuid primary key default gen_random_uuid(),

    -- "adi"
    normalized_name text not null unique,

    -- "adi.dial"
    display_address text not null unique,

    owner_user_id uuid references app_users(id) on delete set null,

    status text not null default 'checkout_started'
        check (status in (
            'checkout_started',
            'reserved_beta',
            'active',
            'expired',
            'suspended'
        )),

    reserved_at timestamptz,
    activated_at timestamptz,
    expires_at timestamptz,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 3. ORDERS / FAKE CHECKOUT
create table orders (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null references app_users(id) on delete cascade,
    address_id uuid not null references addresses(id) on delete cascade,

    plan text not null default 'personal_beta',
    amount_cents integer not null default 0,
    currency text not null default 'USD',

    checkout_type text not null default 'fake'
        check (checkout_type in ('fake', 'real')),

    payment_status text not null default 'simulated'
        check (payment_status in (
            'none',
            'simulated',
            'paid',
            'failed',
            'refunded'
        )),

    provider text,
    provider_checkout_id text,

    completed_at timestamptz,
    created_at timestamptz not null default now()
);

-- 4. RECEPTIONIST AGENTS
create table agents (
    id uuid primary key default gen_random_uuid(),

    owner_user_id uuid not null references app_users(id) on delete cascade,
    address_id uuid not null unique references addresses(id) on delete cascade,

    owner_name text not null,
    receptionist_name text not null,
    owner_bio text,
    greeting text,

    -- extra custom instructions from owner
    instructions text,

    forwarding_email text not null,

    active boolean not null default false,

    -- flexible fields for MVP without needing many extra tables
    intake_config jsonb not null default '{}'::jsonb,
    routing_config jsonb not null default '{}'::jsonb,
    model_config jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 5. CONVERSATIONS
create table conversations (
    id uuid primary key default gen_random_uuid(),

    agent_id uuid not null references agents(id) on delete cascade,
    address_id uuid not null references addresses(id) on delete cascade,

    visitor_session_id text,
    visitor_name text,
    visitor_contact text,
    visitor_email text,
    visitor_organization text,

    topic text,
    urgency text check (urgency in ('low', 'medium', 'high', 'unknown')),

    status text not null default 'open'
        check (status in (
            'open',
            'collecting_info',
            'ready_for_summary',
            'summarized',
            'emailed',
            'closed',
            'failed'
        )),

    summary text,
    suggested_next_step text,

    summary_generated_at timestamptz,
    email_sent_at timestamptz,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 6. MESSAGES
create table messages (
    id uuid primary key default gen_random_uuid(),

    conversation_id uuid not null references conversations(id) on delete cascade,

    role text not null
        check (role in ('visitor', 'receptionist', 'system')),

    content text not null,

    metadata jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now()
);

-- 7. NOTIFICATIONS
create table notifications (
    id uuid primary key default gen_random_uuid(),

    conversation_id uuid not null references conversations(id) on delete cascade,
    agent_id uuid not null references agents(id) on delete cascade,

    type text not null default 'email'
        check (type in ('email')),

    recipient text not null,
    subject text not null,
    body text not null,

    status text not null default 'pending'
        check (status in ('pending', 'sent', 'failed')),

    provider_message_id text,
    error_message text,

    sent_at timestamptz,
    created_at timestamptz not null default now()
);

-- 8. AUDIT EVENTS
create table audit_events (
    id uuid primary key default gen_random_uuid(),

    user_id uuid references app_users(id) on delete set null,
    address_id uuid references addresses(id) on delete set null,
    agent_id uuid references agents(id) on delete set null,

    event_type text not null,
    event_data jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now()
);
```

---

# 2. Recommended indexes

```sql
create index idx_addresses_owner_user_id on addresses(owner_user_id);
create index idx_addresses_status on addresses(status);

create index idx_orders_user_id on orders(user_id);
create index idx_orders_address_id on orders(address_id);

create index idx_agents_owner_user_id on agents(owner_user_id);
create index idx_agents_address_id on agents(address_id);

create index idx_conversations_agent_id on conversations(agent_id);
create index idx_conversations_address_id on conversations(address_id);
create index idx_conversations_status on conversations(status);
create index idx_conversations_created_at on conversations(created_at desc);

create index idx_messages_conversation_id on messages(conversation_id);
create index idx_messages_created_at on messages(created_at);

create index idx_notifications_conversation_id on notifications(conversation_id);
create index idx_notifications_status on notifications(status);
```

---

# 3. Why this schema works

## `addresses`

Stores `adi.dial`.

This is the ownership layer.

## `orders`

Lets you simulate the purchase flow now and upgrade to real payments later.

For fake checkout:

```text
checkout_type = fake
payment_status = simulated
```

## `agents`

Stores the receptionist configuration.

This is where the “agent lives.”

The agent is not a separate model. It is a saved config attached to an address.

## `conversations`

Stores each visitor interaction.

## `messages`

Stores the actual chat messages.

## `notifications`

Stores summary emails sent to the owner.

## `audit_events`

Useful for debugging, abuse, admin review, and later compliance.

---

# 4. Example record for `adi.dial`

## Address

```json
{
  "normalized_name": "adi",
  "display_address": "adi.dial",
  "status": "active"
}
```

## Agent

```json
{
  "owner_name": "Adi",
  "receptionist_name": "Adi Receptionist",
  "owner_bio": "Adi works on onchain business systems, tokenization, and AI infrastructure.",
  "greeting": "Hi, I’m Adi’s receptionist. I can take a message and forward a summary to him.",
  "forwarding_email": "adi@example.com",
  "active": true
}
```

## Intake config

Store this in `agents.intake_config`:

```json
{
  "required_fields": [
    "visitor_name",
    "visitor_contact",
    "topic",
    "desired_next_step"
  ],
  "optional_fields": [
    "organization",
    "urgency",
    "deadline",
    "links"
  ]
}
```

## Routing config

Store this in `agents.routing_config`:

```json
{
  "default_route": "email",
  "email": "adi@example.com",
  "send_summary_on_completion": true
}
```

---

# 5. First queries you will need

## Check if address is available

```sql
select *
from addresses
where normalized_name = 'adi'
  and status in ('checkout_started', 'reserved_beta', 'active', 'suspended');
```

If no row returns, the address is available.

---

## Claim address after fake checkout

```sql
insert into addresses (
    normalized_name,
    display_address,
    owner_user_id,
    status,
    reserved_at
)
values (
    'adi',
    'adi.dial',
    'USER_ID_HERE',
    'reserved_beta',
    now()
)
returning *;
```

---

## Create receptionist

```sql
insert into agents (
    owner_user_id,
    address_id,
    owner_name,
    receptionist_name,
    owner_bio,
    greeting,
    forwarding_email,
    active
)
values (
    'USER_ID_HERE',
    'ADDRESS_ID_HERE',
    'Adi',
    'Adi Receptionist',
    'Adi works on onchain business systems, tokenization, and AI infrastructure.',
    'Hi, I’m Adi’s receptionist. I can take a message and forward a summary to him.',
    'adi@example.com',
    true
)
returning *;
```

---

## Load public agent page

```sql
select
    a.display_address,
    ag.owner_name,
    ag.receptionist_name,
    ag.owner_bio,
    ag.greeting,
    ag.active
from addresses a
join agents ag on ag.address_id = a.id
where a.normalized_name = 'adi'
  and a.status = 'active'
  and ag.active = true;
```

---

## Load conversation with messages

```sql
select *
from messages
where conversation_id = 'CONVERSATION_ID_HERE'
order by created_at asc;
```

---

# 6. What not to add yet

Do not add tables for these yet:

```text
wallets
tokens
calendar_integrations
telegram_bots
DIDs
credentials
teams
organizations
webhooks
files
```

Add those only after the basic receptionist flow works.

For now, this schema is enough to build:

```text
I created adi.dial.
Someone messaged my receptionist.
The receptionist asked useful follow-up questions.
I received a clean summary by email.
```
