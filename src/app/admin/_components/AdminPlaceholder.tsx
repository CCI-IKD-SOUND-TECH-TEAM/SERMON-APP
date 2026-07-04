import React from 'react';

export interface AdminPlaceholderProps {
  title: string;
  message: string;
}

/**
 * AdminPlaceholder — honest "not built out yet" state for admin sections that
 * exist in the nav (per the design brief) but weren't part of the delivered
 * design kit. Keeps tone friendly and on-brand rather than 404-ing.
 */
export function AdminPlaceholder({ title, message }: AdminPlaceholderProps) {
  return (
    <div>
      <h1 style={{ font: 'var(--text-h1)', color: 'var(--color-ink)', margin: '0 0 4px' }}>{title}</h1>
      <div
        style={{
          marginTop: 'var(--space-8)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface)',
          padding: 'var(--space-12) var(--space-8)',
          textAlign: 'center',
          font: 'var(--text-body)',
          color: 'var(--color-ink-muted)',
          maxWidth: 560,
        }}
      >
        {message}
      </div>
    </div>
  );
}
