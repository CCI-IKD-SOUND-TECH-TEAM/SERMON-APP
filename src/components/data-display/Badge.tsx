import React from 'react';
import type { ContentStatus } from '@/lib/types';

const STATUS: Record<ContentStatus, string> = {
  published: 'bg-success-bg text-success',
  pending_review: 'bg-warning-bg text-warning',
  unpublished: 'bg-border text-ink-muted',
  archived: 'bg-border text-ink-muted',
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
  const statusClasses = STATUS[status] || STATUS.published;
  const label = children ?? DEFAULT_LABEL[status];
  return (
    <span
      className={`inline-flex items-center gap-[6px] py-[5px] px-[10px] rounded-pill font-semibold text-[13px] leading-none font-body ${statusClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
