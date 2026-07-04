'use client';

import React from 'react';

export interface PhotoGridItem {
  id?: string | number;
  /** Real image URL, or a token hex color used as a placeholder swatch. */
  src?: string;
  color?: string;
  alt?: string;
}

export interface PhotoGridProps {
  photos?: PhotoGridItem[];
  onSelect?: (index: number) => void;
}

/**
 * PhotoGrid — fixed-aspect thumbnail grid for a photo album, opens Lightbox on click.
 */
export function PhotoGrid({ photos = [], onSelect }: PhotoGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 'var(--space-3)',
      }}
    >
      {photos.map((p, i) => {
        const bg = p.src ? `url(${p.src}) center/cover` : p.color || 'var(--color-accent-light)';
        return (
          <div
            key={p.id ?? i}
            role="button"
            tabIndex={0}
            aria-label={p.alt || `Photo ${i + 1}`}
            onClick={() => onSelect?.(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect?.(i);
              }
            }}
            style={{
              aspectRatio: '1/1',
              borderRadius: 'var(--radius-sm)',
              background: bg,
              cursor: 'pointer',
            }}
          />
        );
      })}
    </div>
  );
}
