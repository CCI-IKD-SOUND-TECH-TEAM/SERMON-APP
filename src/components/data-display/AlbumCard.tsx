'use client';

import React from 'react';
import Image from 'next/image';

export interface AlbumCardProps {
  title: string;
  date: string;
  photoCount: number;
  cover?: string;
  onClick?: () => void;
}

/**
 * AlbumCard — photo album card for the public gallery. 4:3 cover, title,
 * date · photo count meta line. Same interaction pattern as SermonCard.
 */
export function AlbumCard({ title, date, photoCount, cover, onClick }: AlbumCardProps) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        boxShadow: hover ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'box-shadow var(--motion-base), transform var(--motion-base)',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          aspectRatio: '3/4',
          position: 'relative',
          backgroundColor: 'var(--color-surface-hover)',
        }}
      >
        {cover && !cover.startsWith('#') && (
          <Image
            src={cover}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
        )}
      </div>
      <div style={{ padding: 'var(--space-4)' }}>
        <div
          style={{
            font: 'var(--text-h3)',
            color: hover ? 'var(--color-primary)' : 'var(--color-ink)',
            transition: 'color var(--motion-base)',
            marginBottom: 4,
          }}
        >
          {title}
        </div>
        <div style={{ font: 'var(--text-body-sm)', color: 'var(--color-ink-muted)' }}>
          {date} · {photoCount} photos
        </div>
      </div>
    </div>
  );
}
