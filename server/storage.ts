import { db } from "./db";
import {
  addresses,
  orders,
  agents,
  conversations,
  messages,
  notifications,
  auditEvents,
  type Address,
  type Order,
  type Agent,
  type Conversation,
  type Message,
  type Notification,
} from "@shared/schema";
import { and, desc, eq, inArray } from "drizzle-orm";

const ACTIVE_ADDRESS_STATUSES = [
  "checkout_started",
  "reserved_beta",
  "active",
  "suspended",
];

export const storage = {
  // ----- Addresses -----
  async getAddressByNormalized(name: string): Promise<Address | undefined> {
    const [row] = await db
      .select()
      .from(addresses)
      .where(eq(addresses.normalizedName, name));
    return row;
  },

  async isAddressAvailable(name: string): Promise<boolean> {
    const [row] = await db
      .select()
      .from(addresses)
      .where(
        and(
          eq(addresses.normalizedName, name),
          inArray(addresses.status, ACTIVE_ADDRESS_STATUSES)
        )
      );
    return !row;
  },

  async createAddress(data: {
    normalizedName: string;
    displayAddress: string;
    ownerUserId: string;
    status?: string;
  }): Promise<Address> {
    const [row] = await db
      .insert(addresses)
      .values({
        normalizedName: data.normalizedName,
        displayAddress: data.displayAddress,
        ownerUserId: data.ownerUserId,
        status: data.status ?? "checkout_started",
      })
      .returning();
    return row;
  },

  async getAddressById(id: string): Promise<Address | undefined> {
    const [row] = await db.select().from(addresses).where(eq(addresses.id, id));
    return row;
  },

  async updateAddress(
    id: string,
    data: Partial<Address>
  ): Promise<Address | undefined> {
    const [row] = await db
      .update(addresses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(addresses.id, id))
      .returning();
    return row;
  },

  async getAddressesByOwner(ownerUserId: string): Promise<Address[]> {
    return db
      .select()
      .from(addresses)
      .where(eq(addresses.ownerUserId, ownerUserId))
      .orderBy(desc(addresses.createdAt));
  },

  // ----- Orders -----
  async createOrder(data: {
    userId: string;
    addressId: string;
    plan: string;
    amountCents: number;
    checkoutType?: string;
    paymentStatus?: string;
  }): Promise<Order> {
    const [row] = await db
      .insert(orders)
      .values({
        userId: data.userId,
        addressId: data.addressId,
        plan: data.plan,
        amountCents: data.amountCents,
        checkoutType: data.checkoutType ?? "fake",
        paymentStatus: data.paymentStatus ?? "simulated",
      })
      .returning();
    return row;
  },

  async getOrderById(id: string): Promise<Order | undefined> {
    const [row] = await db.select().from(orders).where(eq(orders.id, id));
    return row;
  },

  async updateOrder(id: string, data: Partial<Order>): Promise<Order | undefined> {
    const [row] = await db
      .update(orders)
      .set(data)
      .where(eq(orders.id, id))
      .returning();
    return row;
  },

  // ----- Agents -----
  async createAgent(data: typeof agents.$inferInsert): Promise<Agent> {
    const [row] = await db.insert(agents).values(data).returning();
    return row;
  },

  async getAgentById(id: string): Promise<Agent | undefined> {
    const [row] = await db.select().from(agents).where(eq(agents.id, id));
    return row;
  },

  async getAgentByAddressId(addressId: string): Promise<Agent | undefined> {
    const [row] = await db
      .select()
      .from(agents)
      .where(eq(agents.addressId, addressId));
    return row;
  },

  async getAgentsByOwner(ownerUserId: string): Promise<Agent[]> {
    return db
      .select()
      .from(agents)
      .where(eq(agents.ownerUserId, ownerUserId))
      .orderBy(desc(agents.createdAt));
  },

  async updateAgent(id: string, data: Partial<Agent>): Promise<Agent | undefined> {
    const [row] = await db
      .update(agents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(agents.id, id))
      .returning();
    return row;
  },

  // ----- Public agent page -----
  async getPublicAgentByNormalized(name: string): Promise<
    | {
        address: Address;
        agent: Agent;
      }
    | undefined
  > {
    const address = await this.getAddressByNormalized(name);
    if (!address || address.status !== "active") return undefined;
    const agent = await this.getAgentByAddressId(address.id);
    if (!agent || !agent.active) return undefined;
    return { address, agent };
  },

  // Public page = profile + optional receptionist. Viewable when the profile is
  // published OR an active receptionist exists. Excludes addresses still in checkout.
  async getPublicPageByNormalized(name: string): Promise<
    | {
        address: Address;
        agent?: Agent;
      }
    | undefined
  > {
    const address = await this.getAddressByNormalized(name);
    if (!address) return undefined;
    if (["checkout_started", "expired"].includes(address.status))
      return undefined;
    const agent = await this.getAgentByAddressId(address.id);
    const activeAgent = agent && agent.active ? agent : undefined;
    if (!address.profilePublished && !activeAgent) return undefined;
    return { address, agent: activeAgent };
  },

  // ----- Conversations -----
  async createConversation(data: {
    agentId: string;
    addressId: string;
    visitorSessionId?: string;
  }): Promise<Conversation> {
    const [row] = await db
      .insert(conversations)
      .values({
        agentId: data.agentId,
        addressId: data.addressId,
        visitorSessionId: data.visitorSessionId,
        status: "open",
      })
      .returning();
    return row;
  },

  async getConversationById(id: string): Promise<Conversation | undefined> {
    const [row] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    return row;
  },

  async updateConversation(
    id: string,
    data: Partial<Conversation>
  ): Promise<Conversation | undefined> {
    const [row] = await db
      .update(conversations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return row;
  },

  async getConversationsByAgent(agentId: string): Promise<Conversation[]> {
    return db
      .select()
      .from(conversations)
      .where(eq(conversations.agentId, agentId))
      .orderBy(desc(conversations.createdAt));
  },

  async getConversationsByOwner(ownerUserId: string): Promise<Conversation[]> {
    const ownerAgents = await this.getAgentsByOwner(ownerUserId);
    if (ownerAgents.length === 0) return [];
    return db
      .select()
      .from(conversations)
      .where(
        inArray(
          conversations.agentId,
          ownerAgents.map((a) => a.id)
        )
      )
      .orderBy(desc(conversations.createdAt));
  },

  // ----- Messages -----
  async addMessage(data: {
    conversationId: string;
    role: string;
    content: string;
  }): Promise<Message> {
    const [row] = await db.insert(messages).values(data).returning();
    return row;
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  },

  // ----- Notifications -----
  async createNotification(data: {
    conversationId: string;
    agentId: string;
    recipient: string;
    subject: string;
    body: string;
    status?: string;
  }): Promise<Notification> {
    const [row] = await db
      .insert(notifications)
      .values({
        conversationId: data.conversationId,
        agentId: data.agentId,
        recipient: data.recipient,
        subject: data.subject,
        body: data.body,
        status: data.status ?? "pending",
      })
      .returning();
    return row;
  },

  async updateNotification(
    id: string,
    data: Partial<Notification>
  ): Promise<Notification | undefined> {
    const [row] = await db
      .update(notifications)
      .set(data)
      .where(eq(notifications.id, id))
      .returning();
    return row;
  },

  // ----- Audit -----
  async logEvent(data: {
    userId?: string;
    addressId?: string;
    agentId?: string;
    eventType: string;
    eventData?: Record<string, unknown>;
  }): Promise<void> {
    await db.insert(auditEvents).values({
      userId: data.userId,
      addressId: data.addressId,
      agentId: data.agentId,
      eventType: data.eventType,
      eventData: data.eventData ?? {},
    });
  },
};
