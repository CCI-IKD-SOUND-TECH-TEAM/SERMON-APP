'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { SermonCard } from '@/components/data-display/SermonCard';
import { api } from '@/lib/api';
import type { Sermon } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const [sermons, setSermons] = React.useState<Sermon[] | null>(null);

  React.useEffect(() => {
    api.sermons().then(setSermons).catch(() => setSermons([]));
  }, []);

  const featured = sermons?.find(s => s.is_featured);
  const recent = sermons?.filter(s => s.id !== featured?.id).slice(0, featured ? 5 : 6);

  return (
    <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'var(--space-8) var(--container-pad)' }}>
      {/* Featured Sermon */}
      {featured ? (
        <div 
          onClick={() => router.push(`/sermons/${featured.id}`)}
          style={{ 
            marginBottom: 'var(--space-12)', 
            cursor: 'pointer',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div 
            style={{ 
              width: '100%', 
              maxWidth: '320px',
              aspectRatio: '3/4',
              position: 'relative',
              backgroundColor: 'var(--color-border)',
              margin: '0 auto',
            }} 
          >
            {featured.thumbnail_url && !featured.thumbnail_url.startsWith('#') && (
              <Image
                src={featured.thumbnail_url}
                alt={featured.title}
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                style={{ objectFit: 'cover' }}
                priority
              />
            )}
          </div>
          <div style={{ padding: 'var(--space-6)' }}>
            <div
              style={{
                font: 'var(--text-overline)',
                letterSpacing: 'var(--tracking-overline)',
                textTransform: 'uppercase',
                color: 'var(--color-primary)',
                marginBottom: 8,
              }}
            >
              Featured Sermon
            </div>
            <h1 style={{ font: 'var(--text-hero)', color: 'var(--color-ink)', margin: '0 0 10px' }}>
              {featured.title}
            </h1>
            <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)', maxWidth: 800, margin: '0 0 var(--space-4)' }}>
              {featured.description || 'Watch the latest message from our team.'}
            </p>
            <div style={{ font: 'var(--text-body-sm)', color: 'var(--color-ink-muted)' }}>
              {featured.speaker || 'Unknown'} • {featured.sermon_date ? new Date(featured.sermon_date).toLocaleDateString() : 'Unknown date'}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div
            style={{
              font: 'var(--text-overline)',
              letterSpacing: 'var(--tracking-overline)',
              textTransform: 'uppercase',
              color: 'var(--color-ink-muted)',
              marginBottom: 8,
            }}
          >
            New messages
          </div>
          <h1 style={{ font: 'var(--text-hero)', color: 'var(--color-ink)', margin: '0 0 10px' }}>
            Latest from the Sunday series
          </h1>
          <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)', maxWidth: 560, margin: 0 }}>
            Every message, ready to watch, listen, or download — right after it&apos;s preached.
          </p>
        </div>
      )}

      <div
        className="responsive-header"
        style={{
          marginBottom: 'var(--space-4)',
        }}
      >
        <h2 style={{ font: 'var(--text-h2)', color: 'var(--color-ink)', margin: 0 }}>Recent sermons</h2>
        <div style={{ display: 'flex', gap: 16 }}>
          <button
            onClick={() => router.push('/sermons')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-ink-muted)',
              font: '600 15px/1 var(--font-body)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            All sermons <ArrowRight width={16} height={16} />
          </button>
          <button
            onClick={() => router.push('/photos')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              font: '600 15px/1 var(--font-body)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            Browse photos <ArrowRight width={16} height={16} />
          </button>
        </div>
      </div>

      {recent === null || recent === undefined ? (
        <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)' }}>Loading sermons…</p>
      ) : recent.length === 0 ? (
        <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)' }}>
          No recent sermons to display.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--space-6)',
          }}
        >
          {recent.map((s, i) => (
            <SermonCard
              key={s.id}
              title={s.title}
              speaker={s.speaker ?? 'Unknown'}
              date={s.sermon_date ?? ''}
              duration=""
              tags={s.tags ?? []}
              thumbnail={s.thumbnail_url ?? ''}
              onClick={() => router.push(`/sermons/${s.id}`)}
              priority={i < 3}
            />
          ))}
        </div>
      )}
    </div>
  );
}
