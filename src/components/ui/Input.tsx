// src/components/ui/Input.tsx
import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs tracking-[0.15em] uppercase text-muted font-code">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-surface-2 border font-code text-sm text-ash placeholder:text-muted
            px-4 py-3 rounded outline-none transition-all duration-150
            ${error
              ? "border-error focus:border-error focus:ring-1 focus:ring-error/20"
              : "border-border focus:border-amber focus:ring-1 focus:ring-amber/10"
            }
            ${className}
          `}
          style={{ backgroundColor: "var(--surface-2)" }}
          {...props}
        />
        {error && (
          <p className="text-xs text-error font-code">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-muted font-code">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
