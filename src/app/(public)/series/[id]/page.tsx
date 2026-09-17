import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { SermonCard } from '@/components/data-display/SermonCard';
import { ShareButton } from '@/components/actions/ShareButton';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import type { Sermon } from '@/lib/types';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: series } = await supabase.from('series').select('*').eq('id', id).single();

  if (!series) {
    return { title: 'Series Not Found' };
  }

  const desc = series.description || `Explore sermons in the ${series.title} series.`;

  return {
    title: series.title,
    description: desc,
    openGraph: {
      title: series.title,
      description: desc,
      images: series.cover_image_url ? [series.cover_image_url] : [],
      type: 'website',
    },
  };
}

export default async function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: series, error } = await supabase.from('series').select('*, sermons(*)').eq('id', id).single();

  const backLink = (
    <Link
      href="/series"
      style={{
        color: 'var(--color-ink-muted)',
        font: '600 14px/1 var(--font-body)',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 'var(--space-6)',
      }}
    >
      <ChevronLeft width={16} height={16} /> Back to all series
    </Link>
  );

  // Ascending within a series — follow the teaching order (Part 1 first),
  // unlike the site-wide listings which show newest first.
  const publishedSermons = (series?.sermons || [])
    .filter((s: Sermon) => s.status === 'published')
    .sort((a: Sermon, b: Sermon) => {
      const dateA = a.sermon_date ? new Date(a.sermon_date).getTime() : 0;
      const dateB = b.sermon_date ? new Date(b.sermon_date).getTime() : 0;
      return dateA - dateB;
    });

  return (
    <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'var(--space-8) var(--container-pad)' }}>
      {backLink}

      {(!series || error) ? (
        <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)' }}>
          That series couldn&apos;t be found.
        </p>
      ) : (
        <>
          <div
            style={{
              aspectRatio: '3/4',
              width: '100%',
              maxWidth: 320,
              background: series.cover_image_url ? `url(${series.cover_image_url}) center/cover` : 'var(--color-border)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-6)',
            }}
          />

          <h1 style={{ font: 'var(--text-h1)', color: 'var(--color-ink)', margin: '0 0 8px' }}>{series.title}</h1>
          <div style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-6)', maxWidth: 600 }}>
            {series.description || 'No description provided.'}
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 'var(--space-8)' }}>
            <ShareButton
              title={series.title}
              text={`Explore sermons in the ${series.title} series`}
              label="Share Series"
            />
          </div>

          <h2 style={{ font: 'var(--text-h2)', color: 'var(--color-ink)', margin: '0 0 16px' }}>
            Sermons in this series ({publishedSermons.length})
          </h2>

          {publishedSermons.length === 0 ? (
            <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)' }}>No sermons have been published in this series yet.</p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 'var(--space-6)',
              }}
            >
              {publishedSermons.map((sermon: Sermon) => (
                <SermonCard
                  key={sermon.id}
                  href={`/sermons/${sermon.id}`}
                  title={sermon.title}
                  speaker={sermon.speaker || 'Unknown'}
                  date={sermon.sermon_date || 'Unknown date'}
                  thumbnail={sermon.thumbnail_url ?? ''}
                  tags={sermon.tags}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
