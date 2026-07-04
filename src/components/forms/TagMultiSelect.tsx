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
  const [focus, setFocus] = React.useState(false);

  function commit() {
    const v = draft.trim();
    if (v && !value.includes(v)) onChange?.([...value, v]);
    setDraft('');
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        alignItems: 'center',
        padding: '8px 10px',
        border: `1px solid ${focus ? 'var(--color-primary)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-sm)',
        background: 'var(--color-surface)',
        outline: focus ? '2px solid var(--color-primary)' : 'none',
        outlineOffset: 2,
      }}
    >
      {value.map((t) => (
        <Tag key={t} variant="topic" onRemove={() => onChange?.(value.filter((x) => x !== t))}>
          {t}
        </Tag>
      ))}
      <input
        value={draft}
        placeholder={value.length === 0 ? placeholder : ''}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => {
          setFocus(false);
          commit();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
            e.preventDefault();
            commit();
          }
        }}
        style={{
          border: 'none',
          outline: 'none',
          font: 'var(--text-body)',
          color: 'var(--color-ink)',
          flex: 1,
          minWidth: 100,
          background: 'transparent',
        }}
      />
    </div>
  );
}
