// src/components/ui/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "ghost";
  loading?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const base = `
    relative w-full py-3 px-6 text-sm font-code tracking-[0.12em] uppercase
    rounded transition-all duration-150 outline-none
    disabled:opacity-40 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: `
      bg-amber text-void font-bold
      hover:bg-amber-dim active:scale-[0.98]
      focus:ring-2 focus:ring-amber/30
    `,
    ghost: `
      bg-transparent border border-border-bright text-ash
      hover:border-amber hover:text-amber active:scale-[0.98]
      focus:ring-2 focus:ring-amber/10
    `,
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Processing...
        </span>
      ) : children}
    </button>
  );
}
