'use client';

import React from 'react';
import { ContentTable } from './_components/ContentTable';
import { api } from '@/lib/api';
import type { ContentRow } from '@/lib/types';
import { Film, Image as ImageIcon, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [all, setAll] = React.useState<ContentRow[]>([]);
  const [stats, setStats] = React.useState<{ sermons: number, albums: number } | null>(null);
  const [loaded, setLoaded] = React.useState(false);

  const refresh = React.useCallback(() => {
    Promise.all([api.content(), api.stats()]).then(([a, s]) => {
      setAll(a);
      setStats(s);
      setLoaded(true);
    });
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div>
      <h1 style={{ font: 'var(--text-h1)', color: 'var(--color-ink)', margin: '0 0 4px' }}>Dashboard</h1>
      <div style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-8)' }}>
        Manage your sermons and photo albums.
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-6)', marginBottom: 'var(--space-12)', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-ink-muted)', marginBottom: 8, font: '600 13px/1 var(--font-body)' }}>
            <Film width={16} height={16} /> Total Sermons
          </div>
          <div style={{ font: 'var(--text-hero)', color: 'var(--color-ink)' }}>{stats?.sermons ?? '...'}</div>
        </div>
        <div style={{ flex: 1, minWidth: 200, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-ink-muted)', marginBottom: 8, font: '600 13px/1 var(--font-body)' }}>
            <ImageIcon width={16} height={16} /> Photo Albums
          </div>
          <div style={{ font: 'var(--text-hero)', color: 'var(--color-ink)' }}>{stats?.albums ?? '...'}</div>
        </div>
      </div>

      <h2 style={{ font: 'var(--text-h2)', color: 'var(--color-ink)', margin: '0 0 12px' }}>All content</h2>
      <ContentTable rows={all} onChanged={refresh} />
    </div>
  );
}
