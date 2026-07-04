'use client';

import React from 'react';
import { Tag } from '../data-display/Tag';

export interface TagMultiSelectProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
}

/**
 * TagMultiSelect — chip-entry multi-select for topical tags in the metadata editor.
 * Type + Enter to add a chip; click × on a chip to remove.
 */
export function TagMultiSelect({ value = [], onChange, placeholder = 'Add a tag…' }: TagMultiSelectProps) {
  const [draft, setDraft] = React.useState('');

  function commit() {
    const v = draft.trim();
    if (v && !value.includes(v)) onChange?.([...value, v]);
    setDraft('');
  }

  return (
    <div className="flex flex-wrap gap-[6px] items-center py-2 px-[10px] border border-border rounded-sm bg-surface focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:border-primary">
      {value.map((t) => (
        <Tag key={t} variant="topic" onRemove={() => onChange?.(value.filter((x) => x !== t))}>
          {t}
        </Tag>
      ))}
      <input
        value={draft}
        placeholder={value.length === 0 ? placeholder : ''}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
            e.preventDefault();
            commit();
          }
        }}
        className="border-none outline-none font-body text-ink flex-1 min-w-[100px] bg-transparent"
      />
    </div>
  );
}
