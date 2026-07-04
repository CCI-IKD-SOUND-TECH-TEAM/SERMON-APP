import React from 'react';
import { Sparkles } from 'lucide-react';

export interface FormFieldProps {
  label: string;
  hint?: string;
  autoFilled?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
}

/**
 * FormField — label-above wrapper for Input/Select/TagMultiSelect, with optional
 * hint text and an "auto-filled" marker for fields populated from Drive parsing.
 */
export function FormField({ label, hint, autoFilled = false, htmlFor, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-[6px] mb-4">
      <div className="flex items-center gap-2">
        <label htmlFor={htmlFor} className="font-semibold text-[13px] leading-none font-body text-ink-muted">
          {label}
        </label>
        {autoFilled && (
          <span className="inline-flex items-center gap-1 font-semibold text-[11px] leading-none font-body text-accent bg-accent-light py-[3px] px-[7px] rounded-pill">
            <Sparkles width={11} height={11} />
            Auto-filled — verify
          </span>
        )}
      </div>
      {children}
      {hint && <div className="font-body-sm text-ink-faint">{hint}</div>}
    </div>
  );
}
