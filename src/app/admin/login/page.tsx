'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/admin';
  const urlError = searchParams.get('error');

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [mode, setMode] = React.useState<'password' | 'magic_link'>('password');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(urlError);
  const [magicLinkSent, setMagicLinkSent] = React.useState(false);

  // Clear url error on mount or mode change
  React.useEffect(() => {
    if (urlError && mode !== 'password') {
      setError(null);
    }
  }, [mode, urlError]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const redirectUrl = `${window.location.origin}/auth/confirm?next=${encodeURIComponent(redirectTo)}`;

    try {
      if (mode === 'magic_link') {
        const { error: authError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });
        if (authError) throw authError;
        setMagicLinkSent(true);
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  if (magicLinkSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-4">
        <div className="w-full max-w-sm rounded-lg bg-surface p-8 shadow-card text-center">
          <h1 className="font-display text-2xl font-semibold text-ink mb-3">Check your email</h1>
          <p className="font-body text-sm text-ink-muted leading-relaxed">
            We sent a secure link to <strong className="text-ink">{email}</strong>. Click the link in the email to continue.
          </p>
          <button
            onClick={() => setMagicLinkSent(false)}
            className="mt-6 text-sm font-semibold text-primary hover:text-primary-dark cursor-pointer bg-transparent border-none"
          >
            ← Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-lg bg-surface p-8 shadow-card">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold text-ink mb-1">Overflow</h1>
          <p className="font-body text-sm text-ink-muted">Sign in to the admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-sm bg-danger-bg px-4 py-3 text-sm text-danger font-body">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-ink-muted uppercase tracking-wide font-body">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="rounded-sm border border-border bg-surface px-3 py-2.5 text-sm text-ink font-body outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              placeholder="you@church.org"
            />
          </div>

          {mode === 'password' && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-ink-muted uppercase tracking-wide font-body">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-sm border border-border bg-surface px-3 py-2.5 pr-10 text-sm text-ink font-body outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink cursor-pointer bg-transparent border-none p-0 flex items-center justify-center"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff width={16} height={16} /> : <Eye width={16} height={16} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-sm bg-primary px-5 py-3 text-sm font-semibold text-white font-body hover:bg-primary-dark disabled:opacity-40 transition-colors cursor-pointer"
          >
            {loading
              ? 'Please wait…'
              : mode === 'magic_link'
                ? 'Send magic link'
                : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'password' ? 'magic_link' : 'password');
              setError(null);
            }}
            className="text-sm font-semibold text-ink-muted hover:text-ink cursor-pointer bg-transparent border-none font-body"
          >
            {mode === 'password' ? 'Use magic link instead' : 'Use password instead'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg">
          <p className="font-body text-sm text-ink-muted">Loading…</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
