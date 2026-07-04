'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { PhotoGrid } from '@/components/media/PhotoGrid';
import { Lightbox } from '@/components/media/Lightbox';
import { api } from '@/lib/api';
import type { PhotoAlbum } from '@/lib/types';

export default function AlbumPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [album, setAlbum] = React.useState<PhotoAlbum | null | 'missing'>(null);
  const [index, setIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!params?.id) return;
    api
      .album(params.id)
      .then(setAlbum)
      .catch(() => setAlbum('missing'));
  }, [params?.id]);

  const photos = album && album !== 'missing' ? album.photos || [] : [];
  const count = photos.length;

  const mappedPhotos = React.useMemo(() => {
    return photos.map(p => ({
      src: p.file_url ?? undefined,
      alt: 'Album photo',
      onDownload: () => {
        window.location.href = `/api/download?id=${p.id}&type=photo`;
      }
    }));
  }, [photos]);

  return (
    <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'var(--space-8) var(--container-pad)' }}>
      <button
        onClick={() => router.push('/photos')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-ink-muted)',
          font: '600 14px/1 var(--font-body)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 'var(--space-6)',
          padding: 0,
        }}
      >
        <ChevronLeft width={16} height={16} /> Back to albums
      </button>

      {album === null && (
        <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)' }}>Loading album…</p>
      )}
      {album === 'missing' && (
        <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)' }}>
          That album couldn&apos;t be found. It may have been moved in Drive.
        </p>
      )}

      {album && album !== 'missing' && (
        <>
          <h1 style={{ font: 'var(--text-h1)', color: 'var(--color-ink)', margin: '0 0 6px' }}>{album.title}</h1>
          <div style={{ font: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-6)' }}>
            {album.event_date} · {count} photos
          </div>

          <PhotoGrid photos={mappedPhotos} onSelect={setIndex} />
        </>
      )}

      {index !== null && count > 0 && (
        <Lightbox
          photo={mappedPhotos[index]}
          onClose={() => setIndex(null)}
          onPrev={() => setIndex((index - 1 + count) % count)}
          onNext={() => setIndex((index + 1) % count)}
          onDownload={mappedPhotos[index].onDownload}
        />
      )}
    </div>
  );
}
