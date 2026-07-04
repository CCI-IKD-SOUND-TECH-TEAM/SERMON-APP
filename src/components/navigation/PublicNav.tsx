'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export interface PublicNavLink {
  label: string;
  href: string;
}

export interface PublicNavProps {
  links?: PublicNavLink[];
  active?: string;
}

/**
 * PublicNav — simple top nav for the public site. Wordmark left, links
 * center/right, minimal chrome (no mega-menus). On mobile (≤768px) the links
 * collapse into a hamburger menu. The header is sticky on all screen sizes.
 */
export function PublicNav({ links = [], active }: PublicNavProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  // Lock body scroll when mobile menu is open.
  React.useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      {/* Sticky wrapper for header + dropdown */}
      <header className="sticky top-0 z-[100]">
        {/* Top bar */}
        <nav className="bg-surface border-b border-border">
          <div className="max-w-[var(--container-max)] mx-auto py-[18px] px-[var(--container-pad)] flex items-center justify-between w-full">
            <Link
              href="/"
              className="font-display font-semibold text-[22px] leading-none text-ink no-underline"
            >
              Overflow
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-[28px]">
              {links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className={`font-body font-semibold text-[15px] leading-none no-underline ${
                    l.label === active ? 'text-primary' : 'text-ink'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Mobile hamburger button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="flex md:hidden bg-transparent border-none p-[6px] cursor-pointer text-ink items-center justify-center"
            >
              {menuOpen ? <X width={24} height={24} /> : <Menu width={24} height={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile dropdown — sits directly below the nav bar */}
        {menuOpen && (
          <div className="flex md:hidden flex-col bg-surface border-b border-border pt-1 px-6 pb-3 shadow-[0_8px_32px_rgba(0,0,0,0.1)] animate-[publicMenuSlide_0.2s_ease-out]">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className={`block py-[14px] font-body font-semibold text-[16px] leading-none no-underline border-b border-border ${
                  l.label === active ? 'text-primary' : 'text-ink'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Backdrop — separate from header so it fills the viewport */}
      {menuOpen && (
        <div
          className="block md:hidden fixed inset-0 z-[99] bg-black/30 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <style>{`
        @keyframes publicMenuSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
