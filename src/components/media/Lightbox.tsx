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

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'var(--color-overlay)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'overflow-lightbox-in 200ms ease-out',
  };
  const iconBtn: React.CSSProperties = {
    position: 'absolute',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
  };

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-label={photo.alt || 'Photo viewer'}>
      <button type="button" onClick={onClose} aria-label="Close" style={{ ...iconBtn, top: 20, right: 20 }}>
        <X width={28} height={28} />
      </button>
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous photo"
        style={{ ...iconBtn, left: 20, top: '50%', transform: 'translateY(-50%)' }}
      >
        <ChevronLeft width={32} height={32} />
      </button>
      {photo.src ? (
        <img
          src={photo.src}
          alt={photo.alt || ''}
          style={{ maxWidth: '80vw', maxHeight: '80vh', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }}
        />
      ) : (
        <div
          aria-label={photo.alt || ''}
          style={{
            width: '60vw',
            maxWidth: 640,
            aspectRatio: '4/3',
            background: photo.color || 'var(--color-accent-light)',
            borderRadius: 'var(--radius-sm)',
          }}
        />
      )}
      <button
        type="button"
        onClick={onNext}
        aria-label="Next photo"
        style={{ ...iconBtn, right: 20, top: '50%', transform: 'translateY(-50%)' }}
      >
        <ChevronRight width={32} height={32} />
      </button>
      <button
        type="button"
        onClick={onDownload}
        aria-label="Download photo"
        style={{
          ...iconBtn,
          bottom: 20,
          right: 20,
          border: '1px solid #fff',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Download width={16} height={16} />
        Download
      </button>
    </div>
  );
}
