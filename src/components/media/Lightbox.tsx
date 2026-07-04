'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react';

export interface LightboxPhoto {
  src?: string;
  color?: string;
  alt?: string;
}

export interface LightboxProps {
  photo: LightboxPhoto | null;
  onClose?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onDownload?: () => void;
}

/**
 * Lightbox — full-bleed dark overlay for viewing a single photo full-size,
 * with prev/next, download, and close. Ink-tinted overlay (not pure black).
 */
export function Lightbox({ photo, onClose, onPrev, onNext, onDownload }: LightboxProps) {
  React.useEffect(() => {
    if (!photo) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'ArrowLeft') onPrev?.();
      if (e.key === 'ArrowRight') onNext?.();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [photo, onClose, onPrev, onNext]);

  if (!photo) return null;

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-[1000] animate-[overflow-lightbox-in_200ms_ease-out]" role="dialog" aria-modal="true" aria-label={photo.alt || 'Photo viewer'}>
      <button type="button" onClick={onClose} aria-label="Close" className="absolute bg-transparent border-none text-white cursor-pointer top-5 right-5 hover:text-white/80 transition-colors">
        <X width={28} height={28} />
      </button>
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous photo"
        className="absolute bg-transparent border-none text-white cursor-pointer left-5 top-1/2 -translate-y-1/2 hover:text-white/80 transition-colors"
      >
        <ChevronLeft width={32} height={32} />
      </button>
      {photo.src ? (
        <img
          src={photo.src}
          alt={photo.alt || ''}
          className="max-w-[80vw] max-h-[80vh] rounded-sm object-contain"
        />
      ) : (
        <div
          aria-label={photo.alt || ''}
          className="w-[60vw] max-w-[640px] aspect-[4/3] rounded-sm"
          style={{ background: photo.color || 'var(--color-accent-light)' }}
        />
      )}
      <button
        type="button"
        onClick={onNext}
        aria-label="Next photo"
        className="absolute bg-transparent border-none text-white cursor-pointer right-5 top-1/2 -translate-y-1/2 hover:text-white/80 transition-colors"
      >
        <ChevronRight width={32} height={32} />
      </button>
      <button
        type="button"
        onClick={onDownload}
        aria-label="Download photo"
        className="absolute bg-transparent text-white cursor-pointer bottom-5 right-5 border border-white rounded-sm py-2 px-3 inline-flex items-center gap-[6px] hover:bg-white/10 transition-colors"
      >
        <Download width={16} height={16} />
        Download
      </button>
    </div>
  );
}
