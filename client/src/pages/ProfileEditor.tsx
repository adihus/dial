import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Shell, MonoLabel, Corners } from "@/components/Shell";
import { apiRequest, queryClient } from "@/lib/queryClient";

type ProfileLink = { label: string; url: string };

type AddressDetail = {
  id: string;
  display_address: string;
  name: string;
  status: string;
  has_agent: boolean;
  profile: {
    name: string;
    headline: string;
    bio: string;
    links: ProfileLink[];
    published: boolean;
  };
};

export default function ProfileEditor() {
  const { addressId } = useParams<{ addressId: string }>();
  const [, navigate] = useLocation();

  const { data, isLoading, isError } = useQuery<AddressDetail>({
    queryKey: [`/api/me/addresses/${addressId}`],
  });

  const [form, setForm] = useState({
    name: "",
    headline: "",
    bio: "",
    published: false,
  });
  const [links, setLinks] = useState<ProfileLink[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        name: data.profile.name,
        headline: data.profile.headline,
        bio: data.profile.bio,
        published: data.profile.published,
      });
      setLinks(data.profile.links ?? []);
    }
  }, [data]);

  function set(key: keyof typeof form, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  function setLink(i: number, key: keyof ProfileLink, value: string) {
    setLinks((ls) => ls.map((l, idx) => (idx === i ? { ...l, [key]: value } : l)));
    setSaved(false);
  }

  function addLink() {
    setLinks((ls) => [...ls, { label: "", url: "" }]);
  }

  function removeLink(i: number) {
    setLinks((ls) => ls.filter((_, idx) => idx !== i));
  }

  async function save(publishOverride?: boolean) {
    setError(null);
    const cleanLinks = links
      .map((l) => ({ label: l.label.trim(), url: l.url.trim() }))
      .filter((l) => l.label && l.url);
    if (cleanLinks.length !== links.filter((l) => l.label || l.url).length) {
      setError("Each link needs both a label and a URL.");
      return;
    }
    const badLink = cleanLinks.find((l) => {
      try {
        const p = new URL(l.url);
        return p.protocol !== "http:" && p.protocol !== "https:";
      } catch {
        return true;
      }
    });
    if (badLink) {
      setError(
        `"${badLink.label}" must be a valid http(s) URL (e.g. https://example.com).`
      );
      return;
    }
    const published =
      publishOverride !== undefined ? publishOverride : form.published;
    setSaving(true);
    try {
      await apiRequest("PUT", `/api/me/addresses/${addressId}/profile`, {
        name: form.name.trim(),
        headline: form.headline.trim(),
        bio: form.bio.trim(),
        links: cleanLinks,
        published,
      });
      setForm((f) => ({ ...f, published }));
      setLinks(cleanLinks);
      setSaved(true);
      queryClient.invalidateQueries({
        queryKey: [`/api/me/addresses/${addressId}`],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/me/dashboard"] });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (isError) {
    return (
      <Shell>
        <section className="mx-auto max-w-2xl px-6 py-24 text-center">
          <span className="mono-label">Error · 404</span>
          <h1 className="mt-4 text-4xl font-black">Address not found.</h1>
          <Link href="/dashboard" className="btn-solid mt-8">
            Back to your desk →
          </Link>
        </section>
      </Shell>
    );
  }

  if (isLoading || !data) {
    return (
      <Shell>
        <section className="mx-auto max-w-3xl px-6 py-24">
          <span className="mono-label animate-pulse">Loading…</span>
        </section>
      </Shell>
    );
  }

  const publicSlug = data.display_address.replace(/\.dial$/, "");

  return (
    <Shell>
      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex items-end gap-4 border-b border-ink/80 pb-4">
          <span className="mono-label">§ 04.1</span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            Your <span className="text-accent">address page</span>
          </h1>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="mono-label">{data.display_address}</span>
          <a
            href={`/a/${publicSlug}`}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost"
          >
            View public page ↗
          </a>
          <span
            className={`font-mono text-[10px] uppercase tracking-widest ${
              form.published ? "text-accent" : "text-muted"
            }`}
          >
            {form.published ? "● Published" : "○ Draft"}
          </span>
        </div>

        <div className="mt-8 relative border border-ink/80 p-6 sm:p-8 space-y-6">
          <Corners />
          <Field
            label="Display name"
            hint="Shown at the top of your page"
            value={form.name}
            onChange={(v) => set("name", v)}
            placeholder="Adi Mehta"
          />
          <Field
            label="Headline"
            hint="A short tagline (optional)"
            value={form.headline}
            onChange={(v) => set("headline", v)}
            placeholder="Building onchain business systems"
          />
          <Field
            label="About"
            hint="A few sentences about you"
            value={form.bio}
            onChange={(v) => set("bio", v)}
            placeholder="Adi works on onchain business systems, tokenization, and AI infrastructure."
            textarea
          />

          <div>
            <div className="flex items-baseline justify-between">
              <MonoLabel>Links</MonoLabel>
              <span className="text-[11px] text-muted">
                Socials, website, anything (up to 10)
              </span>
            </div>
            <div className="mt-2 space-y-2">
              {links.length === 0 && (
                <p className="text-sm text-muted">No links yet.</p>
              )}
              {links.map((l, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={l.label}
                    onChange={(e) => setLink(i, "label", e.target.value)}
                    placeholder="Label (e.g. Twitter)"
                    className="field flex-1"
                  />
                  <input
                    value={l.url}
                    onChange={(e) => setLink(i, "url", e.target.value)}
                    placeholder="https://…"
                    className="field flex-[2]"
                  />
                  <button
                    onClick={() => removeLink(i)}
                    className="btn-ghost shrink-0"
                    aria-label="Remove link"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            {links.length < 10 && (
              <button onClick={addLink} className="btn-ghost mt-2">
                + Add link
              </button>
            )}
          </div>

          {error && (
            <p className="text-accent font-mono text-sm">Error: {error}</p>
          )}
          {saved && (
            <p className="text-accent font-mono text-sm">✓ Saved.</p>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-ink/15 pt-6">
            <button
              onClick={() => save()}
              disabled={saving}
              className="btn-ghost"
            >
              {saving ? "Saving…" : "Save draft"}
            </button>
            {form.published ? (
              <button
                onClick={() => save(false)}
                disabled={saving}
                className="btn-ghost"
              >
                Unpublish
              </button>
            ) : (
              <button
                onClick={() => save(true)}
                disabled={saving}
                className="btn-solid"
              >
                {saving ? "Publishing…" : "Save & publish →"}
              </button>
            )}
            {!data.has_agent && (
              <button
                onClick={() => navigate(`/setup/${data.id}`)}
                className="btn-ghost ml-auto"
              >
                Add a receptionist →
              </button>
            )}
          </div>
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
  textarea = false,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
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
          rows={4}
          className="field mt-2 resize-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="field mt-2"
        />
      )}
    </label>
  );
}
