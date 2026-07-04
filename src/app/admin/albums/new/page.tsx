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
      className="bg-transparent border-none text-ink-muted font-semibold text-[14px] leading-none font-body cursor-pointer flex items-center gap-[6px] mb-6 p-0 hover:text-ink transition-colors"
    >
      <ChevronLeft width={16} height={16} /> Back to albums
    </button>
  );

  return (
    <div>
      {backLink}

      <div className="responsive-header mb-8">
        <div>
          <h1 className="font-h1 text-ink m-0 mb-2">New album</h1>
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

      {errorMsg && (
        <div className="p-3 bg-danger-bg text-danger rounded-md mb-4">
          {errorMsg}
        </div>
      )}

      <div className="max-w-[460px]">
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
            className="block mt-2"
          />
        </FormField>
      </div>
    </div>
  );
}
