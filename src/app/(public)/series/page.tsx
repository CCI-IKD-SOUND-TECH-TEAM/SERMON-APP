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
    <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'var(--space-8) var(--container-pad)' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ font: 'var(--text-h1)', color: 'var(--color-ink)', margin: '0 0 12px' }}>Sermon Series</h1>
        <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)', margin: 0, maxWidth: 600 }}>
          Browse our teachings organized by topic and study series.
        </p>
      </div>

      {loading ? (
        <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)' }}>Loading series...</p>
      ) : series.length === 0 ? (
        <div style={{ padding: 'var(--space-12) 0', textAlign: 'center', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <h3 style={{ font: 'var(--text-h3)', color: 'var(--color-ink)', margin: '0 0 8px' }}>No series found</h3>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--space-6)',
          }}
        >
          {series.map((s) => (
            <Link
              key={s.id}
              href={`/series/${s.id}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                textDecoration: 'none',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                transition: 'transform var(--motion-base)',
              }}
            >
              <div
                style={{
                  aspectRatio: '3/4',
                  background: s.cover_image_url ? `url(${s.cover_image_url}) center/cover` : 'var(--color-border)',
                }}
              />
              <div style={{ padding: 'var(--space-4)' }}>
                <div style={{ font: 'var(--text-h3)', color: 'var(--color-ink)', marginBottom: 4 }}>{s.title}</div>
                {s.description && (
                  <div style={{ font: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
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
