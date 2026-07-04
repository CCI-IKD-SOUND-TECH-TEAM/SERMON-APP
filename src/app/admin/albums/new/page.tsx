'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/core/Button';
import { api } from '@/lib/api';
import type { ContentStatus } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

export default function NewAlbumPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [files, setFiles] = React.useState<FileList | null>(null);
  
  const [saving, setSaving] = React.useState<null | 'draft' | 'publish'>(null);
  const [errorMsg, setErrorMsg] = React.useState('');

  async function save(nextStatus: ContentStatus, mode: 'draft' | 'publish') {
    if (!title) {
      setErrorMsg('Title is required.');
      return;
    }
    
    setSaving(mode);
    setErrorMsg('');
    try {
      // 1. Create the album record
      const album = await api.createAlbum({
        title,
        description,
        status: nextStatus,
        event_date: new Date().toISOString().split('T')[0],
      });

      // 2. Upload photos if selected
      if (files && files.length > 0 && album.id) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${album.id}_${Date.now()}_${i}.${fileExt}`;
          const filePath = `${album.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('photos')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('photos')
            .getPublicUrl(filePath);

          // 3. Create photo record
          await supabase.from('photos').insert({
            album_id: album.id,
            storage_path: filePath,
            file_url: publicUrl,
            width: 0,
            height: 0,
            sort_order: i,
          });
        }
      }

      router.push('/admin/albums');
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to save album.');
    } finally {
      setSaving(null);
    }
  }

  const backLink = (
    <button
      onClick={() => router.push('/admin/albums')}
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
          <h1 style={{ font: 'var(--text-h1)', color: 'var(--color-ink)', margin: '0 0 8px' }}>New album</h1>
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
        <FormField label="Title" htmlFor="title">
          <Input id="title" value={title} onChange={setTitle} />
        </FormField>
        <FormField label="Description">
          <Input value={description} onChange={setDescription} />
        </FormField>
        <FormField label="Photos" hint="Select multiple photos to upload.">
          <input 
            type="file" 
            accept="image/*"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            style={{ display: 'block', marginTop: 8 }}
          />
        </FormField>
      </div>
    </div>
  );
}
