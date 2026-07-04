'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SermonCard } from '@/components/data-display/SermonCard';
import { api } from '@/lib/api';
import type { Sermon } from '@/lib/types';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';

export default function SermonsPage() {
  return (
    <React.Suspense fallback={<p className="p-8">Loading sermons...</p>}>
      <SermonsList />
    </React.Suspense>
  );
}

function SermonsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  
  const [allSermons, setAllSermons] = React.useState<Sermon[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Filters
  const [search, setSearch] = React.useState(q);
  const [speakerFilter, setSpeakerFilter] = React.useState('all');

  React.useEffect(() => {
    setSearch(q);
  }, [q]);

  React.useEffect(() => {
    api.sermons().then((data) => {
      setAllSermons(data);
      setLoading(false);
    });
  }, []);

  // Compute unique speakers
  const speakers = React.useMemo(() => {
    const sp = new Set(allSermons.map(s => s.speaker).filter(Boolean));
    return Array.from(sp) as string[];
  }, [allSermons]);

  // Filter sermons
  const filtered = React.useMemo(() => {
    return allSermons.filter(s => {
      // 1. Search filter
      if (search) {
        const q = search.toLowerCase();
        const matchTitle = s.title.toLowerCase().includes(q);
        const matchSpeaker = s.speaker?.toLowerCase().includes(q);
        const matchDesc = s.description?.toLowerCase().includes(q);
        const matchTags = s.tags?.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchSpeaker && !matchDesc && !matchTags) return false;
      }
      // 2. Speaker filter
      if (speakerFilter !== 'all' && s.speaker !== speakerFilter) {
        return false;
      }
      return true;
    });
  }, [allSermons, search, speakerFilter]);

  return (
    <div className="max-w-[var(--container-max)] mx-auto py-8 px-[var(--container-pad)]">
      <div className="mb-8">
        <h1 className="font-h1 text-ink m-0 mb-3">All Sermons</h1>
        <p className="font-body text-ink-muted m-0 max-w-[600px]">
          Browse our entire library of teachings. Use the filters below to find exactly what you&apos;re looking for.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <div className="flex-[1_1_300px]">
          <Input 
            value={search} 
            onChange={setSearch} 
            placeholder="Search by title, speaker, or topic..." 
          />
        </div>
        <div className="w-[200px]">
          <Select 
            value={speakerFilter} 
            onChange={setSpeakerFilter} 
            options={[
              { value: 'all', label: 'All speakers' },
              ...speakers.map(sp => ({ value: sp, label: sp }))
            ]}
          />
        </div>
      </div>

      {loading ? (
        <p className="font-body text-ink-muted">Loading sermons...</p>
      ) : filtered.length === 0 ? (
        <div className="py-12 px-0 text-center bg-surface rounded-md border border-border">
          <h3 className="font-h3 text-ink m-0 mb-2">No sermons found</h3>
          <p className="font-body text-ink-muted m-0">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
          {filtered.map((sermon) => (
            <SermonCard
              key={sermon.id}
              onClick={() => router.push(`/sermons/${sermon.id}`)}
              title={sermon.title}
              speaker={sermon.speaker || 'Unknown'}
              date={sermon.sermon_date || 'Unknown date'}
              thumbnail={sermon.thumbnail_url ?? ''}
              tags={sermon.tags}
            />
          ))}
        </div>
      )}
    </div>
  );
}
