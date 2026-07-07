"use client";

import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function FieldShell({
  label,
  hint,
  error,
  touched,
  optional,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  touched?: boolean;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="flex items-baseline justify-between text-sm font-medium text-text-primary">
        <span>
          {label}
          {optional && (
            <span className="ml-1.5 text-xs font-normal text-text-muted">(ixtiyoriy)</span>
          )}
        </span>
        {touched && !error && (
          <CheckCircle2 className="h-4 w-4 text-accent-teal" aria-hidden="true" />
        )}
      </label>
      {children}
      {error ? (
        <p className="flex items-center gap-1.5 text-xs text-danger">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
