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
      className="text-ink-muted font-semibold text-[14px] leading-none font-body no-underline inline-flex items-center gap-[6px] mb-6 hover:text-ink transition-colors"
    >
      <ChevronLeft width={16} height={16} /> Back to all series
    </Link>
  );

  const publishedSermons = (series?.sermons || []).filter((s: Sermon) => s.status === 'published');

  return (
    <div className="max-w-[var(--container-max)] mx-auto py-8 px-[var(--container-pad)]">
      {backLink}

      {(!series || error) ? (
        <p className="font-body text-ink-muted">
          That series couldn&apos;t be found.
        </p>
      ) : (
        <>
          <div
            className="aspect-[3/4] w-full max-w-[320px] rounded-md mb-6"
            style={{
              background: series.cover_image_url ? `url(${series.cover_image_url}) center/cover` : 'var(--color-border)',
            }}
          />

          <h1 className="font-h1 text-ink m-0 mb-2">{series.title}</h1>
          <div className="font-body text-ink-muted mb-6 max-w-[600px]">
            {series.description || 'No description provided.'}
          </div>

          <div className="flex gap-3 mb-8">
            <ShareButton
              title={series.title}
              text={`Explore sermons in the ${series.title} series`}
              label="Share Series"
            />
          </div>

          <h2 className="font-h2 text-ink m-0 mb-4">
            Sermons in this series ({publishedSermons.length})
          </h2>

          {publishedSermons.length === 0 ? (
            <p className="font-body text-ink-muted">No sermons have been published in this series yet.</p>
          ) : (
            <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
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
