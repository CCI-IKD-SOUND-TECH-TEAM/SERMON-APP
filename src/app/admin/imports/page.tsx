'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/core/Button';
import { AdminTable } from '@/components/admin/AdminTable';
import { RefreshCw, FileText, FileAudio, FileImage, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface MediaImport {
  id: string;
  file_name: string;
  mime_type: string;
  size: number;
  status: string;
  imported_at: string;
}

export default function ImportsPage() {
  const [imports, setImports] = useState<MediaImport[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const fetchImports = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('media_imports')
      .select('*')
      .eq('status', 'PENDING')
      .order('imported_at', { ascending: false });
      
    if (!error && data) {
      setImports(data);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchImports();
  }, [fetchImports]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/drive/sync', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Sync complete. Found ${data.newImports} new items.`);
        await fetchImports();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Sync failed');
        console.error("Sync failed", data);
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while syncing');
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const getIconForMime = (mime: string) => {
    if (mime.startsWith('audio/')) return <FileAudio size={18} className="text-primary" />;
    if (mime.startsWith('image/')) return <FileImage size={18} className="text-primary" />;
    return <FileText size={18} className="text-ink-muted" />;
  };

  const formatFileSize = (bytes?: number | null) => {
    if (bytes == null) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-h1 text-ink m-0 mb-1">Pending Inbox</h1>
          <div className="font-body text-ink-muted">
            Files uploaded to the Google Drive Ready folder await curation.
          </div>
        </div>
        <Button 
          icon={<RefreshCw size={16} className={syncing ? "animate-spin" : ""} />} 
          loading={syncing}
          onClick={handleSync}
        >
          {syncing ? 'Syncing...' : 'Sync Google Drive'}
        </Button>
      </div>

      <div>
        {loading ? (
          <div className="bg-surface border border-border rounded-md overflow-hidden p-8 text-center text-ink-muted font-body">Loading inbox...</div>
        ) : imports.length === 0 ? (
          <div className="bg-surface border border-border rounded-md overflow-hidden p-12 flex flex-col items-center justify-center text-ink-muted border-dashed border-2 m-4">
            <AlertCircle className="mb-4" size={32} />
            <h3 className="font-display text-lg font-semibold text-ink mb-1">Inbox is empty</h3>
            <p className="font-body text-sm text-center max-w-sm">
              All files from Google Drive have been processed. Ask the media team to move folders to the 'Ready' folder, then click Sync.
            </p>
          </div>
        ) : (
          <AdminTable<MediaImport>
            columns={[
              {
                key: 'file_name',
                label: 'File Name',
                render: (row) => (
                  <div className="flex items-center gap-3">
                    {getIconForMime(row.mime_type)}
                    <span className="font-semibold text-ink text-sm">{row.file_name}</span>
                  </div>
                ),
              },
              {
                key: 'size',
                label: 'Size',
                render: (row) => formatFileSize(row.size),
              },
              {
                key: 'imported_at',
                label: 'Date Found',
                render: (row) => new Date(row.imported_at).toLocaleDateString(),
              },
            ]}
            rows={imports}
            actionLabel="Action"
            renderActions={(row) => (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => router.push(`/admin/imports/${row.id}/enrich`)}
              >
                Needs Action
              </Button>
            )}
          />
        )}
      </div>
    </div>
  );
}
