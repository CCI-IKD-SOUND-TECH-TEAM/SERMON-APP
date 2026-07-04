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
  const [hover, setHover] = React.useState(false);
  const px = SIZES[size] || SIZES.nav;
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: px + 16,
        height: px + 16,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-sm)',
        border: 'none',
        background: active || hover ? 'var(--color-primary-light)' : 'transparent',
        color: active ? 'var(--color-primary-dark)' : 'var(--color-ink)',
        cursor: 'pointer',
        transition: 'background var(--motion-fast), color var(--motion-fast)',
      }}
    >
      <span style={{ width: px, height: px, display: 'inline-flex' }}>{icon}</span>
    </button>
  );
}
