'use client';

import React from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
}

/**
 * Input — text input with label-above pattern, border, and accessible focus ring.
 * Typically wrapped by FormField for label/hint/auto-filled affordances.
 */
export function Input({ value, onChange, placeholder, type = 'text', disabled = false, id }: InputProps) {
  const [focus, setFocus] = React.useState(false);
  return (
    <input
      id={id}
      type={type}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        font: 'var(--text-body)',
        color: 'var(--color-ink)',
        background: disabled ? 'var(--color-bg)' : 'var(--color-surface)',
        border: `1px solid ${focus ? 'var(--color-primary)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-sm)',
        padding: '10px 12px',
        outline: focus ? '2px solid var(--color-primary)' : 'none',
        outlineOffset: 2,
        transition: 'border-color var(--motion-fast)',
      }}
    />
  );
}
