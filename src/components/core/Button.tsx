'use client';

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary: { background: 'var(--color-primary)', color: '#fff', border: '1px solid transparent' },
  secondary: { background: 'transparent', color: 'var(--color-ink)', border: '1px solid var(--color-ink)' },
  ghost: { background: 'transparent', color: 'var(--color-ink)', border: '1px solid transparent' },
  destructive: { background: 'var(--color-danger)', color: '#fff', border: '1px solid transparent' },
};

const SIZE_STYLES: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '8px 14px', font: '600 13px/1 var(--font-body)' },
  md: { padding: '12px 20px', font: 'var(--text-button)' },
  lg: { padding: '14px 26px', font: '600 16px/1 var(--font-body)' },
};

const HOVER_BG: Record<ButtonVariant, string> = {
  primary: 'var(--color-primary-dark)',
  secondary: 'var(--color-primary-light)',
  ghost: 'var(--color-primary-light)',
  destructive: '#932F16',
};

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Button — Overflow's core action control.
 * Variants: primary (filled amber), secondary (outline ink), ghost (text-only,
 * used for admin row actions), destructive (filled danger, delete/unpublish only).
 */
export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon = null,
  children,
  onClick,
  type = 'button',
  style: propStyle,
  className,
}: ButtonProps) {
  const [hover, setHover] = React.useState(false);
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  const sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.md;

  const style: React.CSSProperties = {
    ...variantStyle,
    ...sizeStyle,
    borderRadius: 'var(--radius-sm)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition:
      'background var(--motion-base), color var(--motion-base), border-color var(--motion-base)',
    outline: 'none',
  };

  if (hover && !disabled && !loading) {
    style.background = HOVER_BG[variant];
  }

  return (
    <button
      type={type}
      style={{ ...style, ...(propStyle || {}) }}
      className={className}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow =
          '0 0 0 2px var(--color-surface), 0 0 0 4px var(--color-focus-ring)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {loading ? (
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            animation: 'overflow-spin 0.7s linear infinite',
          }}
        />
      ) : (
        icon
      )}
      {!loading && children}
    </button>
  );
}
