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
      <div className="responsive-header mb-8">
        <div>
          <h1 className="font-h1 text-ink m-0 mb-1">{title}</h1>
          <div className="font-body text-ink-muted">
            {loaded ? `${rows.length} ${rows.length === 1 ? 'item' : 'items'}` : 'Loading…'}
          </div>
        </div>
        <a 
          href={`/admin/${kind}s/new`}
          className="bg-primary text-surface py-2 px-4 rounded-sm no-underline font-semibold text-[14px] leading-none font-body hover:bg-primary-dark transition-colors"
        >
          + New
        </a>
      </div>
      {rows.length === 0 && loaded ? (
        <p className="font-body text-ink-muted">
          Nothing here yet — click &apos;New&apos; to get started.
        </p>
      ) : (
        <ContentTable rows={rows} onChanged={refresh} />
      )}
    </div>
  );
}
