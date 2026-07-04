'use client';

import React from 'react';

const SIZES = { inline: 20, nav: 24 } as const;

export interface IconButtonProps {
  icon: React.ReactNode;
  size?: keyof typeof SIZES;
  label: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  active?: boolean;
}

/**
 * IconButton — icon-only control for compact toolbars, nav, and table row actions.
 */
export function IconButton({ icon, size = 'nav', label, onClick, active = false }: IconButtonProps) {
  const isInline = size === 'inline';
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-sm border-none cursor-pointer transition-colors duration-150 hover:bg-primary-light ${
        isInline ? 'w-[36px] h-[36px]' : 'w-[40px] h-[40px]'
      } ${active ? 'bg-primary-light text-primary-dark' : 'bg-transparent text-ink'}`}
    >
      <span className={`inline-flex ${isInline ? 'w-[20px] h-[20px]' : 'w-[24px] h-[24px]'}`}>
        {icon}
      </span>
    </button>
  );
}
