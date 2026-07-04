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
export function Input({ value, onChange, placeholder, type = 'text', disabled = false, id, className, ...rest }: InputProps) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
      className={`w-full box-border font-body text-ink border border-border rounded-sm py-[10px] px-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-150 ${disabled ? 'bg-bg' : 'bg-surface'} ${className || ''}`}
      {...rest}
    />
  );
}
