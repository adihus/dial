import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Shell, MonoLabel, Corners } from "@/components/Shell";

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
    links: { label: string; url: string }[];
    published: boolean;
  };
};

export default function Registered() {
  const { addressId } = useParams<{ addressId: string }>();
  const [, navigate] = useLocation();
  const [revealed, setRevealed] = useState(false);

  const { data, isError } = useQuery<AddressDetail>({
    queryKey: [`/api/me/addresses/${addressId}`],
  });

  // Hold the loading state briefly for a deliberate confirmation beat.
  useEffect(() => {
    if (data && !revealed) {
      const t = setTimeout(() => setRevealed(true), 1100);
      return () => clearTimeout(t);
    }
  }, [data, revealed]);

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

  if (!data || !revealed) {
    return (
      <Shell>
        <section className="mx-auto max-w-2xl px-6 py-32 text-center">
          <div className="relative inline-flex flex-col items-center">
            <span className="mono-label animate-pulse">
              Registering address…
            </span>
            <div className="mt-6 h-1 w-48 bg-ink/15 overflow-hidden">
              <div className="h-full w-1/2 bg-accent animate-pulse" />
            </div>
            {data && (
              <p className="mt-6 text-2xl font-black">{data.display_address}</p>
            )}
          </div>
        </section>
      </Shell>
    );
  }

  return (
    <Shell>
      <section className="mx-auto max-w-3xl px-6 py-16">
        {/* Success banner */}
        <div className="relative border border-ink/80 p-8 text-center">
          <Corners />
          <span className="mono-label text-accent">✓ Registered</span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight">
            {data.display_address} is yours.
          </h1>
          <p className="mt-3 text-muted max-w-lg mx-auto">
            Your beta address is reserved. Choose what to set up first — you can
            always do the other later from your desk.
          </p>
        </div>

        {/* Choices */}
        <div className="mt-8 grid sm:grid-cols-2 gap-px bg-ink/15 border border-ink/15">
          <button
            onClick={() => navigate(`/setup/${data.id}`)}
            className="bg-paper p-7 text-left hover:bg-ink/[0.03] transition-colors group"
          >
            <MonoLabel>Option A</MonoLabel>
            <h2 className="mt-2 text-2xl font-black">
              Set up your <span className="text-accent">receptionist</span>
            </h2>
            <p className="mt-2 text-sm text-muted">
              Create an AI receptionist that takes messages from visitors and
              emails you clean summaries.
            </p>
            <span className="mt-5 inline-block btn-solid group-hover:translate-x-0.5 transition-transform">
              Create receptionist →
            </span>
          </button>

          <button
            onClick={() => navigate(`/page/${data.id}`)}
            className="bg-paper p-7 text-left hover:bg-ink/[0.03] transition-colors group"
          >
            <MonoLabel>Option B</MonoLabel>
            <h2 className="mt-2 text-2xl font-black">
              Set up your <span className="text-accent">address page</span>
            </h2>
            <p className="mt-2 text-sm text-muted">
              Build your public profile — name, bio, and links. Visitors can read
              it and message your receptionist from the same page.
            </p>
            <span className="mt-5 inline-block btn-solid group-hover:translate-x-0.5 transition-transform">
              Set up page →
            </span>
          </button>
        </div>

        <div className="mt-8 text-center">
          <Link href="/dashboard" className="btn-ghost">
            Skip — go to my desk
          </Link>
        </div>
      </section>
    </Shell>
  );
}
