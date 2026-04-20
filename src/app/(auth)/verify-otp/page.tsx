"use client";
// src/app/(auth)/verify-otp/page.tsx
import { Suspense, useState, FormEvent, useEffect, useRef, KeyboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import Button from "@/components/ui/Button";

export default function VerifyOTPPage() {
  return (
    <Suspense
      fallback={
        <AuthCard title="Verify your email" subtitle="Loading verification form..." badge="OTP">
          <div className="h-40" />
        </AuthCard>
      }
    >
      <VerifyOTPForm />
    </Suspense>
  );
}

function VerifyOTPForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  function handleDigitChange(idx: number, val: string) {
    const char = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = char;
    setDigits(next);
    if (char && idx < 5) inputRefs.current[idx + 1]?.focus();
  }

  function handleKeyDown(idx: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    pasted.split("").forEach((c, i) => {
      next[i] = c;
    });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  const otp = digits.join("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (otp.length < 6) {
      setError("Enter all 6 digits.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Verification failed.");
        return;
      }
      setSuccess("Email verified! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1800);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (countdown > 0 || !email) return;
    setResending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not resend OTP.");
        return;
      }
      setCountdown(60);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  }

  if (!email) {
    return (
      <AuthCard title="Invalid Link" subtitle="No email address found.">
        <Link href="/signup" className="text-amber text-sm hover:underline font-code">
          Back to Signup
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Verify your email"
      subtitle={`Enter the 6-digit code sent to ${email}`}
      badge="OTP"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`
                w-11 h-14 text-center text-xl font-bold font-code rounded
                border bg-surface-2 text-amber outline-none
                transition-all duration-150 caret-amber
                ${d ? "border-amber" : "border-border"}
                focus:border-amber focus:ring-1 focus:ring-amber/20
              `}
              style={{ backgroundColor: "var(--surface-2)" }}
            />
          ))}
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-xs text-muted font-code">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                countdown > 0 ? "bg-amber animate-pulse-amber" : "bg-muted"
              }`}
            />
            Code expires in{" "}
            <span className="text-ash font-bold tabular-nums">
              {String(Math.floor(countdown / 60)).padStart(2, "0")}:
              {String(countdown % 60).padStart(2, "0")}
            </span>
          </div>
        </div>

        {error && (
          <div
            className="text-xs text-error border border-error/20 rounded px-3 py-2 font-code text-center"
            style={{ background: "rgba(255,90,90,0.06)" }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="text-xs text-success border border-success/20 rounded px-3 py-2 font-code text-center"
            style={{ background: "rgba(74,255,160,0.06)" }}
          >
            {success}
          </div>
        )}

        <Button type="submit" loading={loading} disabled={otp.length < 6}>
          Verify Code
        </Button>

        <div className="text-center text-xs text-muted font-code">
          Didn't receive it?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0 || resending}
            className="text-amber hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {resending ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
          </button>
        </div>

        <div className="text-center">
          <Link href="/signup" className="text-xs text-muted hover:text-amber transition-colors font-code">
            Back to Signup
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
