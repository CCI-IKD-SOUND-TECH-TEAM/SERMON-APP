'use client';

import React from 'react';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

export function ShareButton({
  title,
  text,
  url,
  label = 'Share',
}: {
  title: string;
  text: string;
  url?: string;
  label?: string;
}) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleShare = async () => {
    const targetUrl = url || window.location.href;
    const shareData = {
      title,
      text,
      url: targetUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(targetUrl);
        toast.success('Link copied to clipboard!');
      } catch (err) {
        toast.error('Failed to copy link.');
      }
    }
  };

  if (!mounted) {
    // Return a visually identical button for SSR, but inactive until hydration
    return (
      <button
        disabled
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-ink)',
          padding: '8px 16px',
          borderRadius: 'var(--radius-sm)',
          font: '600 14px/1 var(--font-body)',
        }}
      >
        <Share2 width={16} height={16} />
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-ink)',
        padding: '8px 16px',
        borderRadius: 'var(--radius-sm)',
        font: '600 14px/1 var(--font-body)',
        cursor: 'pointer',
      }}
    >
      <Share2 width={16} height={16} />
      {label}
    </button>
  );
}
