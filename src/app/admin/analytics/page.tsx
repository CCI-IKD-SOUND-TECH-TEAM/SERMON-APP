'use client';

import React from 'react';
import Image from 'next/image';
import { Headphones, TrendingUp, Trophy } from 'lucide-react';
import { api } from '@/lib/api';

interface AnalyticsData {
  totalPlays: number;
  playsLast7d: number;
  playsLast30d: number;
  mostPlayed: { id: string; title: string; speaker: string | null; thumbnail_url: string | null; plays: number }[];
  dailyTrend: { date: string; plays: number }[];
}

function formatShortDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 200,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-6)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: 'var(--color-ink-muted)',
          marginBottom: 8,
          font: '600 13px/1 var(--font-body)',
        }}
      >
        {icon} {label}
      </div>
      <div style={{ font: 'var(--text-hero)', color: 'var(--color-ink)', fontVariantNumeric: 'proportional-nums' }}>{value}</div>
    </div>
  );
}

function DailyTrendChart({ data }: { data: { date: string; plays: number }[] }) {
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.plays));
  const chartHeight = 160;

  return (
    <div>
      <h2 style={{ font: 'var(--text-h3)', color: 'var(--color-ink)', margin: '0 0 4px' }}>Plays per day</h2>
      <div style={{ font: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-4)' }}>
        Last {data.length} days
      </div>

      <div style={{ position: 'relative', display: 'flex', gap: 8 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: chartHeight,
            font: 'var(--text-body-sm)',
            color: 'var(--color-ink-muted)',
            fontVariantNumeric: 'tabular-nums',
            paddingBottom: 20,
          }}
        >
          <span>{max}</span>
          <span>0</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              position: 'relative',
              height: chartHeight,
              display: 'flex',
              alignItems: 'flex-end',
              gap: 2,
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <div
              aria-hidden="true"
              style={{ position: 'absolute', left: 0, right: 0, top: 0, borderTop: '1px solid var(--color-border)' }}
            />
            <div
              aria-hidden="true"
              style={{ position: 'absolute', left: 0, right: 0, top: '50%', borderTop: '1px solid var(--color-border)' }}
            />

            {data.map((d, i) => {
              const heightPct = (d.plays / max) * 100;
              const isHovered = hoverIndex === i;
              return (
                <div
                  key={d.date}
                  tabIndex={0}
                  role="img"
                  aria-label={`${formatShortDate(d.date)}: ${d.plays} play${d.plays === 1 ? '' : 's'}`}
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                  onFocus={() => setHoverIndex(i)}
                  onBlur={() => setHoverIndex(null)}
                  style={{
                    position: 'relative',
                    flex: 1,
                    maxWidth: 24,
                    height: `${Math.max(heightPct, 1.5)}%`,
                    background: isHovered ? 'var(--color-primary-dark)' : 'var(--color-primary)',
                    borderRadius: '4px 4px 0 0',
                    cursor: 'default',
                    transition: 'background var(--motion-fast)',
                  }}
                >
                  {isHovered && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginBottom: 6,
                        background: 'var(--color-ink)',
                        color: 'var(--color-bg)',
                        font: '600 12px/1 var(--font-body)',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        whiteSpace: 'nowrap',
                        zIndex: 5,
                        pointerEvents: 'none',
                      }}
                    >
                      {d.plays} play{d.plays === 1 ? '' : 's'} · {formatShortDate(d.date)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {data
              .filter((_, i) => i % 5 === 0)
              .map((d) => (
                <span key={d.date} style={{ font: 'var(--text-body-sm)', color: 'var(--color-ink-muted)' }}>
                  {formatShortDate(d.date)}
                </span>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    api
      .analytics()
      .then(setData)
      .catch((err) => setError(err.message || 'Failed to load analytics'));
  }, []);

  return (
    <div>
      <h1 style={{ font: 'var(--text-h1)', color: 'var(--color-ink)', margin: '0 0 4px' }}>Analytics</h1>
      <div style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-8)' }}>
        Sermon play tracking. For site-wide traffic (page views, visitors, referrers), see{' '}
        <a
          href="https://vercel.com/docs/analytics"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--color-primary)' }}
        >
          Vercel Analytics
        </a>{' '}
        on your project dashboard.
      </div>

      {error && (
        <div
          style={{
            background: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-6)',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-6)', marginBottom: 'var(--space-8)', flexWrap: 'wrap' }}>
        <StatTile icon={<Headphones width={16} height={16} />} label="Total plays" value={data?.totalPlays ?? '...'} />
        <StatTile icon={<TrendingUp width={16} height={16} />} label="Plays, last 7 days" value={data?.playsLast7d ?? '...'} />
        <StatTile icon={<TrendingUp width={16} height={16} />} label="Plays, last 30 days" value={data?.playsLast30d ?? '...'} />
      </div>

      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-8)',
        }}
      >
        {data ? (
          <DailyTrendChart data={data.dailyTrend} />
        ) : (
          <div style={{ color: 'var(--color-ink-muted)' }}>Loading…</div>
        )}
      </div>

      <h2 style={{ font: 'var(--text-h2)', color: 'var(--color-ink)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Trophy width={20} height={20} /> Most listened to
      </h2>
      <div style={{ font: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-4)' }}>
        Ranked by confirmed plays, all time
      </div>

      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
        {!data ? (
          <div style={{ padding: 'var(--space-6)', color: 'var(--color-ink-muted)' }}>Loading…</div>
        ) : data.mostPlayed.length === 0 ? (
          <div style={{ padding: 'var(--space-6)', color: 'var(--color-ink-muted)' }}>
            No plays recorded yet. A play counts once someone has listened for 30+ seconds.
          </div>
        ) : (
          data.mostPlayed.map((s, i) => (
            <div
              key={s.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 'var(--space-4) var(--space-6)',
                borderBottom: i < data.mostPlayed.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              <div
                style={{
                  width: 24,
                  textAlign: 'center',
                  font: '600 14px/1 var(--font-body)',
                  color: 'var(--color-ink-muted)',
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: 'var(--color-border)',
                  position: 'relative',
                }}
              >
                {s.thumbnail_url && !s.thumbnail_url.startsWith('#') && (
                  <Image src={s.thumbnail_url} alt="" fill sizes="40px" style={{ objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    font: '600 14px/1.3 var(--font-body)',
                    color: 'var(--color-ink)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {s.title}
                </div>
                <div style={{ font: 'var(--text-body-sm)', color: 'var(--color-ink-muted)' }}>{s.speaker ?? 'Unknown speaker'}</div>
              </div>
              <div style={{ font: '600 15px/1 var(--font-body)', color: 'var(--color-ink)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                {s.plays} play{s.plays === 1 ? '' : 's'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
