'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Archive, Check, Pencil } from 'lucide-react';
import { AdminTable } from '@/components/admin/AdminTable';
import { Badge } from '@/components/data-display/Badge';
import { IconButton } from '@/components/core/IconButton';
import { api } from '@/lib/api';
import type { ContentRow } from '@/lib/types';

export interface ContentTableProps {
  rows: ContentRow[];
  onChanged: () => void;
}

/**
 * ContentTable — admin content/review table wired to the stub API.
 * Edit (sermons) opens the metadata editor; Publish/Archive PATCH status.
 */
export function ContentTable({ rows, onChanged }: ContentTableProps) {
  const router = useRouter();
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function change(row: ContentRow, status: ContentRow['status']) {
    setBusyId(row.id);
    try {
      await api.setStatus(row.kind, row.id, status);
      onChanged();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminTable<ContentRow>
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'type', label: 'Type' },
        { key: 'date', label: 'Date' },
        { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
      ]}
      rows={rows}
      renderActions={(row) => (
        <div className={`flex gap-1 justify-end ${busyId === row.id ? 'opacity-50' : 'opacity-100'}`}>
          {row.kind === 'sermon' && (
            <IconButton
              label="Edit"
              size="inline"
              icon={<Pencil width={16} height={16} />}
              onClick={() => router.push(`/admin/sermons/${row.id}/edit`)}
            />
          )}
          {row.status !== 'published' && (
            <IconButton
              label="Publish"
              size="inline"
              icon={<Check width={16} height={16} />}
              onClick={() => change(row, 'published')}
            />
          )}
          {row.status !== 'archived' && (
            <IconButton
              label="Archive"
              size="inline"
              icon={<Archive width={16} height={16} />}
              onClick={() => change(row, 'archived')}
            />
          )}
        </div>
      )}
    />
  );
}
