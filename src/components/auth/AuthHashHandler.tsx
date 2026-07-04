'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function AuthHashHandler() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash;
      if (hash.includes('type=invite') || hash.includes('type=recovery')) {
        setIsProcessing(true);
        const supabase = createClient();

        // Listen for the session to be established by the hash before redirecting.
        // This ensures the browser cookies are set so proxy.ts sees the authenticated user.
        // We use window.location.href for a hard redirect to guarantee cookies are sent.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
          if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
            window.location.href = '/admin/update-password';
          }
        });

        // Fallback in case we already have the session or the event fired early
        supabase.auth.getSession().then(({ data }) => {
          if (data.session) {
             window.location.href = '/admin/update-password';
          }
        });

        return () => subscription.unsubscribe();
      }
    }
  }, [router]);

  if (isProcessing) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)' }}>Preparing your account...</p>
      </div>
    );
  }

  return null;
}
