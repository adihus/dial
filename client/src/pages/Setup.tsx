import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Shell, MonoLabel, Corners } from "@/components/Shell";
import { apiRequest } from "@/lib/queryClient";

export default function Setup() {
  const { addressId } = useParams<{ addressId: string }>();
  const [, navigate] = useLocation();
  const [form, setForm] = useState({
    owner_name: "",
    receptionist_name: "",
    owner_bio: "",
    greeting: "",
    forwarding_email: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof typeof form, value: string) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "owner_name" && !f.receptionist_name) {
        next.receptionist_name = value ? `${value} Receptionist` : "";
      }
      if (key === "owner_name" && (!f.greeting || f.greeting === "")) {
        // leave greeting to user; placeholder hints below
      }
      return next;
    });
  }

  async function submit() {
    setError(null);
    if (!form.owner_name || !form.receptionist_name || !form.forwarding_email) {
      setError("Owner name, receptionist name, and forwarding email are required.");
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest("POST", "/api/agents", {
        address_id: addressId,
        ...form,
        greeting:
          form.greeting ||
          `Hi, I'm ${form.receptionist_name}. I can take a message and forward a summary to ${form.owner_name}.`,
      });
      navigate("/dashboard");
    } catch (e: any) {
      setError(e.message);
      setSubmitting(false);
    }
  }

  return (
    <Shell>
      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex items-end gap-4 border-b border-ink/80 pb-4">
          <span className="mono-label">§ 04.0</span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            Create your <span className="text-accent">receptionist</span>
          </h1>
        </div>

        <div className="mt-10 relative border border-ink/80 p-6 sm:p-8 space-y-6">
          <Corners />
          <Field
            label="Owner name"
            hint="Who the receptionist works for"
            value={form.owner_name}
            onChange={(v) => set("owner_name", v)}
            placeholder="Adi"
          />
          <Field
            label="Receptionist name"
            value={form.receptionist_name}
            onChange={(v) => set("receptionist_name", v)}
            placeholder="Adi Receptionist"
          />
          <Field
            label="Owner bio"
            hint="Context the receptionist can reference"
            value={form.owner_bio}
            onChange={(v) => set("owner_bio", v)}
            placeholder="Adi works on onchain business systems, tokenization, and AI infrastructure."
            textarea
          />
          <Field
            label="Greeting"
            hint="First message visitors see (optional)"
            value={form.greeting}
            onChange={(v) => set("greeting", v)}
            placeholder={`Hi, I'm ${
              form.receptionist_name || "Adi Receptionist"
            }. I can take a message and forward a summary.`}
            textarea
          />
          <Field
            label="Forwarding email"
            hint="Where summaries are sent"
            value={form.forwarding_email}
            onChange={(v) => set("forwarding_email", v)}
            placeholder="adi@example.com"
            type="email"
          />

          {error && (
            <p className="text-accent font-mono text-sm">Error: {error}</p>
          )}

          <button
            onClick={submit}
            disabled={submitting}
            className="btn-solid px-7 py-4"
          >
            {submitting ? "Publishing…" : "Create receptionist →"}
          </button>
        </div>
      </section>
    </Shell>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = "text",
  textarea = false,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <MonoLabel>{label}</MonoLabel>
        {hint && <span className="text-[11px] text-muted">{hint}</span>}
      </div>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="field mt-2 resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="field mt-2"
        />
      )}
    </label>
  );
}
