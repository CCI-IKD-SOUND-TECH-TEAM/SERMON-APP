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
  const [hover, setHover] = React.useState(false);
  
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
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        boxShadow: hover ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'box-shadow var(--motion-base), transform var(--motion-base)',
        cursor: 'pointer',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
      }}
    >
      <div
        style={{
          width: '100%',
          aspectRatio: '3/4',
          position: 'relative',
          backgroundColor: 'var(--color-surface-hover)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
        }}
      >
        {thumbnail && !thumbnail.startsWith('#') && (
          <Image
            src={thumbnail}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            priority={priority}
          />
        )}
      </div>
      <div style={{ padding: 'var(--space-4)' }}>
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            {tags.map((t) => (
              <span
                key={t}
                style={{
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary-dark)',
                  font: '600 12px/1 var(--font-body)',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-pill)',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <div
          style={{
            font: 'var(--text-h3)',
            color: hover ? 'var(--color-primary)' : 'var(--color-ink)',
            transition: 'color var(--motion-base)',
            marginBottom: 4,
          }}
        >
          {title}
        </div>
        <div style={{ font: 'var(--text-body-sm)', color: 'var(--color-ink-muted)' }}>
          {speaker} · {date}
          {duration ? ` · ${duration}` : ''}
        </div>
      </div>
    </Wrapper>
  );
}
