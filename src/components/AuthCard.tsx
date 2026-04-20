// src/components/AuthCard.tsx
import { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  badge?: string;
}

export default function AuthCard({ title, subtitle, children, badge }: AuthCardProps) {
  return (
    <div className="min-h-dvh bg-void noise scanlines flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, var(--amber) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative w-full max-w-md animate-fade-up">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <a href="/" className="text-xs tracking-[0.25em] uppercase text-muted hover:text-amber transition-colors">
            ← Innr Crcl
          </a>
          {badge && (
            <span className="text-xs tracking-[0.2em] uppercase text-amber border border-amber/30 px-2 py-0.5 rounded">
              {badge}
            </span>
          )}
        </div>

        {/* Card */}
        <div
          className="border border-border rounded-lg overflow-hidden"
          style={{ background: "var(--surface)" }}
        >
          {/* Header stripe */}
          <div className="h-1 w-full bg-amber" />

          <div className="p-8">
            <h1 className="font-display text-2xl font-bold text-ash mb-1">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted mb-8 font-code">{subtitle}</p>
            )}
            {children}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted mt-6 tracking-wider">
          INNR CRCL · ANONYMOUS PLATFORM
        </p>
      </div>
    </div>
  );
}
