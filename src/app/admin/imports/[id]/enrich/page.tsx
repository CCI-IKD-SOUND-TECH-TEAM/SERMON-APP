'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/core/Button';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { RadioGroup } from '@/components/forms/RadioGroup';
import { Select } from '@/components/forms/Select';
import { RichTextEditor } from '@/components/forms/RichTextEditor';
import { SupabaseImageUpload } from '@/components/forms/SupabaseImageUpload';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EnrichImportPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const supabase = createClient();
  const [importRecord, setImportRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [type, setType] = useState('sermon');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [preacher, setPreacher] = useState('');
  const [seriesId, setSeriesId] = useState('none');
  const [seriesOptions, setSeriesOptions] = useState<{value: string, label: string}[]>([{ value: 'none', label: 'No series' }]);
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [coverImage, setCoverImage] = useState<File | string | null>(null);

  useEffect(() => {
    async function fetchImport() {
      const { data } = await supabase
        .from('media_imports')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) {
        setImportRecord(data);
        // Try to guess default title
        setTitle(data.file_name.replace(/\.[^/.]+$/, ""));
      } else {
        setError("Import not found");
      }
      setLoading(false);
      
      try {
        const seriesData = await api.allSeries();
        setSeriesOptions([
          { value: 'none', label: 'No series' },
          ...seriesData.map((s) => ({ value: s.id, label: s.title }))
        ]);
      } catch (err) {
        console.error("Failed to load series:", err);
      }
    }
    fetchImport();
  }, [id, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      let finalCoverUrl = '';

      if (coverImage instanceof File) {
        // Upload the new image to the 'photos' bucket
        const fileExt = coverImage.name.split('.').pop();
        const fileName = `covers/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, coverImage, { upsert: false });

        if (uploadError) throw new Error('Failed to upload cover image: ' + uploadError.message);

        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(fileName);

        finalCoverUrl = publicUrl;
      } else if (typeof coverImage === 'string') {
        finalCoverUrl = coverImage;
      }

      const payload = {
        type,
        title,
        description,
        preacher: type === 'sermon' ? preacher : null,
        seriesId: type === 'sermon' && seriesId !== 'none' ? seriesId : null,
        eventDate,
        coverImageUrl: finalCoverUrl,
      };

      const res = await fetch(`/api/admin/imports/${id}/enrich`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to publish');
      }

      toast.success(`${type === 'sermon' ? 'Sermon' : 'Photo Album'} published successfully!`);
      router.push('/admin/imports');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during publishing');
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error && !importRecord) return <div className="p-8 text-danger">{error}</div>;

  return (
    <div className="max-w-3xl">
      <Link href="/admin/imports" className="flex items-center gap-2 text-ink-muted hover:text-ink transition-colors font-semibold text-sm mb-6">
        <ArrowLeft size={16} /> Back to Inbox
      </Link>

      <div className="mb-8">
        <h1 style={{ font: 'var(--text-h1)', color: 'var(--color-ink)', margin: '0 0 4px' }}>Review & Enrich</h1>
        <div style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)' }}>
          File: <span className="font-semibold text-ink">{importRecord?.file_name}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface border border-border p-8 rounded-md flex flex-col gap-6">
        
        <RadioGroup 
          label="What type of content is this?"
          options={[
            { value: 'sermon', label: 'Sermon', description: 'Audio or video of a Sunday service or teaching.' },
            { value: 'photo_album', label: 'Photo Album', description: 'A collection of photos from an event.' }
          ]}
          value={type}
          onChange={setType}
        />

        <div className="h-px bg-border my-2" />

        <FormField label="Title" htmlFor="title">
          <Input
            id="title"
            value={title}
            onChange={setTitle}
            placeholder="e.g. Walking in Faith"
            required
          />
        </FormField>

        {type === 'sermon' && (
          <FormField label="Preacher / Speaker" htmlFor="preacher">
            <Input
              id="preacher"
              value={preacher}
              onChange={setPreacher}
              placeholder="e.g. Pastor John Doe"
            />
          </FormField>
        )}

        {type === 'sermon' && (
          <FormField label="Series">
            <Select value={seriesId} onChange={setSeriesId} options={seriesOptions} />
          </FormField>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide font-body">Description / Notes</label>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Brief description, notes, or scripture references..."
          />
        </div>

        <FormField label={type === 'sermon' ? "Date Preached" : "Event Date"} htmlFor="eventDate">
          <Input
            id="eventDate"
            type="date"
            value={eventDate}
            onChange={setEventDate}
            required
          />
        </FormField>

        <SupabaseImageUpload 
          label="Cover Image"
          value={coverImage}
          onChange={setCoverImage}
          hint="Aspect ratio 3:4 recommended."
        />

        {error && (
          <div className="p-4 bg-danger/10 border border-danger text-danger rounded-md font-semibold text-sm">
            {error}
          </div>
        )}

        <div className="pt-4 border-t border-border flex justify-end">
          <Button type="submit" loading={submitting} icon={<CheckCircle size={18} />}>
            Publish Content
          </Button>
        </div>

      </form>
    </div>
  );
}
