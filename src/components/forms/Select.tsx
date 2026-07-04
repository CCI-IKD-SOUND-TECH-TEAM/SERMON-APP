'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  value?: string;
  onChange?: (value: string) => void;
  options?: SelectOption[];
  id?: string;
}

/**
 * Select — native-backed select styled to match Input (border, radius, focus ring).
 */
export function Select({ value, onChange, options = [], id }: SelectProps) {
  const [focus, setFocus] = React.useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          appearance: 'none',
          font: 'var(--text-body)',
          color: 'var(--color-ink)',
          background: 'var(--color-surface)',
          border: `1px solid ${focus ? 'var(--color-primary)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-sm)',
          padding: '10px 36px 10px 12px',
          outline: focus ? '2px solid var(--color-primary)' : 'none',
          outlineOffset: 2,
          transition: 'border-color var(--motion-fast)',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        width={16}
        height={16}
        style={{
          position: 'absolute',
          right: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--color-ink-muted)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
