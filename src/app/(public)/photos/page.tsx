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
    <div className="max-w-[var(--container-max)] mx-auto py-8 px-[var(--container-pad)]">
      <div className="mb-8">
        <div
          className="font-overline tracking-overline uppercase text-ink-muted mb-2"
        >
          Photos
        </div>
        <h1 className="font-hero text-ink m-0 mb-2.5">Photo albums</h1>
        <p className="font-body text-ink-muted max-w-[560px] m-0">
          Browse every photo from the gatherings, weekend by weekend.
        </p>
      </div>

      {albums === null ? (
        <p className="font-body text-ink-muted">Loading albums…</p>
      ) : albums.length === 0 ? (
        <p className="font-body text-ink-muted">
          No albums yet 
        </p>
      ) : (
        <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
          {albums.map((a, i) => (
            <AlbumCard
              key={a.id}
              title={a.title}
              date={a.event_date ?? ''}
              photoCount={a.photo_count ?? 0}
              cover={a.cover_photo_url ?? ''}
              onClick={() => router.push(`/photos/${a.id}`)}
              priority={i < 4}
            />
          ))}
        </div>
      )}
    </div>
  );
}
