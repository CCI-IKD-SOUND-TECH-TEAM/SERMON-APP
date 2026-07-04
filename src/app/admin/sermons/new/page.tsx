'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { TagMultiSelect } from '@/components/forms/TagMultiSelect';
import { Button } from '@/components/core/Button';
import { ImageUpload } from '@/components/forms/ImageUpload';
import { api } from '@/lib/api';
import type { ContentStatus, Series } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
export default function NewSermonPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = React.useState('');
  const [speaker, setSpeaker] = React.useState('');
  const [series, setSeries] = React.useState('none');
  const [seriesOptions, setSeriesOptions] = React.useState<{value: string, label: string}[]>([{ value: 'none', label: 'No series' }]);
  const [tags, setTags] = React.useState<string[]>([]);
  const [file, setFile] = React.useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = React.useState('');
  
  const [saving, setSaving] = React.useState<null | 'draft' | 'publish'>(null);
  const [errorMsg, setErrorMsg] = React.useState('');

  React.useEffect(() => {
    api.allSeries().then((data) => {
      setSeriesOptions([
        { value: 'none', label: 'No series' },
        ...data.map((s) => ({ value: s.id, label: s.title }))
      ]);
    }).catch(console.error);
  }, []);

  async function save(nextStatus: ContentStatus, mode: 'draft' | 'publish') {
    if (!title) {
      setErrorMsg('Title is required.');
      return;
    }
    
    setSaving(mode);
    setErrorMsg('');
    try {
      // 1. Create the sermon record
      const sermon = await api.createSermon({
        title,
        speaker,
        series_id: series === 'none' ? null : series,
        tags,
        status: nextStatus,
        sermon_date: new Date().toISOString().split('T')[0],
        thumbnail_url: thumbnailUrl || null,
      });

      // 2. Upload file if selected
      if (file && sermon.id) {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        
        if (!cloudName || !uploadPreset) {
          throw new Error('Cloudinary credentials missing in .env.local');
        }
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
          method: 'POST',
          body: formData,
        });
        
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error?.message || 'Failed to upload audio to Cloudinary');
        }
        
        const data = await res.json();
        const publicUrl = data.secure_url;

        // 3. Create sermon_file record
        await supabase.from('sermon_files').insert({
          sermon_id: sermon.id,
          file_type: file.type.startsWith('video/') ? 'video' : 'audio',
          storage_path: data.public_id,
          file_url: publicUrl,
          mime_type: file.type,
          size_bytes: file.size,
        });
      }

      router.push('/admin/sermons');
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to save sermon.');
    } finally {
      setSaving(null);
    }
  }

  const backLink = (
    <button
      onClick={() => router.push('/admin/sermons')}
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
      <ChevronLeft width={16} height={16} /> Back to sermons
    </button>
  );

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
          <h1 style={{ font: 'var(--text-h1)', color: 'var(--color-ink)', margin: '0 0 8px' }}>New sermon</h1>
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

      {errorMsg && (
        <div style={{ padding: '12px', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 6, marginBottom: 16 }}>
          {errorMsg}
        </div>
      )}

      <div style={{ maxWidth: 460 }}>
        <ImageUpload label="Cover Image" value={thumbnailUrl} onChange={setThumbnailUrl} hint="Recommended size: 1280x720" />
        <FormField label="Title" htmlFor="title">
          <Input id="title" value={title} onChange={setTitle} />
        </FormField>
        <FormField label="Speaker">
          <Input value={speaker} onChange={setSpeaker} />
        </FormField>
        <FormField label="Series">
          <Select value={series} onChange={setSeries} options={seriesOptions} />
        </FormField>
        <FormField label="Tags">
          <TagMultiSelect value={tags} onChange={setTags} placeholder="Add a topic…" />
        </FormField>
        <FormField label="Sermon Audio/Video File" hint="Upload MP3 or MP4">
          <input 
            type="file" 
            accept="audio/*,video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={{ display: 'block', marginTop: 8 }}
          />
        </FormField>
      </div>
    </div>
  );
}
