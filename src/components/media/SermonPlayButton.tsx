'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Download, Pause, Play } from 'lucide-react';
import { usePlayer, type PlayerTrack } from '@/lib/player/PlayerContext';

export interface SermonPlayButtonProps {
  track: PlayerTrack;
  downloadUrl?: string;
}

/**
 * CTA pair on the sermon detail page: starts the global player (which keeps
 * playing across navigation) and opens the full /player view, plus a
 * same-origin download link for the raw audio file.
 */
export function SermonPlayButton({ track, downloadUrl }: SermonPlayButtonProps) {
  const router = useRouter();
  const { current, playing, play, togglePlay } = usePlayer();
  const isCurrent = current?.id === track.id;
  const canPlay = Boolean(track.src);

  const handlePlayClick = () => {
    if (!canPlay) return;
    if (isCurrent) {
      togglePlay();
    } else {
      play(track);
    }
    router.push('/player');
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${track.title}.mp3`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <button
        type="button"
        onClick={handlePlayClick}
        disabled={!canPlay}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--color-primary)',
          color: '#fff',
          border: 'none',
          borderRadius: 'var(--radius-pill)',
          padding: '14px 28px',
          font: 'var(--text-button)',
          cursor: canPlay ? 'pointer' : 'not-allowed',
          opacity: canPlay ? 1 : 0.5,
        }}
      >
        {isCurrent && playing ? (
          <Pause width={18} height={18} fill="currentColor" />
        ) : (
          <Play width={18} height={18} fill="currentColor" />
        )}
        {isCurrent && playing ? 'Pause' : isCurrent ? 'Continue playing' : 'Play sermon'}
      </button>

      {downloadUrl && (
        <button
          type="button"
          onClick={handleDownload}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            border: '1px solid var(--color-ink)',
            background: 'transparent',
            color: 'var(--color-ink)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 20px',
            font: '600 13px/1 var(--font-body)',
            cursor: 'pointer',
          }}
        >
          <Download width={16} height={16} />
          Download
        </button>
      )}
    </div>
  );
}
