import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Shell, MonoLabel, Corners } from "@/components/Shell";

type Address = {
  id: string;
  display_address: string;
  status: string;
  profile_published: boolean;
};

type Agent = {
  id: string;
  address_id: string;
  receptionist_name: string;
  owner_name: string;
};

type Conversation = {
  id: string;
  agent_id: string;
  visitor_name: string | null;
  status: string;
  summary: string | null;
  created_at: string;
};

type DashboardData = {
  addresses: Address[];
  agents: Agent[];
  conversations: Conversation[];
};

export default function Dashboard() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/me/dashboard"],
  });

  const addresses = data?.addresses ?? [];
  const agents = data?.agents ?? [];
  const conversations = data?.conversations ?? [];

  const agentById = new Map(agents.map((a) => [a.id, a]));
  const addressByAgent = new Map(
    agents.map((a) => [a.id, addresses.find((ad) => ad.id === a.address_id)])
  );
  const agentByAddress = new Map(agents.map((a) => [a.address_id, a]));

  return (
    <Shell>
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-ink/80 pb-4">
          <div className="flex items-end gap-4">
            <span className="mono-label">§ 05.0</span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
              Your <span className="text-accent">desk</span>
            </h1>
          </div>
          <Link href="/claim" className="btn-solid">
            + Claim address
          </Link>
        </div>

        {isLoading ? (
          <p className="mt-10 mono-label">Loading…</p>
        ) : (
          <>
            {/* Addresses */}
            <div className="mt-10">
              <MonoLabel>Addresses & receptionists</MonoLabel>
              {addresses.length === 0 ? (
                <div className="relative border border-ink/80 mt-3 px-8 py-12 text-center">
                  <Corners />
                  <p className="text-xl font-bold">No addresses yet.</p>
                  <p className="mt-2 text-muted">
                    Claim your first <span className="font-serif italic">.dial</span>{" "}
                    address to get started.
                  </p>
                  <Link href="/claim" className="btn-solid mt-6">
                    Claim an address →
                  </Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-px bg-ink/15 mt-3 border border-ink/15">
                  {addresses.map((ad) => {
                    const agent = agentByAddress.get(ad.id);
                    return (
                      <div key={ad.id} className="bg-paper p-6">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-black">
                            {ad.display_address}
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                            {ad.status}
                          </span>
                        </div>
                        {agent ? (
                          <div className="mt-4 flex items-center justify-between">
                            <div>
                              <MonoLabel>Receptionist</MonoLabel>
                              <div className="font-medium">
                                {agent.receptionist_name}
                              </div>
                            </div>
                            <a
                              href={`/a/${ad.display_address.replace(".dial", "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-ghost"
                            >
                              View page ↗
                            </a>
                          </div>
                        ) : (
                          <div className="mt-3">
                            <MonoLabel>No receptionist yet</MonoLabel>
                          </div>
                        )}
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {!agent && (
                            <Link
                              href={`/setup/${ad.id}`}
                              className="btn-solid"
                            >
                              Set up receptionist →
                            </Link>
                          )}
                          <Link href={`/page/${ad.id}`} className="btn-ghost">
                            Edit page
                          </Link>
                          <span
                            className={`font-mono text-[10px] uppercase tracking-widest ${
                              ad.profile_published ? "text-accent" : "text-muted"
                            }`}
                          >
                            {ad.profile_published ? "● Published" : "○ Draft"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Inbox */}
            <div className="mt-16">
              <MonoLabel>Inbox — message summaries</MonoLabel>
              {conversations.length === 0 ? (
                <div className="border border-ink/15 mt-3 px-8 py-12 text-center">
                  <p className="text-muted">
                    No messages yet. Summaries appear here when visitors reach out.
                  </p>
                </div>
              ) : (
                <div className="border border-ink/15 mt-3 divide-y divide-ink/10">
                  {conversations.map((c) => {
                    const agent = agentById.get(c.agent_id);
                    const addr = addressByAgent.get(c.agent_id);
                    return (
                      <Link
                        key={c.id}
                        href={`/inbox/${c.id}`}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-ink/[0.03] transition-colors"
                      >
                        <span
                          className={`w-2 h-2 shrink-0 rounded-full ${
                            c.status === "completed"
                              ? "bg-accent"
                              : "bg-ink/30"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-bold truncate">
                              {c.visitor_name || "Anonymous visitor"}
                            </span>
                            {addr && (
                              <span className="mono-label shrink-0">
                                {addr.display_address}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted truncate">
                            {c.summary
                              ? c.summary.split("\n")[0]
                              : "In progress…"}
                          </p>
                        </div>
                        <span className="mono-label shrink-0 hidden sm:block">
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </Shell>
  );
}
