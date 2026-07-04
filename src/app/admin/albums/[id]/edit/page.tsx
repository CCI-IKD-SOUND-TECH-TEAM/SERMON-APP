'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/core/Button';
import { Badge } from '@/components/data-display/Badge';
import { api } from '@/lib/api';
import type { PhotoAlbum, ContentStatus } from '@/lib/types';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { SupabaseImageUpload } from '@/components/forms/SupabaseImageUpload';
import { toast } from 'sonner';

export default function AlbumEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [album, setAlbum] = React.useState<PhotoAlbum | null | 'missing'>(null);
  
  const [title, setTitle] = React.useState('');
  const [date, setDate] = React.useState('');
  const [status, setStatus] = React.useState<ContentStatus>('pending_review');
  const [saving, setSaving] = React.useState<null | 'draft' | 'publish'>(null);

  React.useEffect(() => {
    if (!params?.id) return;
    api
      .album(params.id)
      .then((a) => {
        setAlbum(a);
        setTitle(a.title);
        setDate(a.event_date ?? '');
        setStatus(a.status);
      })
      .catch(() => setAlbum('missing'));
  }, [params?.id]);

  async function save(nextStatus: ContentStatus, mode: 'draft' | 'publish') {
    if (!params?.id) return;
    setSaving(mode);
    try {
      await api.updateAlbum(params.id, {
        title,
        event_date: date,
        status: nextStatus,
      });
      router.push('/admin/albums');
      router.refresh();
      toast.success('Album saved successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save album');
    } finally {
      setSaving(null);
    }
  }

  const backLink = (
    <button
      onClick={() => router.push('/admin')}
      className="bg-transparent border-none text-ink-muted font-semibold text-[14px] leading-none font-body cursor-pointer flex items-center gap-[6px] mb-6 p-0 hover:text-ink transition-colors"
    >
      <ChevronLeft width={16} height={16} /> Back to dashboard
    </button>
  );

  if (album === null) {
    return (
      <div>
        {backLink}
        <p className="font-body text-ink-muted">Loading album…</p>
      </div>
    );
  }

  if (album === 'missing') {
    return (
      <div>
        {backLink}
        <p className="font-body text-ink-muted">
          That album couldn&apos;t be found. It may have been moved in Drive.
        </p>
      </div>
    );
  }

  return (
    <div>
      {backLink}

      <div className="responsive-header mb-8">
        <div>
          <h1 className="font-h1 text-ink m-0 mb-2">Edit album</h1>
          <Badge status={status} />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" loading={saving === 'draft'} onClick={() => save('pending_review', 'draft')}>
            Save draft
          </Button>
          <Button variant="primary" loading={saving === 'publish'} onClick={() => save('published', 'publish')}>
            Publish
          </Button>
        </div>
      </div>

      <div className="max-w-[640px]">
        <FormField label="Album title" htmlFor="title" hint="Parsed from Drive folder name">
          <Input id="title" value={title} onChange={setTitle} />
        </FormField>
        <FormField label="Date" htmlFor="date" hint="When the photos were taken">
          <Input id="date" value={date} onChange={setDate} />
        </FormField>

        {album.photos && album.photos.length > 0 && (
          <div className="mt-8">
            <h3 className="font-h3 text-ink mb-4">Photos ({album.photos.length})</h3>
            <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(120px,1fr))]">
              {album.photos.slice(0, 12).map((p) => (
                <div key={p.id} className="aspect-square rounded-sm" style={{ background: p.thumbnail_url ? `url(${p.thumbnail_url}) center/cover` : 'var(--color-border)' }} />
              ))}
            </div>
            {album.photos.length > 12 && (
              <p className="font-body-sm text-ink-muted mt-2">
                + {album.photos.length - 12} more
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
