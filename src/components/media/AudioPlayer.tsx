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
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
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
      <div className="bg-surface border border-border rounded-md p-4 flex flex-col items-center justify-center gap-3 max-w-[480px] min-h-[124px]">
        <audio
          ref={audioRef}
          src={src}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={() => setHasError(true)}
          onEnded={() => setPlaying(false)}
          className="hidden"
        />
        <Loader2 className="animate-spin text-primary" width={24} height={24} />
        <span className="font-body-sm text-ink-muted">Loading audio...</span>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-md p-4 flex flex-col gap-3 max-w-[480px]">
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
        <div className="font-h3 text-ink">{title}</div>
        <div className="font-body-sm text-ink-muted">{speaker}</div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          disabled={!src}
          aria-label={playing ? 'Pause' : 'Play'}
          className="w-10 h-10 rounded-full border-none bg-primary text-white inline-flex items-center justify-center cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
        >
          {playing ? <Pause width={18} height={18} /> : <Play width={18} height={18} />}
        </button>
        <div className="flex-1">
          <div
            onClick={handleSeek}
            className={`h-6 flex items-center ${src ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <div className="h-[6px] rounded-[3px] bg-ink-faint relative overflow-hidden w-full">
              <div
                className="absolute inset-y-0 left-0 bg-primary transition-[width] duration-75"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </div>
        <span className="font-body-sm text-ink-muted shrink-0 min-w-[40px]">
          {formatTime(currentTime)} / {duration > 0 ? formatTime(duration) : '--:--'}
        </span>
        <button
          type="button"
          onClick={handleDownload}
          disabled={!src}
          aria-label="Download"
          className="inline-flex items-center gap-[6px] border border-ink bg-transparent text-ink rounded-sm py-2 px-3 font-semibold text-[13px] leading-none font-body cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/5 transition-colors"
        >
          <Download width={14} height={14} />
          Download
        </button>
      </div>
    </div>
  );
}
