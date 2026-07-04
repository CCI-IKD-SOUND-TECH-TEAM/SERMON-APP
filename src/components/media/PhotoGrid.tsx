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
    <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(140px,1fr))]">
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
            className="aspect-square rounded-sm cursor-pointer hover:opacity-90 transition-opacity"
            style={{ background: bg }}
          />
        );
      })}
    </div>
  );
}
