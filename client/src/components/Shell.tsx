import { ReactNode } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export function DialMark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-sans font-black tracking-tight ${className}`}>
      DI<span className="text-accent">AL</span>
      <span className="text-accent">.</span>
    </span>
  );
}

export function MonoLabel({ children }: { children: ReactNode }) {
  return <span className="mono-label">{children}</span>;
}

export function Corners() {
  return (
    <>
      <span className="corner left-0 top-0 border-l border-t" />
      <span className="corner right-0 top-0 border-r border-t" />
      <span className="corner left-0 bottom-0 border-l border-b" />
      <span className="corner right-0 bottom-0 border-r border-b" />
    </>
  );
}

export function Shell({
  children,
  docNo = "PRPP-DIAL-26-001",
}: {
  children: ReactNode;
  docNo?: string;
}) {
  const { isAuthenticated, isLoading, logout } = useAuth();

  return (
    <div className="min-h-full grid-bg flex flex-col">
      <header className="border-b border-ink/80">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <DialMark className="text-2xl" />
            <span className="hidden sm:block mono-label border-l border-ink/30 pl-3">
              Receptionist
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden md:block mono-label">DOC № {docNo}</span>
            {!isLoading && isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="btn-ghost hidden sm:inline-flex">
                  Dashboard
                </Link>
                <button onClick={() => logout()} className="btn-ghost">
                  Sign out
                </button>
              </div>
            ) : !isLoading ? (
              <a href="/api/login" className="btn-solid">
                Sign in
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-ink/80 mt-16">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <DialMark className="text-lg" />
            <span className="mono-label">Internal · Draft 0.1</span>
          </div>
          <p className="mono-label max-w-md leading-relaxed">
            This is an AI receptionist platform. Agents collect and summarize
            messages — they do not speak as the owner or make commitments.
          </p>
        </div>
      </footer>
    </div>
  );
}
