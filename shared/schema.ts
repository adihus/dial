import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Replit Auth tables (users + sessions)
export * from "./models/auth";
import { users } from "./models/auth";

// ADDRESSES
export const addresses = pgTable(
  "addresses",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    normalizedName: text("normalized_name").notNull().unique(),
    displayAddress: text("display_address").notNull().unique(),
    ownerUserId: varcharRef("owner_user_id"),
    status: text("status").notNull().default("checkout_started"),
    profileName: text("profile_name"),
    profileHeadline: text("profile_headline"),
    profileBio: text("profile_bio"),
    profileLinks: jsonb("profile_links")
      .$type<{ label: string; url: string }[]>()
      .notNull()
      .default([]),
    profilePublished: boolean("profile_published").notNull().default(false),
    reservedAt: timestamp("reserved_at"),
    activatedAt: timestamp("activated_at"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_addresses_owner_user_id").on(t.ownerUserId),
    index("idx_addresses_status").on(t.status),
  ]
);

// ORDERS / FAKE CHECKOUT
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varcharRef("user_id").notNull(),
    addressId: uuid("address_id")
      .notNull()
      .references(() => addresses.id, { onDelete: "cascade" }),
    plan: text("plan").notNull().default("personal_beta"),
    amountCents: integer("amount_cents").notNull().default(0),
    currency: text("currency").notNull().default("USD"),
    checkoutType: text("checkout_type").notNull().default("fake"),
    paymentStatus: text("payment_status").notNull().default("simulated"),
    provider: text("provider"),
    providerCheckoutId: text("provider_checkout_id"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_orders_user_id").on(t.userId),
    index("idx_orders_address_id").on(t.addressId),
  ]
);

// RECEPTIONIST AGENTS
export const agents = pgTable(
  "agents",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    ownerUserId: varcharRef("owner_user_id").notNull(),
    addressId: uuid("address_id")
      .notNull()
      .unique()
      .references(() => addresses.id, { onDelete: "cascade" }),
    ownerName: text("owner_name").notNull(),
    receptionistName: text("receptionist_name").notNull(),
    ownerBio: text("owner_bio"),
    greeting: text("greeting"),
    instructions: text("instructions"),
    forwardingEmail: text("forwarding_email").notNull(),
    active: boolean("active").notNull().default(false),
    intakeConfig: jsonb("intake_config").notNull().default({}),
    routingConfig: jsonb("routing_config").notNull().default({}),
    modelConfig: jsonb("model_config").notNull().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_agents_owner_user_id").on(t.ownerUserId),
    index("idx_agents_address_id").on(t.addressId),
  ]
);

// CONVERSATIONS
export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    addressId: uuid("address_id")
      .notNull()
      .references(() => addresses.id, { onDelete: "cascade" }),
    visitorSessionId: text("visitor_session_id"),
    visitorName: text("visitor_name"),
    visitorContact: text("visitor_contact"),
    visitorEmail: text("visitor_email"),
    visitorOrganization: text("visitor_organization"),
    topic: text("topic"),
    urgency: text("urgency"),
    status: text("status").notNull().default("open"),
    summary: text("summary"),
    suggestedNextStep: text("suggested_next_step"),
    summaryGeneratedAt: timestamp("summary_generated_at"),
    emailSentAt: timestamp("email_sent_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_conversations_agent_id").on(t.agentId),
    index("idx_conversations_address_id").on(t.addressId),
    index("idx_conversations_status").on(t.status),
    index("idx_conversations_created_at").on(t.createdAt),
  ]
);

// MESSAGES
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    content: text("content").notNull(),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_messages_conversation_id").on(t.conversationId),
    index("idx_messages_created_at").on(t.createdAt),
  ]
);

// NOTIFICATIONS
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    type: text("type").notNull().default("email"),
    recipient: text("recipient").notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    status: text("status").notNull().default("pending"),
    providerMessageId: text("provider_message_id"),
    errorMessage: text("error_message"),
    sentAt: timestamp("sent_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_notifications_conversation_id").on(t.conversationId),
    index("idx_notifications_status").on(t.status),
  ]
);

// AUDIT EVENTS
export const auditEvents = pgTable("audit_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varcharRef("user_id"),
  addressId: uuid("address_id").references(() => addresses.id, {
    onDelete: "set null",
  }),
  agentId: uuid("agent_id").references(() => agents.id, { onDelete: "set null" }),
  eventType: text("event_type").notNull(),
  eventData: jsonb("event_data").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Helper: users.id is varchar, define matching foreign key column
function varcharRef(name: string) {
  return text(name).references(() => users.id, { onDelete: "set null" });
}

// Insert schemas
export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Address = typeof addresses.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Agent = typeof agents.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type AuditEvent = typeof auditEvents.$inferSelect;

export const URGENCY_VALUES = ["low", "medium", "high", "unknown"] as const;
export const CONVERSATION_STATUSES = [
  "open",
  "collecting_info",
  "ready_for_summary",
  "summarized",
  "emailed",
  "closed",
  "failed",
] as const;
