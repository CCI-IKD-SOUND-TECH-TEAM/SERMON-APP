'use client';

import React from 'react';
import Image from 'next/image';

export interface AlbumCardProps {
  title: string;
  date: string;
  photoCount: number;
  cover?: string;
  onClick?: () => void;
  priority?: boolean;
}

/**
 * AlbumCard — photo album card for the public gallery. 4:3 cover, title,
 * date · photo count meta line. Same interaction pattern as SermonCard.
 */
export function AlbumCard({ title, date, photoCount, cover, onClick, priority = false }: AlbumCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className="group bg-surface rounded-md shadow-card hover:shadow-card-hover hover:-translate-y-[2px] transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div className="w-full aspect-[3/4] relative bg-black/5">
        {cover && !cover.startsWith('#') && (
          <Image
            src={cover}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority={priority}
          />
        )}
      </div>
      <div className="p-4">
        <div className="font-h3 text-ink group-hover:text-primary transition-colors duration-300 mb-1">
          {title}
        </div>
        <div className="font-body-sm text-ink-muted">
          {date} · {photoCount} photos
        </div>
      </div>
    </div>
  );
}
