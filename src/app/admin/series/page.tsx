'use client';

import React from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { toast } from 'sonner';
import { Button } from '@/components/core/Button';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { SupabaseImageUpload } from '@/components/forms/SupabaseImageUpload';
import { Select } from '@/components/forms/Select';
import { AdminTable } from '@/components/admin/AdminTable';
import { api } from '@/lib/api';
import type { Series, ContentRow } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

export default function AdminSeriesPage() {
  const [series, setSeries] = React.useState<Series[]>([]);
  const [allContent, setAllContent] = React.useState<ContentRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [coverImage, setCoverImage] = React.useState<File | string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [seriesToDelete, setSeriesToDelete] = React.useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [managingSermons, setManagingSermons] = React.useState(false);
  const [selectedSermon, setSelectedSermon] = React.useState('none');
  const supabase = createClient();

  const loadSeries = React.useCallback(async () => {
    setLoading(true);
    try {
      const [seriesData, contentData] = await Promise.all([
        api.allSeries(),
        api.content()
      ]);
      setSeries(seriesData);
      setAllContent(contentData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSeries();
  }, [loadSeries]);

  function startEdit(s: Series | null) {
    if (s) {
      setEditingId(s.id);
      setTitle(s.title);
      setDescription(s.description || '');
      setCoverImage(s.cover_image_url || null);
    } else {
      setEditingId('new');
      setTitle('');
      setDescription('');
      setCoverImage(null);
    }
    setSelectedSermon('none');
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;
    setSaving(true);
    try {
      let finalCoverUrl = '';
      if (coverImage instanceof File) {
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

      if (editingId === 'new') {
        await api.createSeries({ title, description, cover_image_url: finalCoverUrl });
      } else if (editingId) {
        await api.updateSeries(editingId, { title, description, cover_image_url: finalCoverUrl });
      }
      setEditingId(null);
      await loadSeries();
      toast.success('Series saved successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save series');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!seriesToDelete) return;
    setDeleteLoading(true);
    try {
      await api.deleteSeries(seriesToDelete);
      setSeries(series.filter((s) => s.id !== seriesToDelete));
      toast.success('Series deleted successfully');
      setSeriesToDelete(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete series');
    } finally {
      setDeleteLoading(false);
    }
  }

  async function removeSermon(sermonId: string) {
    setManagingSermons(true);
    try {
      await api.updateSermon(sermonId, { series_id: null });
      await loadSeries();
      toast.success('Sermon removed from series');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove sermon');
    } finally {
      setManagingSermons(false);
    }
  }

  async function addSermon() {
    if (selectedSermon === 'none' || !editingId || editingId === 'new') return;
    setManagingSermons(true);
    try {
      await api.updateSermon(selectedSermon, { series_id: editingId });
      setSelectedSermon('none');
      await loadSeries();
      toast.success('Sermon added to series');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add sermon');
    } finally {
      setManagingSermons(false);
    }
  }

  return (
    <div className="max-w-[800px]">
      <div className="responsive-header mb-8">
        <h1 className="font-h1 text-ink m-0 mb-2">Series Manager</h1>
        {!editingId && (
          <Button variant="primary" onClick={() => startEdit(null)}>
            <Plus width={16} height={16} style={{ marginRight: 6 }} />
            New series
          </Button>
        )}
      </div>

      {editingId && (
        <div className="bg-surface border border-border rounded-md p-6 mb-8">
          <h2 className="font-h3 text-ink m-0 mb-4">
            {editingId === 'new' ? 'Create Series' : 'Edit Series'}
          </h2>
          <form onSubmit={saveEdit} className="flex flex-col gap-4">
            <FormField label="Title" htmlFor="title">
              <Input id="title" value={title} onChange={setTitle} />
            </FormField>
            <FormField label="Description" htmlFor="description">
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[100px] py-2 px-3 rounded-sm border border-border bg-bg text-ink font-body resize-y"
              />
            </FormField>
            <SupabaseImageUpload
              label="Cover Image"
              value={coverImage}
              onChange={setCoverImage}
              hint="Aspect ratio 3:4 recommended for series."
            />
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={cancelEdit}>Cancel</Button>
              <Button type="submit" variant="primary" loading={saving}>Save</Button>
            </div>
          </form>

          {editingId !== 'new' && (
            <div className="mt-8 border-t border-border pt-6">
              <h3 className="font-h3 text-ink mb-4">Sermons in this Series</h3>
              {allContent.filter(c => c.kind === 'sermon' && c.series_id === editingId).length === 0 ? (
                <p className="font-body text-ink-muted mb-4">No sermons attached yet.</p>
              ) : (
                <ul className="list-none p-0 m-0 mb-4 flex flex-col gap-2">
                  {allContent.filter(c => c.kind === 'sermon' && c.series_id === editingId).map(sermon => (
                    <li key={sermon.id} className="flex justify-between items-center bg-bg py-2 px-3 rounded-sm">
                      <span className="font-body text-ink">{sermon.title}</span>
                      <button type="button" onClick={() => removeSermon(sermon.id)} disabled={managingSermons} className="bg-transparent border-none text-danger cursor-pointer font-semibold text-[12px] leading-none font-body hover:text-[#932F16] transition-colors disabled:opacity-50">Remove</button>
                    </li>
                  ))}
                </ul>
              )}
              
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Select
                    value={selectedSermon}
                    onChange={setSelectedSermon}
                    options={[
                      { value: 'none', label: 'Select a sermon to add...' },
                      ...allContent.filter(c => c.kind === 'sermon' && c.series_id !== editingId).map(c => ({ value: c.id, label: c.title }))
                    ]}
                  />
                </div>
                <Button type="button" variant="secondary" onClick={() => addSermon()} disabled={selectedSermon === 'none' || managingSermons} loading={managingSermons}>
                  Add
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <p className="font-body text-ink-muted">Loading series...</p>
      ) : series.length === 0 ? (
        <p className="font-body text-ink-muted">No series created yet.</p>
      ) : (
        <AdminTable<Series>
          columns={[
            { key: 'title', label: 'Title', render: (s) => s.title },
            { key: 'created_at', label: 'Created At', render: (s) => new Date(s.created_at).toLocaleDateString() },
          ]}
          rows={series}
          renderActions={(s) => (
            <div className="flex gap-2 justify-end">
              <button onClick={() => startEdit(s)} className="bg-transparent border-none text-ink-muted cursor-pointer p-1 hover:text-ink transition-colors" title="Edit">
                <Edit2 width={16} height={16} />
              </button>
              <button onClick={() => setSeriesToDelete(s.id)} className="bg-transparent border-none text-danger cursor-pointer p-1 hover:text-[#932F16] transition-colors" title="Delete">
                <Trash2 width={16} height={16} />
              </button>
            </div>
          )}
        />
      )}

      <ConfirmModal
        isOpen={!!seriesToDelete}
        title="Delete Series"
        message="Are you sure you want to delete this series? The sermons will not be deleted, but they will no longer be grouped."
        confirmText="Delete Series"
        onConfirm={handleDelete}
        onCancel={() => setSeriesToDelete(null)}
        isLoading={deleteLoading}
      />
    </div>
  );
}
