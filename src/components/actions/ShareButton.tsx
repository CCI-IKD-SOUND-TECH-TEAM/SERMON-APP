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
        className="inline-flex items-center gap-2 bg-surface border border-border text-ink py-2 px-4 rounded-sm font-semibold text-[14px] leading-none font-body"
      >
        <Share2 width={16} height={16} />
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 bg-surface border border-border text-ink py-2 px-4 rounded-sm font-semibold text-[14px] leading-none font-body cursor-pointer hover:bg-black/5 transition-colors"
    >
      <Share2 width={16} height={16} />
      {label}
    </button>
  );
}
