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
    <React.Suspense fallback={<p style={{ padding: 'var(--space-8)' }}>Loading sermons...</p>}>
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
    <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'var(--space-8) var(--container-pad)' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ font: 'var(--text-h1)', color: 'var(--color-ink)', margin: '0 0 12px' }}>All Sermons</h1>
        <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)', margin: 0, maxWidth: 600 }}>
          Browse our entire library of teachings. Use the filters below to find exactly what you&apos;re looking for.
        </p>
      </div>

      {/* Filters Bar */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 'var(--space-8)', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px' }}>
          <Input 
            value={search} 
            onChange={setSearch} 
            placeholder="Search by title, speaker, or topic..." 
          />
        </div>
        <div style={{ width: 200 }}>
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
        <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)' }}>Loading sermons...</p>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 'var(--space-12) 0', textAlign: 'center', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <h3 style={{ font: 'var(--text-h3)', color: 'var(--color-ink)', margin: '0 0 8px' }}>No sermons found</h3>
          <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)', margin: 0 }}>Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--space-6)',
          }}
        >
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
