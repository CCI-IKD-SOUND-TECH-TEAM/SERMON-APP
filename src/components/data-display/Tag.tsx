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
      className={`inline-flex items-center gap-[6px] py-[5px] px-[10px] rounded-pill font-semibold text-[13px] leading-none font-body ${
        isTopic ? 'bg-primary-light text-primary-dark' : 'bg-accent-light text-accent-dark'
      }`}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${typeof children === 'string' ? children : 'tag'}`}
          className="border-none bg-transparent text-inherit cursor-pointer p-0 inline-flex opacity-70 hover:opacity-100"
        >
          <X width={12} height={12} />
        </button>
      )}
    </span>
  );
}
