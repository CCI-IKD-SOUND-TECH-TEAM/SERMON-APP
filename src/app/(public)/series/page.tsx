'use client';

import React from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Series } from '@/lib/types';

export default function SeriesIndexPage() {
  const [series, setSeries] = React.useState<Series[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    api.publicSeries().then((data) => {
      setSeries(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-[var(--container-max)] mx-auto py-8 px-[var(--container-pad)]">
      <div className="mb-8">
        <h1 className="font-h1 text-ink m-0 mb-3">Sermon Series</h1>
        <p className="font-body text-ink-muted m-0 max-w-[600px]">
          Browse our teachings organized by topic and study series.
        </p>
      </div>

      {loading ? (
        <p className="font-body text-ink-muted">Loading series...</p>
      ) : series.length === 0 ? (
        <div className="py-12 px-0 text-center bg-surface rounded-md border border-border">
          <h3 className="font-h3 text-ink m-0 mb-2">No series found</h3>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
          {series.map((s) => (
            <Link
              key={s.id}
              href={`/series/${s.id}`}
              className="flex flex-col no-underline bg-surface border border-border rounded-md overflow-hidden transition-transform duration-200 hover:-translate-y-1"
            >
              <div
                className="aspect-[3/4]"
                style={{
                  background: s.cover_image_url ? `url(${s.cover_image_url}) center/cover` : 'var(--color-border)',
                }}
              />
              <div className="p-4">
                <div className="font-h3 text-ink mb-1">{s.title}</div>
                {s.description && (
                  <div className="font-body-sm text-ink-muted line-clamp-2">
                    {s.description}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
