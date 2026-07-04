'use client';

import React from 'react';
import Image from 'next/image';

export interface SermonCardProps {
  title: string;
  speaker: string;
  date: string;
  duration?: string;
  thumbnail?: string;
  tags?: string[];
  onClick?: () => void;
  href?: string;
  priority?: boolean;
}

/**
 * SermonCard — the primary content card for the public sermon library.
 * Whole card is one clickable target; thumbnail 16:9, title (H3), meta line,
 * optional tag chips. Hover lifts shadow + tints title amber.
 */
export function SermonCard({
  title,
  speaker,
  date,
  duration,
  thumbnail,
  tags = [],
  onClick,
  href,
  priority = false,
}: SermonCardProps) {
  const Wrapper = href ? require('next/link').default : 'div';
  const wrapperProps = href 
    ? { href } 
    : { role: 'button', tabIndex: 0, onClick };

  return (
    <Wrapper
      {...wrapperProps}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className="group flex flex-col bg-surface rounded-md shadow-card hover:shadow-card-hover hover:-translate-y-[2px] transition-all duration-300 cursor-pointer overflow-hidden no-underline"
    >
      <div className="w-full aspect-[3/4] relative bg-black/5 rounded-sm overflow-hidden">
        {thumbnail && !thumbnail.startsWith('#') && (
          <Image
            src={thumbnail}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority={priority}
          />
        )}
      </div>
      <div className="p-4">
        {tags.length > 0 && (
          <div className="flex gap-[6px] flex-wrap mb-2">
            {tags.map((t) => (
              <span
                key={t}
                className="bg-primary-light text-primary-dark font-semibold text-[12px] leading-none font-body py-1 px-2 rounded-pill"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="font-h3 text-ink group-hover:text-primary transition-colors duration-300 mb-1">
          {title}
        </div>
        <div className="font-body-sm text-ink-muted">
          {speaker} · {date}
          {duration ? ` · ${duration}` : ''}
        </div>
      </div>
    </Wrapper>
  );
}
