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
      <h1 className="font-h1 text-ink m-0 mb-1">{title}</h1>
      <div className="mt-8 border border-border rounded-md bg-surface py-12 px-8 text-center font-body text-ink-muted max-w-[560px]">
        {message}
      </div>
    </div>
  );
}
