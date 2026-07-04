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
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full box-border appearance-none font-body text-ink bg-surface border border-border rounded-sm py-[10px] pl-3 pr-[36px] outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-150"
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
        className="absolute right-[10px] top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
      />
    </div>
  );
}
