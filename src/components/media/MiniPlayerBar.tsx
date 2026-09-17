'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Pause, Play, RotateCcw, RotateCw, X } from 'lucide-react';
import { usePlayer } from '@/lib/player/PlayerContext';
import { formatTime } from '@/lib/player/format-time';

const BAR_HEIGHT = 72;

/**
 * Persistent bottom playback bar — visible on every public page once a
 * sermon has been started, so audio keeps playing across navigation.
 * Clicking the track info opens the full /player view.
 *
 * Pinned to the dark theme tokens regardless of the site's active theme —
 * `--color-ink`/`--color-bg` flip in light vs. dark mode, which previously
 * made this bar (and its text) wash out to near-invisible in dark mode.
 */
export function MiniPlayerBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { current, playing, currentTime, duration, togglePlay, seekTo, skip, close } = usePlayer();

  if (!current || pathname === '/player') return null;

  const progress = duration > 0 ? currentTime / duration : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration <= 0) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));
    seekTo(percent * duration);
  };

  return (
    <>
      <div style={{ height: BAR_HEIGHT, flexShrink: 0 }} aria-hidden="true" />
      <div
        role="region"
        aria-label="Now playing"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          height: BAR_HEIGHT,
          // A flat --color-surface would match the footer directly above
          // (it uses the same token), so this blends toward --color-ink to
          // stay a visibly distinct panel while remaining theme-correct —
          // lighter than --color-surface in dark mode, deeper in light mode.
          background: 'color-mix(in srgb, var(--color-surface) 90%, var(--color-ink) 10%)',
          borderTop: '1px solid color-mix(in srgb, var(--color-primary) 35%, transparent)',
          color: 'var(--color-ink)',
          boxShadow: '0 -8px 24px rgba(0,0,0,0.18), var(--shadow-modal)',
          zIndex: 900,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          onClick={handleSeek}
          style={{ height: 4, background: 'var(--color-border)', cursor: duration ? 'pointer' : 'default', flexShrink: 0 }}
        >
          <div style={{ height: '100%', width: `${progress * 100}%`, background: 'var(--color-primary)' }} />
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => router.push('/player')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              router.push('/player');
            }
          }}
          aria-label={`Open now playing: ${current.title}`}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '0 var(--container-pad-mobile)',
            minWidth: 0,
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-sm)',
              flexShrink: 0,
              overflow: 'hidden',
              background: 'var(--color-border)',
            }}
          >
            {current.coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={current.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                font: '600 14px/1.3 var(--font-body)',
                color: 'var(--color-ink)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {current.title}
            </div>
            <div
              style={{
                font: 'var(--text-body-sm)',
                color: 'var(--color-ink-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {current.speaker ?? 'Unknown speaker'} · {formatTime(currentTime)} / {duration ? formatTime(duration) : '--:--'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                skip(-15);
              }}
              aria-label="Rewind 15 seconds"
              className="mini-player-secondary mini-player-icon-btn"
              style={iconBtnStyle}
            >
              <RotateCcw width={18} height={18} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              aria-label={playing ? 'Pause' : 'Play'}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                border: 'none',
                background: 'var(--color-primary)',
                // --ink-900 is a base primitive, not redefined per theme —
                // guarantees a dark icon on the amber circle in both modes.
                color: 'var(--ink-900)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {playing ? <Pause width={16} height={16} fill="currentColor" /> : <Play width={16} height={16} fill="currentColor" />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                skip(15);
              }}
              aria-label="Forward 15 seconds"
              className="mini-player-secondary mini-player-icon-btn"
              style={iconBtnStyle}
            >
              <RotateCw width={18} height={18} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
              aria-label="Close player"
              className="mini-player-secondary mini-player-icon-btn"
              style={iconBtnStyle}
            >
              <X width={18} height={18} />
            </button>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          .mini-player-icon-btn:hover { background: var(--color-border) !important; }
          @media (max-width: 480px) {
            .mini-player-secondary { display: none !important; }
          }
        `,
        }}
      />
    </>
  );
}

const iconBtnStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: '50%',
  border: 'none',
  background: 'transparent',
  color: 'inherit',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
  transition: 'background var(--motion-fast)',
};
