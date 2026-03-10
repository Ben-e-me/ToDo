import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "onChange" | "value"
  > {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <button
        type="button"
        ref={ref}
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded border border-slate-700 bg-slate-900 text-sky-400 shadow-sm transition hover:border-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        aria-pressed={checked}
        aria-checked={checked}
        role="checkbox"
        onClick={() => {
          if (disabled) return;
          onCheckedChange?.(!checked);
        }}
        {...props}
      >
        {checked && (
          <span className="h-3 w-3 rounded-sm bg-sky-400 shadow-sm" />
        )}
      </button>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };

