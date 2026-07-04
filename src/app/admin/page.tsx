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
      <h1 className="font-h1 text-ink m-0 mb-1">Dashboard</h1>
      <div className="font-body text-ink-muted mb-8">
        Manage your sermons and photo albums.
      </div>

      <div className="flex gap-6 mb-12 flex-wrap">
        <div className="flex-1 min-w-[200px] bg-surface border border-border rounded-md p-6">
          <div className="flex items-center gap-2 text-ink-muted mb-2 font-semibold text-[13px] leading-none font-body">
            <Film width={16} height={16} /> Total Sermons
          </div>
          <div className="font-hero text-ink">{stats?.sermons ?? '...'}</div>
        </div>
        <div className="flex-1 min-w-[200px] bg-surface border border-border rounded-md p-6">
          <div className="flex items-center gap-2 text-ink-muted mb-2 font-semibold text-[13px] leading-none font-body">
            <ImageIcon width={16} height={16} /> Photo Albums
          </div>
          <div className="font-hero text-ink">{stats?.albums ?? '...'}</div>
        </div>
      </div>

      <h2 className="font-h2 text-ink m-0 mb-3">All content</h2>
      <ContentTable rows={all} onChanged={refresh} />
    </div>
  );
}
