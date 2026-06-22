import { Shell, MonoLabel, Corners, DialMark } from "@/components/Shell";

export default function Landing() {
  return (
    <Shell>
      <section className="mx-auto max-w-6xl px-6">
        <div className="pt-10 pb-6 flex items-center justify-between">
          <div className="inline-flex items-center bg-ink text-paper px-3 py-1.5">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
              Proposal · Q3 2026 · Receptionist MVP
            </span>
          </div>
          <span className="hidden md:block mono-label">§ 01.0 — Overview</span>
        </div>

        <div className="relative border border-ink/80 bg-paper/40 px-6 sm:px-12 py-14">
          <Corners />
          <h1 className="text-[18vw] sm:text-[12rem] leading-[0.82] font-black tracking-tighter">
            DI<span className="text-accent">AL</span>
            <span className="text-accent">.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-2xl sm:text-3xl leading-snug font-medium">
            Claim your <span className="font-serif italic">.dial</span> address
            and get an AI receptionist. Visitors leave a message, your
            receptionist asks the right questions, you get a{" "}
            <span className="font-serif italic">clean summary</span> by email.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a href="/api/login" className="btn-solid text-[13px] px-7 py-4">
              Claim your address →
            </a>
            <a href="/a/adi" className="btn-ghost text-[13px] px-7 py-4">
              View a live example
            </a>
          </div>
        </div>

        {/* Spec strip */}
        <div className="mt-px grid grid-cols-2 md:grid-cols-4 border-x border-b border-ink/80">
          {[
            ["Client", "Owners & Founders"],
            ["Author", "DIAL Receptionist"],
            ["Layer", "Address · Agent · Inbox"],
            ["Revision", "v0.1 · MVP"],
          ].map(([k, v]) => (
            <div key={k} className="px-5 py-5 border-r border-ink/15 last:border-r-0">
              <MonoLabel>{k}</MonoLabel>
              <div className="mt-2 font-medium">{v}</div>
            </div>
          ))}
        </div>

        {/* Thesis / how it works */}
        <div className="mt-20">
          <div className="flex items-end gap-4 border-b border-ink/80 pb-4">
            <span className="mono-label">§ 02.0</span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
              How it works
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-ink/15 mt-px border-x border-b border-ink/15">
            {[
              [
                "01",
                "Claim an address",
                "Search for a name, reserve it through a quick beta checkout. adi → adi.dial.",
              ],
              [
                "02",
                "Create a receptionist",
                "Set your name, bio, greeting, and forwarding email. Your public page goes live.",
              ],
              [
                "03",
                "Receive clean summaries",
                "Visitors chat. The receptionist collects context and emails you a structured summary.",
              ],
            ].map(([n, title, body]) => (
              <div key={n} className="bg-paper px-6 py-8">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-accent text-sm">{n}</span>
                  <span className="mono-label">Step</span>
                </div>
                <h3 className="mt-5 text-2xl font-bold">{title}</h3>
                <p className="mt-3 text-muted leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 relative border border-ink/80 px-6 sm:px-12 py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <Corners />
          <div>
            <DialMark className="text-3xl" />
            <p className="mt-3 text-xl max-w-md">
              Your public contact point, handled by an agent that never sleeps.
            </p>
          </div>
          <a href="/api/login" className="btn-solid text-[13px] px-7 py-4">
            Get started →
          </a>
        </div>
      </section>
    </Shell>
  );
}
