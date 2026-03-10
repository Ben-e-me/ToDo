import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        type="button"
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded border border-slate-700 bg-slate-900 text-sky-400 shadow-sm transition hover:border-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
          props.disabled && "cursor-not-allowed opacity-50",
          className
        )}
        aria-pressed={props.checked}
        onClick={(event) => {
          props.onChange?.({
            ...event,
            target: {
              ...(event.target as HTMLInputElement),
              checked: !props.checked
            }
          } as React.ChangeEvent<HTMLInputElement>);
        }}
      >
        {props.checked && (
          <span className="h-3 w-3 rounded-sm bg-sky-400 shadow-sm" />
        )}
      </button>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };

