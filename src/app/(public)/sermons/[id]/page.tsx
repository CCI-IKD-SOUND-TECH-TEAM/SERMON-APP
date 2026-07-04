import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';
import { AudioPlayer } from '@/components/media/AudioPlayer';
import { Tag } from '@/components/data-display/Tag';
import { ShareButton } from '@/components/actions/ShareButton';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import sanitizeHtml from 'sanitize-html';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: sermon } = await supabase.from('sermons').select('*').eq('id', id).single();

  if (!sermon) {
    return { title: 'Sermon Not Found' };
  }

  const pureDescription = sermon.description ? sermon.description.replace(/<[^>]+>/g, '') : `Listen to ${sermon.title}`;

  return {
    title: sermon.title,
    description: pureDescription,
    openGraph: {
      title: sermon.title,
      description: pureDescription,
      images: sermon.thumbnail_url ? [sermon.thumbnail_url] : [],
      type: 'article',
    },
  };
}

export default async function SermonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: sermon, error } = await supabase.from('sermons').select('*').eq('id', id).single();

  const backLink = (
    <Link
      href="/"
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
      <ChevronLeft width={16} height={16} /> Back to sermons
    </Link>
  );

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: 'var(--space-8) var(--container-pad)' }}>
      {backLink}

      {(!sermon || error) ? (
        <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)' }}>
          That sermon couldn&apos;t be found. It may have been moved in Drive.
        </p>
      ) : (
        <>
          <div
            style={{
              aspectRatio: '3/4',
              width: '100%',
              maxWidth: '320px',
              position: 'relative',
              backgroundColor: 'var(--color-border)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-6)',
              overflow: 'hidden',
            }}
          >
            {sermon.thumbnail_url && !sermon.thumbnail_url.startsWith('#') && (
              <Image
                src={sermon.thumbnail_url}
                alt={sermon.title}
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                style={{ objectFit: 'cover' }}
                priority
              />
            )}
          </div>

          {sermon.tags && sermon.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
              {sermon.tags.map((t: string) => (
                <Tag key={t} variant="topic">
                  {t}
                </Tag>
              ))}
            </div>
          )}

          <h1 style={{ font: 'var(--text-h1)', color: 'var(--color-ink)', margin: '0 0 8px' }}>{sermon.title}</h1>
          <div style={{ font: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-6)' }}>
            {sermon.speaker} · {sermon.sermon_date}
          </div>

          <div style={{ marginBottom: 'var(--space-8)' }}>
            <AudioPlayer
              title={sermon.title}
              speaker={sermon.speaker ?? 'Unknown Speaker'}
              src={sermon.drive_file_id ? `/api/media/stream/${sermon.drive_file_id}` : undefined}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 'var(--space-8)' }}>
            <ShareButton
              title={sermon.title}
              text={`Listen to ${sermon.title} by ${sermon.speaker || 'our church'}`}
            />
          </div>

          <h2 style={{ font: 'var(--text-h2)', color: 'var(--color-ink)', margin: '0 0 12px' }}>Notes</h2>
          <div
            className="sermon-notes"
            style={{
              font: 'var(--text-body)',
              color: 'var(--color-ink)',
              maxWidth: 'var(--measure)',
            }}
            dangerouslySetInnerHTML={{
              __html: sermon.description
                ? sanitizeHtml(sermon.description)
                : '<p style="color: var(--color-ink-muted);">No notes provided.</p>'
            }}
          />

          <style dangerouslySetInnerHTML={{
            __html: `
            .sermon-notes h2 { font-size: 1.5em; font-weight: 600; margin: 1em 0 0.5em; line-height: 1.2; }
            .sermon-notes ul { list-style-type: disc; padding-left: 1.5em; margin: 0.5em 0; }
            .sermon-notes ol { list-style-type: decimal; padding-left: 1.5em; margin: 0.5em 0; }
            .sermon-notes a { color: var(--color-primary); text-decoration: underline; }
          `}} />
        </>
      )}
    </div>
  );
}
