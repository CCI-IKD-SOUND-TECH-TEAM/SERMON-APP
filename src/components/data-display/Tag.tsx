import React from 'react';
import { X } from 'lucide-react';

export interface TagProps {
  variant?: 'topic' | 'series';
  children: React.ReactNode;
  onRemove?: () => void;
}

/**
 * Tag — pill for topical tags (amber) or series labels (teal).
 */
export function Tag({ variant = 'topic', children, onRemove }: TagProps) {
  const isTopic = variant === 'topic';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: isTopic ? 'var(--color-primary-light)' : 'var(--color-accent-light)',
        color: isTopic ? 'var(--color-primary-dark)' : 'var(--color-accent-dark)',
        font: '600 13px/1 var(--font-body)',
        padding: '5px 10px',
        borderRadius: 'var(--radius-pill)',
      }}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${typeof children === 'string' ? children : 'tag'}`}
          style={{
            border: 'none',
            background: 'transparent',
            color: 'inherit',
            cursor: 'pointer',
            padding: 0,
            display: 'inline-flex',
            opacity: 0.7,
          }}
        >
          <X width={12} height={12} />
        </button>
      )}
    </span>
  );
}
