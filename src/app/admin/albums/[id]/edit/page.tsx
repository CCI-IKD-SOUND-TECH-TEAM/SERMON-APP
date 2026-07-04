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
      <ChevronLeft width={16} height={16} /> Back to dashboard
    </button>
  );

  if (album === null) {
    return (
      <div>
        {backLink}
        <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)' }}>Loading album…</p>
      </div>
    );
  }

  if (album === 'missing') {
    return (
      <div>
        {backLink}
        <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)' }}>
          That album couldn&apos;t be found. It may have been moved in Drive.
        </p>
      </div>
    );
  }

  return (
    <div>
      {backLink}

      <div
        className="responsive-header"
        style={{
          marginBottom: 'var(--space-8)',
        }}
      >
        <div>
          <h1 style={{ font: 'var(--text-h1)', color: 'var(--color-ink)', margin: '0 0 8px' }}>Edit album</h1>
          <Badge status={status} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" loading={saving === 'draft'} onClick={() => save('pending_review', 'draft')}>
            Save draft
          </Button>
          <Button variant="primary" loading={saving === 'publish'} onClick={() => save('published', 'publish')}>
            Publish
          </Button>
        </div>
      </div>

      <div style={{ maxWidth: 640 }}>
        <FormField label="Album title" htmlFor="title" hint="Parsed from Drive folder name">
          <Input id="title" value={title} onChange={setTitle} />
        </FormField>
        <FormField label="Date" htmlFor="date" hint="When the photos were taken">
          <Input id="date" value={date} onChange={setDate} />
        </FormField>

        {album.photos && album.photos.length > 0 && (
          <div style={{ marginTop: 'var(--space-8)' }}>
            <h3 style={{ font: 'var(--text-h3)', color: 'var(--color-ink)', marginBottom: 'var(--space-4)' }}>Photos ({album.photos.length})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
              {album.photos.slice(0, 12).map((p) => (
                <div key={p.id} style={{ aspectRatio: '1', background: p.thumbnail_url ? `url(${p.thumbnail_url}) center/cover` : 'var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
              ))}
            </div>
            {album.photos.length > 12 && (
              <p style={{ font: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', marginTop: 8 }}>
                + {album.photos.length - 12} more
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
