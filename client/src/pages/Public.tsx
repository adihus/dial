import { useEffect, useRef, useState } from "react";
import { useParams } from "wouter";
import { DialMark, Corners } from "@/components/Shell";
import { apiRequest } from "@/lib/queryClient";

type ProfileLink = { label: string; url: string };

type Receptionist = {
  agent_id: string;
  receptionist_name: string;
  owner_name: string;
  greeting: string;
};

type PageInfo = {
  display_address: string;
  profile: {
    name: string;
    headline: string | null;
    bio: string | null;
    links: ProfileLink[];
    published: boolean;
  };
  receptionist: Receptionist | null;
};

type Msg = { role: "assistant" | "user"; content: string };

function isSafeUrl(url: string): boolean {
  try {
    const p = new URL(url);
    return p.protocol === "http:" || p.protocol === "https:";
  } catch {
    return false;
  }
}

export default function Public() {
  const { name } = useParams<{ name: string }>();
  const [page, setPage] = useState<PageInfo | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [completed, setCompleted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const info: PageInfo = await apiRequest(
          "GET",
          `/api/public/${encodeURIComponent(name)}`
        );
        setPage(info);
        if (info.receptionist) {
          setMessages([
            { role: "assistant", content: info.receptionist.greeting },
          ]);
        }
      } catch {
        setNotFound(true);
      }
    })();
  }, [name]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, sending]);

  async function send() {
    const text = input.trim();
    const agent = page?.receptionist;
    if (!text || sending || completed || !agent) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setSending(true);
    try {
      const res = await apiRequest("POST", "/api/public/message", {
        agent_id: agent.agent_id,
        conversation_id: conversationId,
        session_token: sessionToken,
        message: text,
      });
      if (res.conversation_id) setConversationId(res.conversation_id);
      if (res.session_token) setSessionToken(res.session_token);
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
      if (res.completed) setCompleted(true);
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Sorry — something went wrong. Please try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  if (notFound) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center px-6">
        <div className="relative border border-ink/80 px-10 py-16 text-center bg-paper">
          <Corners />
          <span className="mono-label">Error · 404</span>
          <h1 className="mt-4 text-5xl font-black">Nothing here yet.</h1>
          <p className="mt-3 text-muted">
            <span className="font-mono">{name}.dial</span> is not active.
          </p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center">
        <span className="mono-label">Loading…</span>
      </div>
    );
  }

  const { profile, receptionist } = page;

  return (
    <div className="min-h-screen grid-bg flex flex-col">
      <header className="border-b border-ink/80">
        <div className="mx-auto max-w-3xl w-full px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <DialMark className="text-xl" />
          </a>
          <span className="mono-label">{page.display_address}</span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl w-full px-6 flex-1 flex flex-col py-8">
        {/* Profile card */}
        <div className="relative border border-ink/80 p-6 sm:p-8">
          <Corners />
          <span className="mono-label">Profile · {page.display_address}</span>
          <h1 className="mt-3 text-4xl font-black tracking-tight">
            {profile.name}
          </h1>
          {profile.headline && (
            <p className="mt-2 font-serif italic text-lg text-ink/80">
              {profile.headline}
            </p>
          )}
          {profile.bio && (
            <p className="mt-4 text-sm leading-relaxed border-t border-ink/15 pt-4 max-w-xl whitespace-pre-wrap">
              {profile.bio}
            </p>
          )}
          {(() => {
            const safeLinks = (profile.links ?? []).filter((l) =>
              isSafeUrl(l.url)
            );
            if (safeLinks.length === 0) return null;
            return (
              <div className="mt-5 flex flex-wrap gap-2">
                {safeLinks.map((l, i) => (
                  <a
                    key={i}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn-ghost"
                  >
                    {l.label} ↗
                  </a>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Chat — only when a receptionist exists */}
        {receptionist ? (
          <>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="mono-label">Receptionist · on duty</span>
              <span className="font-bold">{receptionist.receptionist_name}</span>
            </div>
            <div className="mt-3 flex-1 flex flex-col border border-ink/15 bg-paper/40 min-h-[320px]">
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3"
              >
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      m.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-ink text-paper"
                          : "bg-paper border border-ink/20"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className="px-4 py-3 bg-paper border border-ink/20">
                      <span className="mono-label animate-pulse">typing…</span>
                    </div>
                  </div>
                )}
              </div>

              {completed ? (
                <div className="border-t border-ink/15 p-5 text-center">
                  <span className="mono-label">✓ Message sent</span>
                  <p className="mt-2 text-sm text-muted">
                    Your message has been summarized and forwarded to{" "}
                    {receptionist.owner_name}. Thank you.
                  </p>
                </div>
              ) : (
                <div className="border-t border-ink/15 p-3 flex items-end gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    placeholder="Type your message…"
                    rows={1}
                    className="flex-1 bg-transparent px-3 py-2 text-base focus:outline-none resize-none"
                  />
                  <button
                    onClick={send}
                    disabled={sending || !input.trim()}
                    className="btn-solid"
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
            <p className="mt-3 mono-label text-center">
              You're chatting with an AI receptionist. It collects messages — it
              does not speak for {receptionist.owner_name}.
            </p>
          </>
        ) : (
          <div className="mt-6 border border-ink/15 px-6 py-10 text-center">
            <span className="mono-label">No receptionist on duty</span>
            <p className="mt-2 text-sm text-muted">
              {profile.name} hasn't set up a receptionist yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
