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
    <div className="max-w-[var(--container-max)] mx-auto py-8 px-[var(--container-pad)]">
      <button
        onClick={() => router.push('/photos')}
        className="bg-transparent border-none text-ink-muted font-semibold text-[14px] leading-none font-body cursor-pointer flex items-center gap-[6px] mb-6 p-0 hover:text-ink transition-colors"
      >
        <ChevronLeft width={16} height={16} /> Back to albums
      </button>

      {album === null && (
        <p className="font-body text-ink-muted">Loading album…</p>
      )}
      {album === 'missing' && (
        <p className="font-body text-ink-muted">
          That album couldn&apos;t be found. It may have been moved in Drive.
        </p>
      )}

      {album && album !== 'missing' && (
        <>
          <h1 className="font-h1 text-ink m-0 mb-[6px]">{album.title}</h1>
          <div className="font-body-sm text-ink-muted mb-6">
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
