import { Link } from "wouter";
import { Shell, Corners } from "@/components/Shell";

export default function NotFound() {
  return (
    <Shell>
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="relative border border-ink/80 px-8 py-16 text-center">
          <Corners />
          <span className="mono-label">Error · 404</span>
          <h1 className="mt-6 text-7xl font-black tracking-tight">
            Not <span className="text-accent">found</span>.
          </h1>
          <p className="mt-4 text-muted">
            This page or address does not exist.
          </p>
          <Link href="/" className="btn-solid mt-8">
            ← Back home
          </Link>
        </div>
      </section>
    </Shell>
  );
}
