'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { PublicNav } from '@/components/navigation/PublicNav';
import { PlayerProvider } from '@/lib/player/PlayerContext';
import { MiniPlayerBar } from '@/components/media/MiniPlayerBar';


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
    <PlayerProvider>
    <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', minHeight: '100vh' }}>
      <PublicNav links={LINKS} active={active} />
      
      {pathname === '/' && (
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'var(--space-6) var(--container-pad) 0', width: '100%' }}>
          <form action="/sermons" method="GET" style={{ display: 'flex' }}>
            <input
              type="search"
              name="q"
              placeholder="Search sermons..."
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: '24px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                font: '16px var(--font-body)',
                outline: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}
            />
          </form>
        </div>
      )}

      <main style={{ flex: 1 }}>
        {children}
      </main>

      <footer style={{
        padding: 'var(--space-4) var(--container-pad)',
        borderTop: '1px solid var(--color-border)',
        marginTop: 'auto',
        background: 'var(--color-surface)',
      }}>
        <div style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-6)',
        }}>
          {/* Brand & Copyright */}
          <div>
            <div style={{ 
              font: 'var(--text-body-sm)', 
              color: 'var(--color-ink-muted)',
              fontSize: '13px'
            }}>
              © {new Date().getFullYear()} ICFCWJ
            </div>
          </div>
          
          {/* Social Links */}
          <div style={{ 
            display: 'flex', 
            gap: '32px',
            font: '500 13px/1 var(--font-body)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            <a href="https://www.youtube.com/@CelebrationChurchIkorodu" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-ink-muted)', textDecoration: 'none', transition: 'color 0.2s' }}>
              YOUTUBE
            </a>
            <a href="https://www.instagram.com/cci_ikorodu/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-ink-muted)', textDecoration: 'none', transition: 'color 0.2s' }}>
              INSTAGRAM
            </a>
          </div>
        </div>
      </footer>

      <MiniPlayerBar />
    </div>
    </PlayerProvider>
  );
}
