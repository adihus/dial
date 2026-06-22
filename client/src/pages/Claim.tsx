import { useState } from "react";
import { useLocation } from "wouter";
import { Shell, MonoLabel, Corners } from "@/components/Shell";
import { apiRequest } from "@/lib/queryClient";

type CheckResult = {
  available: boolean;
  display_address: string;
  reason?: string;
};

const PLANS = [
  {
    id: "free_beta",
    name: "Free Beta",
    price: "$0",
    desc: "Reserve address + create receptionist during beta.",
    tag: "Recommended",
  },
  {
    id: "personal_beta",
    name: "Personal — Test checkout",
    price: "$9/mo",
    desc: "AI receptionist + email summaries. Beta — no payment processed.",
    tag: "Simulated",
  },
];

export default function Claim() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [plan, setPlan] = useState("free_beta");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function check() {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return;
    setChecking(true);
    setResult(null);
    setError(null);
    try {
      const res: CheckResult = await apiRequest("POST", "/api/addresses/check", {
        address: normalized,
      });
      setResult(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setChecking(false);
    }
  }

  async function reserve() {
    if (!result?.available) return;
    setSubmitting(true);
    setError(null);
    try {
      const start = await apiRequest("POST", "/api/checkout/start", {
        address: query.trim().toLowerCase(),
        plan,
      });
      const complete = await apiRequest("POST", "/api/checkout/complete", {
        checkout_id: start.checkout_id,
      });
      navigate(`/registered/${complete.address_id}`);
    } catch (e: any) {
      setError(e.message);
      setSubmitting(false);
    }
  }

  return (
    <Shell>
      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex items-end gap-4 border-b border-ink/80 pb-4">
          <span className="mono-label">§ 03.0</span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            Claim an <span className="text-accent">address</span>
          </h1>
        </div>

        <div className="mt-10 relative border border-ink/80 p-6 sm:p-8">
          <Corners />
          <MonoLabel>Step 01 — Search availability</MonoLabel>
          <div className="mt-4 flex items-stretch gap-0 border border-ink/30 focus-within:border-ink">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && check()}
              placeholder="adi"
              className="flex-1 bg-transparent px-4 py-3 text-2xl font-bold focus:outline-none lowercase"
            />
            <span className="flex items-center px-4 text-2xl font-bold text-muted border-l border-ink/20 select-none">
              .dial
            </span>
          </div>
          <button
            onClick={check}
            disabled={checking || !query.trim()}
            className="btn-solid mt-4"
          >
            {checking ? "Checking…" : "Check availability"}
          </button>

          {result && (
            <div
              className={`mt-6 border px-5 py-4 ${
                result.available
                  ? "border-ink bg-ink text-paper"
                  : "border-accent text-accent"
              }`}
            >
              <span className="font-mono text-sm">
                {result.available ? "✓ AVAILABLE" : "✕ UNAVAILABLE"}
              </span>
              <div className="mt-1 text-xl font-bold">{result.display_address}</div>
              {result.reason && (
                <div className="mt-1 text-sm opacity-80">{result.reason}</div>
              )}
            </div>
          )}
        </div>

        {result?.available && (
          <div className="mt-px relative border border-ink/80 border-t-0 p-6 sm:p-8">
            <MonoLabel>Step 02 — Choose a plan</MonoLabel>
            <div className="mt-4 grid sm:grid-cols-2 gap-px bg-ink/15 border border-ink/15">
              {PLANS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlan(p.id)}
                  className={`text-left p-5 transition-colors ${
                    plan === p.id ? "bg-ink text-paper" : "bg-paper hover:bg-paper/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">{p.name}</span>
                    <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">
                      {p.tag}
                    </span>
                  </div>
                  <div className="mt-1 text-2xl font-black">{p.price}</div>
                  <p
                    className={`mt-2 text-sm ${
                      plan === p.id ? "text-paper/70" : "text-muted"
                    }`}
                  >
                    {p.desc}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-ink/15 pt-5">
              <div>
                <MonoLabel>Amount due today</MonoLabel>
                <div className="text-2xl font-black">
                  {plan === "free_beta" ? "$0" : "$0 — beta"}
                </div>
              </div>
              <button
                onClick={reserve}
                disabled={submitting}
                className="btn-solid px-7 py-4"
              >
                {submitting ? "Reserving…" : `Reserve ${result.display_address} →`}
              </button>
            </div>
            <p className="mt-3 mono-label">
              This is a beta checkout. No payment will be processed.
            </p>
          </div>
        )}

        {error && (
          <p className="mt-4 text-accent font-mono text-sm">Error: {error}</p>
        )}
      </section>
    </Shell>
  );
}
