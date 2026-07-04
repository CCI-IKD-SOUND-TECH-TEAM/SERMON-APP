'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { TagMultiSelect } from '@/components/forms/TagMultiSelect';
import { Button } from '@/components/core/Button';
import { Badge } from '@/components/data-display/Badge';
import { ImageUpload } from '@/components/forms/ImageUpload';
import { api } from '@/lib/api';
import type { ContentStatus, Sermon } from '@/lib/types';
export default function SermonEditorPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [sermon, setSermon] = React.useState<Sermon | null | 'missing'>(null);
  const [title, setTitle] = React.useState('');
  const [speaker, setSpeaker] = React.useState('');
  const [series, setSeries] = React.useState('none');
  const [seriesOptions, setSeriesOptions] = React.useState<{value: string, label: string}[]>([{ value: 'none', label: 'No series' }]);
  const [tags, setTags] = React.useState<string[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = React.useState('');
  const [altText, setAltText] = React.useState('');
  const [status, setStatus] = React.useState<ContentStatus>('pending_review');
  const [saving, setSaving] = React.useState<null | 'draft' | 'publish'>(null);

  React.useEffect(() => {
    if (!params?.id) return;
    api
      .sermon(params.id)
      .then((s) => {
        setSermon(s);
        setTitle(s.title);
        setSpeaker(s.speaker ?? '');
        setSeries(s.series_id ?? 'none');
        setTags(s.tags ?? []);
        setStatus(s.status);
        setThumbnailUrl(s.thumbnail_url ?? '');
      })
      .catch(() => setSermon('missing'));
      
    api.allSeries().then((data) => {
      setSeriesOptions([
        { value: 'none', label: 'No series' },
        ...data.map((s) => ({ value: s.id, label: s.title }))
      ]);
    }).catch(console.error);
  }, [params?.id]);

  async function save(nextStatus: ContentStatus, mode: 'draft' | 'publish') {
    if (!params?.id) return;
    setSaving(mode);
    try {
      await api.updateSermon(params.id, {
        title,
        speaker,
        series_id: series === 'none' ? null : series,
        tags,
        status: nextStatus,
        thumbnail_url: thumbnailUrl || null,
      });
      router.push('/admin');
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

  if (sermon === null) {
    return (
      <div>
        {backLink}
        <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)' }}>Loading sermon…</p>
      </div>
    );
  }

  if (sermon === 'missing') {
    return (
      <div>
        {backLink}
        <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)' }}>
          That sermon couldn&apos;t be found. It may have been moved in Drive.
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
          <h1 style={{ font: 'var(--text-h1)', color: 'var(--color-ink)', margin: '0 0 8px' }}>Edit sermon</h1>
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

      <div style={{ maxWidth: 460 }}>
        <ImageUpload label="Cover Image" value={thumbnailUrl} onChange={setThumbnailUrl} hint="Aspect ratio 3:4 recommended." />
        <FormField label="Title" htmlFor="title">
          <Input id="title" value={title} onChange={setTitle} />
        </FormField>
        <FormField label="Speaker" autoFilled hint="Detected from the Drive filename.">
          <Input value={speaker} onChange={setSpeaker} />
        </FormField>
        <FormField label="Series">
          <Select value={series} onChange={setSeries} options={seriesOptions} />
        </FormField>
        <FormField label="Tags">
          <TagMultiSelect value={tags} onChange={setTags} placeholder="Add a topic…" />
        </FormField>
        <FormField label="Alt text" hint="Required — used for accessibility and search.">
          <Input value={altText} onChange={setAltText} placeholder="Describe this sermon's thumbnail" />
        </FormField>
      </div>
    </div>
  );
}
