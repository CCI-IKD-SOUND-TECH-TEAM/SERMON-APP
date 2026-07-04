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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 'var(--space-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label htmlFor={htmlFor} style={{ font: '600 13px/1 var(--font-body)', color: 'var(--color-ink-muted)' }}>
          {label}
        </label>
        {autoFilled && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              font: '600 11px/1 var(--font-body)',
              color: 'var(--color-accent)',
              background: 'var(--color-accent-light)',
              padding: '3px 7px',
              borderRadius: 'var(--radius-pill)',
            }}
          >
            <Sparkles width={11} height={11} />
            Auto-filled — verify
          </span>
        )}
      </div>
      {children}
      {hint && <div style={{ font: 'var(--text-body-sm)', color: 'var(--color-ink-faint)' }}>{hint}</div>}
    </div>
  );
}
