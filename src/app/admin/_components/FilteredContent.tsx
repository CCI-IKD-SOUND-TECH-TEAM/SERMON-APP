'use client';

import React from 'react';
import { ContentTable } from './ContentTable';
import { api } from '@/lib/api';
import type { ContentRow } from '@/lib/types';

export interface FilteredContentProps {
  title: string;
  kind: ContentRow['kind'];
}

/** Admin section listing all content of a single kind (sermons or albums). */
export function FilteredContent({ title, kind }: FilteredContentProps) {
  const [rows, setRows] = React.useState<ContentRow[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  const refresh = React.useCallback(() => {
    api.content().then((all) => {
      setRows(all.filter((r) => r.kind === kind));
      setLoaded(true);
    });
  }, [kind]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div>
      <div className="responsive-header" style={{ marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 style={{ font: 'var(--text-h1)', color: 'var(--color-ink)', margin: '0 0 4px' }}>{title}</h1>
          <div style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)' }}>
            {loaded ? `${rows.length} ${rows.length === 1 ? 'item' : 'items'}` : 'Loading…'}
          </div>
        </div>
        <a 
          href={`/admin/${kind}s/new`}
          style={{
            background: 'var(--color-primary)',
            color: 'var(--color-surface)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            textDecoration: 'none',
            font: '600 14px/1 var(--font-body)',
          }}
        >
          + New
        </a>
      </div>
      {rows.length === 0 && loaded ? (
        <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)' }}>
          Nothing here yet — click &apos;New&apos; to get started.
        </p>
      ) : (
        <ContentTable rows={rows} onChanged={refresh} />
      )}
    </div>
  );
}
