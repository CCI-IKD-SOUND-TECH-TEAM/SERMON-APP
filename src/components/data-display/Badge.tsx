import React from 'react';
import type { ContentStatus } from '@/lib/types';

const STATUS: Record<ContentStatus, { bg: string; fg: string }> = {
  published: { bg: 'var(--color-success-bg)', fg: 'var(--color-success)' },
  pending_review: { bg: 'var(--color-warning-bg)', fg: 'var(--color-warning)' },
  unpublished: { bg: 'var(--color-border)', fg: 'var(--color-ink-muted)' },
  archived: { bg: 'var(--color-border)', fg: 'var(--color-ink-muted)' },
};

const DEFAULT_LABEL: Record<ContentStatus, string> = {
  published: 'Published',
  pending_review: 'Pending review',
  unpublished: 'Unpublished',
  archived: 'Archived',
};

export interface BadgeProps {
  status?: ContentStatus;
  children?: React.ReactNode;
}

/**
 * Badge — status indicator for admin content (Published / Pending review / Archived).
 * Always renders text, never color alone.
 */
export function Badge({ status = 'published', children }: BadgeProps) {
  const s = STATUS[status] || STATUS.published;
  const label = children ?? DEFAULT_LABEL[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: s.bg,
        color: s.fg,
        font: '600 13px/1 var(--font-body)',
        padding: '5px 10px',
        borderRadius: 'var(--radius-pill)',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
      {label}
    </span>
  );
}
