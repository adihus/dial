import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Shell, MonoLabel, Corners } from "@/components/Shell";

type Message = { role: string; content: string; created_at: string };

type ConversationDetail = {
  conversation: {
    id: string;
    visitor_name: string | null;
    visitor_email: string | null;
    status: string;
    summary: string | null;
    created_at: string;
  };
  agent: { receptionist_name: string; owner_name: string };
  address: { display_address: string };
  messages: Message[];
};

export default function ConversationView() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery<ConversationDetail>({
    queryKey: [`/api/me/conversations/${id}`],
  });

  return (
    <Shell>
      <section className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/dashboard" className="mono-label hover:text-ink">
          ← Back to desk
        </Link>

        {isLoading ? (
          <p className="mt-8 mono-label">Loading…</p>
        ) : !data ? (
          <p className="mt-8 mono-label">Not found.</p>
        ) : (
          <>
            <div className="mt-4 relative border border-ink/80 p-6 sm:p-8">
              <Corners />
              <div className="flex items-center justify-between">
                <MonoLabel>Message summary</MonoLabel>
                <span className="mono-label">
                  {data.address.display_address}
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-tight">
                {data.conversation.visitor_name || "Anonymous visitor"}
              </h1>
              {data.conversation.visitor_email && (
                <p className="mt-1 font-mono text-sm text-muted">
                  {data.conversation.visitor_email}
                </p>
              )}

              <div className="mt-6 border-t border-ink/15 pt-5">
                {data.conversation.summary ? (
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {data.conversation.summary}
                  </p>
                ) : (
                  <p className="text-muted">
                    This conversation has no summary yet.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8">
              <MonoLabel>Transcript</MonoLabel>
              <div className="mt-3 space-y-3">
                {data.messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      m.role === "visitor" || m.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === "visitor" || m.role === "user"
                          ? "bg-ink text-paper"
                          : "bg-paper border border-ink/20"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </section>
    </Shell>
  );
}
