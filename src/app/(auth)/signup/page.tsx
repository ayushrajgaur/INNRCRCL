"use client";
// src/app/(auth)/signup/page.tsx
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface FieldErrors {
  email?: string;
  password?: string;
  confirm?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function validate(): boolean {
    const errs: FieldErrors = {};
    if (!email.trim()) {
      errs.email = "Email is required.";
    } else if (!email.toLowerCase().endsWith("@gla.ac.in")) {
      errs.email = "Must be a @gla.ac.in email address.";
    }
    if (!password) {
      errs.password = "Password is required.";
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters.";
    }
    if (!confirm) {
      errs.confirm = "Please confirm your password.";
    } else if (confirm !== password) {
      errs.confirm = "Passwords do not match.";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong.");
        return;
      }
      // redirect to OTP page, passing email via query param
      router.push(`/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create account"
      subtitle="Enter your email to get started."
      badge="New"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Input
          label="Email"
          type="email"
          placeholder="you@gla.ac.in"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />
        <Input
          label="Password"
          type="password"
          placeholder="min. 8 characters"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          hint="At least 8 characters."
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="repeat password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={fieldErrors.confirm}
        />

        {serverError && (
          <div
            className="text-xs text-error border border-error/20 rounded px-3 py-2 font-code"
            style={{ background: "rgba(255,90,90,0.06)" }}
          >
            {serverError}
          </div>
        )}

        {/* Anonymous handle notice */}
        <div
          className="text-xs text-muted border border-border rounded px-3 py-2.5 font-code leading-relaxed"
          style={{ background: "var(--surface-2)" }}
        >
          <span className="text-amber">◈</span> You'll be assigned a random handle
          like <span className="text-ash">ghost#4821</span> — your email stays hidden
          from other users.
        </div>

        <Button type="submit" loading={loading}>
          Send Verification Code →
        </Button>

        <p className="text-center text-xs text-muted font-code">
          Already have an account?{" "}
          <Link href="/login" className="text-amber hover:underline">
            Login
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
