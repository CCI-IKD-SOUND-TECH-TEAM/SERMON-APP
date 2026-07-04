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
    <div className="max-w-[var(--container-max)] mx-auto py-8 px-[var(--container-pad)]">
      {/* Featured Sermon */}
      {featured ? (
        <div 
          onClick={() => router.push(`/sermons/${featured.id}`)}
          className="mb-12 cursor-pointer bg-surface border border-border rounded-lg overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-1"
        >
          <div 
            className="w-full max-w-[320px] aspect-[3/4] relative bg-border mx-auto"
          >
            {featured.thumbnail_url && !featured.thumbnail_url.startsWith('#') && (
              <Image
                src={featured.thumbnail_url}
                alt={featured.title}
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                className="object-cover"
                priority
              />
            )}
          </div>
          <div className="p-6">
            <div className="font-overline tracking-overline uppercase text-primary mb-2">
              Featured Sermon
            </div>
            <h1 className="font-hero text-ink m-0 mb-2.5">
              {featured.title}
            </h1>
            <p className="font-body text-ink-muted max-w-[800px] m-0 mb-4">
              {featured.description || 'Watch the latest message from our team.'}
            </p>
            <div className="font-body-sm text-ink-muted">
              {featured.speaker || 'Unknown'} • {featured.sermon_date ? new Date(featured.sermon_date).toLocaleDateString() : 'Unknown date'}
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8">
          <div className="font-overline tracking-overline uppercase text-ink-muted mb-2">
            New messages
          </div>
          <h1 className="font-hero text-ink m-0 mb-2.5">
            Latest from the Sunday series
          </h1>
          <p className="font-body text-ink-muted max-w-[560px] m-0">
            Every message, ready to watch, listen, or download — right after it&apos;s preached.
          </p>
        </div>
      )}

      <div className="responsive-header mb-4">
        <h2 className="font-h2 text-ink m-0">Recent sermons</h2>
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/sermons')}
            className="bg-transparent border-none text-ink-muted font-semibold text-[15px] leading-none font-body cursor-pointer flex items-center gap-1.5 hover:text-ink transition-colors"
          >
            All sermons <ArrowRight width={16} height={16} />
          </button>
          <button
            onClick={() => router.push('/photos')}
            className="bg-transparent border-none text-primary font-semibold text-[15px] leading-none font-body cursor-pointer flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            Browse photos <ArrowRight width={16} height={16} />
          </button>
        </div>
      </div>

      {recent === null || recent === undefined ? (
        <p className="font-body text-ink-muted">Loading sermons…</p>
      ) : recent.length === 0 ? (
        <p className="font-body text-ink-muted">
          No recent sermons to display.
        </p>
      ) : (
        <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
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
