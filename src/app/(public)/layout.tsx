'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { PublicNav } from '@/components/navigation/PublicNav';


const LINKS = [
  { label: 'Sermons', href: '/' },
  { label: 'Photos', href: '/photos' },
  { label: 'Series', href: '/series' },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const active =
    pathname.startsWith('/photos')
      ? 'Photos'
      : pathname.startsWith('/series')
        ? 'Series'
        : 'Sermons';

  return (
    <div className="flex flex-col bg-bg min-h-screen">
      <PublicNav links={LINKS} active={active} />
      
      {pathname === '/' && (
        <div className="max-w-[var(--container-max)] mx-auto pt-6 px-[var(--container-pad)] w-full">
          <form action="/sermons" method="GET" className="flex">
            <input
              type="search"
              name="q"
              placeholder="Search sermons..."
              className="w-full py-3 px-5 rounded-[24px] border border-border bg-surface text-[16px] font-body outline-none shadow-[0_2px_8px_rgba(0,0,0,0.05)] focus:border-ink-muted transition-colors"
            />
          </form>
        </div>
      )}

      <main className="flex-1">
        {children}
      </main>

      <footer className="py-4 px-[var(--container-pad)] border-t border-border mt-auto bg-surface">
        <div className="max-w-[var(--container-max)] mx-auto flex flex-row justify-between items-center flex-wrap gap-6">
          {/* Brand & Copyright */}
          <div>
            <div className="font-body-sm text-ink-muted text-[13px]">
              © {new Date().getFullYear()} ICFCWJ
            </div>
          </div>
          
          {/* Social Links */}
          <div className="flex gap-8 font-medium text-[13px] leading-none font-body uppercase tracking-[0.5px]">
            <a href="https://www.youtube.com/@CelebrationChurchIkorodu" target="_blank" rel="noopener noreferrer" className="text-ink-muted no-underline transition-colors duration-200 hover:text-ink">
              YOUTUBE
            </a>
            <a href="https://www.instagram.com/cci_ikorodu/" target="_blank" rel="noopener noreferrer" className="text-ink-muted no-underline transition-colors duration-200 hover:text-ink">
              INSTAGRAM
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
