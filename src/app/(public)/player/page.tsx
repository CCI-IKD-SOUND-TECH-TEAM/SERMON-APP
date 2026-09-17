'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronDown,
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { usePlayer, type PlayerTrack } from '@/lib/player/PlayerContext';
import { formatTime } from '@/lib/player/format-time';
import { api } from '@/lib/api';
import type { Sermon } from '@/lib/types';

function SkipIcon({ direction }: { direction: 'back' | 'forward' }) {
  const Icon = direction === 'back' ? RotateCcw : RotateCw;
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <Icon width={22} height={22} />
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 1,
          fontSize: 9,
          fontWeight: 700,
        }}
      >
        15
      </span>
    </span>
  );
}

function sermonToTrack(s: Sermon, seriesId: string | null | undefined, seriesTitle: string | null | undefined): PlayerTrack {
  return {
    id: s.id,
    title: s.title,
    speaker: s.speaker,
    coverUrl: s.thumbnail_url && !s.thumbnail_url.startsWith('#') ? s.thumbnail_url : null,
    src: s.drive_file_id ? `/api/media/stream/${s.drive_file_id}` : '',
    seriesId,
    seriesTitle,
    description: s.description,
    date: s.sermon_date,
    tags: s.tags,
  };
}

export default function NowPlayingPage() {
  const router = useRouter();
  const {
    current,
    playing,
    buffering,
    currentTime,
    duration,
    playbackRate,
    togglePlay,
    seekTo,
    skip,
    cyclePlaybackRate,
    play,
  } = usePlayer();

  const [seriesSermons, setSeriesSermons] = useState<Sermon[] | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!current?.seriesId) {
      setSeriesSermons(null);
      return;
    }
    let cancelled = false;
    api
      .series(current.seriesId)
      .then((data) => {
        if (!cancelled) setSeriesSermons(data.sermons ?? []);
      })
      .catch(() => {
        if (!cancelled) setSeriesSermons(null);
      });
    return () => {
      cancelled = true;
    };
  }, [current?.seriesId]);

  // router.back() no-ops if this tab has no prior page in its history — the
  // case when /player is opened directly (a bookmark, a fresh tab, or the
  // restore-on-refresh flow). Fall back to home so the button always does
  // something.
  const minimize = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;

      if (e.key === 'Escape') {
        minimize();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowLeft') {
        skip(-15);
      } else if (e.key === 'ArrowRight') {
        skip(15);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [minimize, togglePlay, skip]);

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  if (!current) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--color-bg)',
          color: 'var(--color-ink)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 'var(--space-8)',
          textAlign: 'center',
        }}
      >
        <p style={{ font: 'var(--text-h3)' }}>Nothing is playing right now.</p>
        <Link href="/" style={{ color: 'var(--color-primary)', font: 'var(--text-button)', textDecoration: 'none' }}>
          Browse sermons
        </Link>
      </div>
    );
  }

  const index = seriesSermons?.findIndex((s) => s.id === current.id) ?? -1;
  const prevSermon = seriesSermons && index >= 0 ? seriesSermons[index + 1] : undefined;
  const nextSermon = seriesSermons && index > 0 ? seriesSermons[index - 1] : undefined;

  const goToPrev = () => prevSermon && play(sermonToTrack(prevSermon, current.seriesId, current.seriesTitle));
  const goToNext = () => nextSermon && play(sermonToTrack(nextSermon, current.seriesId, current.seriesTitle));

  const aboutText = current.description ? current.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 950, overflowY: 'auto', background: 'var(--color-bg)', color: 'var(--color-ink)' }}>
      {current.coverUrl && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: -1,
            backgroundImage: `url(${current.coverUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(60px) saturate(1.2)',
            transform: 'scale(1.2)',
          }}
        />
      )}
      {/* Theme-tinted wash so text stays legible over the photo regardless of
          the cover art's own colors — derived from --color-bg so it's cream
          in light mode and near-black in dark mode, matching whichever theme
          is active rather than a fixed dark overlay. */}
      <div
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, zIndex: -1, background: 'color-mix(in srgb, var(--color-bg) 72%, transparent)' }}
      />
      <div
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, zIndex: -1, background: 'linear-gradient(180deg, transparent, var(--color-bg) 85%)' }}
      />

      <div
        style={{
          maxWidth: 640,
          margin: '0 auto',
          padding: '20px var(--container-pad-mobile) 48px',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
          <button type="button" onClick={minimize} aria-label="Minimize player" style={topIconBtn}>
            <ChevronDown width={26} height={26} />
          </button>
          <div
            style={{
              font: 'var(--text-overline)',
              letterSpacing: 'var(--tracking-overline)',
              textTransform: 'uppercase',
              color: 'var(--color-ink-muted)',
              textAlign: 'center',
              flex: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              padding: '0 12px',
            }}
          >
            {current.seriesTitle ?? 'Now Playing'}
          </div>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            style={topIconBtn}
          >
            {isFullscreen ? <Minimize2 width={20} height={20} /> : <Maximize2 width={20} height={20} />}
          </button>
        </div>

        <div
          style={{
            width: '100%',
            maxWidth: 400,
            aspectRatio: '1/1',
            margin: '0 auto var(--space-8)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-modal)',
            background: 'var(--color-surface)',
            position: 'relative',
          }}
        >
          {current.coverUrl ? (
            <Image src={current.coverUrl} alt={current.title} fill sizes="400px" style={{ objectFit: 'cover' }} priority />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-ink-muted)',
                font: 'var(--text-h1)',
              }}
              aria-hidden="true"
            >
              {current.title.charAt(0)}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ font: 'var(--text-h2)', margin: '0 0 6px' }}>{current.title}</h1>
          <div style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)' }}>
            {current.speaker ?? 'Unknown speaker'}
            {current.date ? ` · ${current.date}` : ''}
          </div>
        </div>

        <div style={{ marginBottom: 'var(--space-4)' }}>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            onChange={(e) => seekTo(Number(e.target.value))}
            aria-label="Seek"
            style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', font: 'var(--text-body-sm)', color: 'var(--color-ink-muted)' }}>
            <span>{formatTime(currentTime)}</span>
            <span>{duration ? formatTime(duration) : '--:--'}</span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-3)',
            flexWrap: 'wrap',
            marginBottom: 'var(--space-8)',
          }}
        >
          <button type="button" onClick={cyclePlaybackRate} aria-label={`Playback speed, currently ${playbackRate}x`} style={rateBtnStyle}>
            {playbackRate}x
          </button>

          <button
            type="button"
            onClick={goToPrev}
            disabled={!prevSermon}
            aria-label={prevSermon ? `Previous: ${prevSermon.title}` : 'No previous sermon in series'}
            style={{ ...controlBtnStyle, opacity: prevSermon ? 1 : 0.3, cursor: prevSermon ? 'pointer' : 'default' }}
          >
            <SkipBack width={20} height={20} fill="currentColor" />
          </button>

          <button type="button" onClick={() => skip(-15)} aria-label="Rewind 15 seconds" style={controlBtnStyle}>
            <SkipIcon direction="back" />
          </button>

          <button type="button" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'} style={playBtnStyle}>
            {buffering ? (
              <Loader2 className="animate-spin" width={28} height={28} />
            ) : playing ? (
              <Pause width={28} height={28} fill="currentColor" />
            ) : (
              <Play width={28} height={28} fill="currentColor" style={{ marginLeft: 3 }} />
            )}
          </button>

          <button type="button" onClick={() => skip(15)} aria-label="Forward 15 seconds" style={controlBtnStyle}>
            <SkipIcon direction="forward" />
          </button>

          <button
            type="button"
            onClick={goToNext}
            disabled={!nextSermon}
            aria-label={nextSermon ? `Next: ${nextSermon.title}` : 'No next sermon in series'}
            style={{ ...controlBtnStyle, opacity: nextSermon ? 1 : 0.3, cursor: nextSermon ? 'pointer' : 'default' }}
          >
            <SkipForward width={20} height={20} fill="currentColor" />
          </button>
        </div>

        {aboutText && (
          <div
            style={{
              background: 'color-mix(in srgb, var(--color-surface) 78%, transparent)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-6)',
              marginTop: 'auto',
            }}
          >
            <h2 style={{ font: 'var(--text-h3)', margin: '0 0 12px' }}>About this sermon</h2>
            <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)', whiteSpace: 'pre-wrap', margin: 0 }}>{aboutText}</p>
            {current.tags && current.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 16 }}>
                {current.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-ink)',
                      font: '600 12px/1 var(--font-body)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const topIconBtn: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: '50%',
  border: 'none',
  background: 'transparent',
  color: 'inherit',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
};

const controlBtnStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: '50%',
  border: 'none',
  background: 'transparent',
  color: 'inherit',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const playBtnStyle: React.CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: '50%',
  border: 'none',
  background: 'var(--color-primary)',
  // Always a dark icon on the amber circle — --ink-900 is a base palette
  // primitive, not redefined per theme, so contrast holds in light and dark.
  color: 'var(--ink-900)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const rateBtnStyle: React.CSSProperties = {
  minWidth: 44,
  height: 32,
  padding: '0 10px',
  borderRadius: 'var(--radius-pill)',
  border: '1px solid var(--color-border)',
  background: 'transparent',
  color: 'inherit',
  font: '600 13px/1 var(--font-body)',
  cursor: 'pointer',
};

