// src/app/page.tsx
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-void noise scanlines flex flex-col overflow-hidden">
      {/* ── Background ────────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[800px] h-[800px] -translate-y-1/2 translate-x-1/3 opacity-[0.04] rounded-full"
          style={{ background: "radial-gradient(circle, var(--amber) 0%, transparent 65%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] translate-y-1/2 -translate-x-1/3 opacity-[0.03] rounded-full"
          style={{ background: "radial-gradient(circle, var(--amber) 0%, transparent 65%)" }}
        />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--border-bright) 1px, transparent 1px), linear-gradient(90deg, var(--border-bright) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 relative">
            <div className="absolute inset-0 border border-amber rounded-sm animate-spin-slow opacity-50" />
            <div className="absolute inset-1 bg-amber rounded-sm" />
          </div>
          <span className="font-display font-bold text-ash tracking-wider text-sm">
            Innr<span className="text-amber">Crcl</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs tracking-[0.2em] uppercase text-muted hover:text-amber transition-colors font-code"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="text-xs tracking-[0.2em] uppercase bg-amber text-void font-bold px-4 py-2 rounded hover:bg-amber-dim transition-colors font-code"
          >
            Join Now
          </Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center py-20">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 border border-amber/20 rounded-full px-4 py-1.5 mb-10 animate-fade-up"
          style={{ background: "rgba(240,192,64,0.05)" }}
        >
          <span className="w-1.5 h-1.5 bg-amber rounded-full animate-pulse-amber" />
          <span className="text-xs text-amber tracking-[0.2em] uppercase font-code">
            Exclusively @gla.ac.in
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-display font-extrabold text-5xl md:text-7xl leading-[0.95] tracking-tight text-ash mb-6 animate-fade-up delay-100">
          Speak freely.<br />
          <span className="text-amber text-glow">Stay hidden.</span>
        </h1>

        <p className="max-w-md text-base text-muted leading-relaxed mb-12 animate-fade-up delay-200 font-code">
          Your campus voice — verified, anonymous, unchained.
          Share thoughts, confessions, opinions without revealing who you are.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-up delay-300">
          <Link
            href="/signup"
            className="font-code text-sm tracking-[0.15em] uppercase bg-amber text-void font-bold px-8 py-3.5 rounded hover:bg-amber-dim transition-colors glow-amber"
          >
            Get Access →
          </Link>
          <Link
            href="/login"
            className="font-code text-sm tracking-[0.15em] uppercase border border-border-bright text-ash px-8 py-3.5 rounded hover:border-amber hover:text-amber transition-colors"
          >
            Already in? Login
          </Link>
        </div>
      </section>

      {/* ── Features grid ─────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 pb-20 max-w-4xl mx-auto w-full animate-fade-up delay-400">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: "◈",
              title: "Truly Anonymous",
              desc: "You're assigned a random handle. Nobody links it to your real email.",
            },
            {
              icon: "◉",
              title: "Verified Circle",
              desc: "Only verified campus accounts. A real community, not bots.",
            },
            {
              icon: "◎",
              title: "OTP Secured",
              desc: "Email OTP + hashed passwords. Your account is properly protected.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="border border-border rounded-lg p-6 group hover:border-amber/40 transition-colors"
              style={{ background: "var(--surface)" }}
            >
              <span className="text-amber text-2xl font-code block mb-3 group-hover:text-glow transition-all">
                {f.icon}
              </span>
              <h3 className="font-display font-bold text-ash text-sm mb-2">{f.title}</h3>
              <p className="text-xs text-muted leading-relaxed font-code">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-border px-8 py-5 flex items-center justify-between">
        <span className="text-xs text-muted tracking-widest font-code">
          INNR CRCL · MVP v0.1
        </span>
        <span className="text-xs text-muted font-code">
          GLA University, Mathura
        </span>
      </footer>
    </main>
  );
}
