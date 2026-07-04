'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Download, Pause, Play, Loader2 } from 'lucide-react';

export interface AudioPlayerProps {
  title: string;
  speaker: string;
  src?: string;
}

function formatTime(seconds: number) {
  if (isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function AudioPlayer({
  title,
  speaker,
  src,
}: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(!src);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (src) {
      setIsLoaded(false);
      setHasError(false);
    } else {
      setIsLoaded(true);
    }
  }, [src]);

  const togglePlay = () => {
    if (!src) return;
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setCurrentTime(current);
      if (total > 0) {
        setProgress(current / total);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoaded(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration > 0) {
      const bounds = e.currentTarget.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));
      audioRef.current.currentTime = percent * duration;
    }
  };

  const handleDownload = () => {
    if (src) {
      const a = document.createElement('a');
      a.href = src;
      a.download = `${title}.mp3`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  if (src && !isLoaded && !hasError) {
    return (
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          maxWidth: 480,
          minHeight: 124,
        }}
      >
        <audio
          ref={audioRef}
          src={src}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={() => setHasError(true)}
          onEnded={() => setPlaying(false)}
          style={{ display: 'none' }}
        />
        <Loader2 className="animate-spin" style={{ color: 'var(--color-primary)' }} width={24} height={24} />
        <span style={{ font: 'var(--text-body-sm)', color: 'var(--color-ink-muted)' }}>Loading audio...</span>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxWidth: 480,
      }}
    >
      {src && (
        <audio
          ref={audioRef}
          src={src}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={() => setHasError(true)}
          onEnded={() => setPlaying(false)}
        />
      )}
      <div>
        <div style={{ font: 'var(--text-h3)', color: 'var(--color-ink)' }}>{title}</div>
        <div style={{ font: 'var(--text-body-sm)', color: 'var(--color-ink-muted)' }}>{speaker}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          onClick={togglePlay}
          disabled={!src}
          aria-label={playing ? 'Pause' : 'Play'}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: 'none',
            background: 'var(--color-primary)',
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {playing ? <Pause width={18} height={18} /> : <Play width={18} height={18} />}
        </button>
        <div style={{ flex: 1 }}>
          <div
            onClick={handleSeek}
            style={{
              height: 24, // larger hit area for seeking
              display: 'flex',
              alignItems: 'center',
              cursor: src ? 'pointer' : 'default',
            }}
          >
            <div
              style={{
                height: 6,
                borderRadius: 3,
                background: 'var(--color-ink-faint)',
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: `${progress * 100}%`,
                  background: 'var(--color-primary)',
                }}
              />
            </div>
          </div>
        </div>
        <span style={{ font: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', flexShrink: 0, minWidth: 40 }}>
          {formatTime(currentTime)} / {duration > 0 ? formatTime(duration) : '--:--'}
        </span>
        <button
          type="button"
          onClick={handleDownload}
          disabled={!src}
          aria-label="Download"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            border: '1px solid var(--color-ink)',
            background: 'transparent',
            color: 'var(--color-ink)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 12px',
            font: '600 13px/1 var(--font-body)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Download width={14} height={14} />
          Download
        </button>
      </div>
    </div>
  );
}
