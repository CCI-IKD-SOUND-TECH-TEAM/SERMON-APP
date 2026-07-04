'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AlbumCard } from '@/components/data-display/AlbumCard';
import { api } from '@/lib/api';
import type { PhotoAlbum } from '@/lib/types';

export default function PhotosPage() {
  const router = useRouter();
  const [albums, setAlbums] = React.useState<PhotoAlbum[] | null>(null);

  React.useEffect(() => {
    api.albums().then(setAlbums).catch(() => setAlbums([]));
  }, []);

  return (
    <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'var(--space-8) var(--container-pad)' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <div
          style={{
            font: 'var(--text-overline)',
            letterSpacing: 'var(--tracking-overline)',
            textTransform: 'uppercase',
            color: 'var(--color-ink-muted)',
            marginBottom: 8,
          }}
        >
          Photos
        </div>
        <h1 style={{ font: 'var(--text-hero)', color: 'var(--color-ink)', margin: '0 0 10px' }}>Photo albums</h1>
        <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)', maxWidth: 560, margin: 0 }}>
          Browse every photo from the gatherings, weekend by weekend.
        </p>
      </div>

      {albums === null ? (
        <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)' }}>Loading albums…</p>
      ) : albums.length === 0 ? (
        <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)' }}>
          No albums yet 
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 'var(--space-6)',
          }}
        >
          {albums.map((a) => (
            <AlbumCard
              key={a.id}
              title={a.title}
              date={a.event_date ?? ''}
              photoCount={a.photo_count ?? 0}
              cover={a.cover_photo_url ?? ''}
              onClick={() => router.push(`/photos/${a.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
