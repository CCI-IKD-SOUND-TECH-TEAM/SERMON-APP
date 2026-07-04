'use client';

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white border-transparent hover:bg-primary-dark focus:ring-primary',
  secondary: 'bg-transparent text-ink border-ink hover:bg-primary-light focus:ring-ink',
  ghost: 'bg-transparent text-ink border-transparent hover:bg-primary-light focus:ring-ink',
  destructive: 'bg-danger text-white border-transparent hover:bg-[#932F16] focus:ring-danger',
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'py-2 px-[14px] font-semibold text-[13px] leading-none font-body',
  md: 'py-3 px-5 font-button',
  lg: 'py-[14px] px-[26px] font-semibold text-[16px] leading-none font-body',
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
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  const sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.md;
  const baseClasses = "inline-flex items-center justify-center gap-2 rounded-sm border outline-none transition-colors duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <button
      type={type}
      style={propStyle}
      className={`${baseClasses} ${variantStyle} ${sizeStyle} ${className || ''}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-[overflow-spin_0.7s_linear_infinite]" />
      ) : (
        icon
      )}
      {!loading && children}
    </button>
  );
}
