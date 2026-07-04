'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/core/Button';
import { Eye, EyeOff } from 'lucide-react';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    
    setLoading(false);
    
    if (updateError) {
      setError(updateError.message);
    } else {
      router.push('/admin');
      router.refresh();
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', paddingTop: 'var(--space-12)' }}>
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-8)' }}>
        <h1 style={{ font: 'var(--text-h2)', color: 'var(--color-ink)', margin: '0 0 var(--space-2)' }}>
          Welcome to Overflow
        </h1>
        <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)', margin: '0 0 var(--space-6)' }}>
          You've been invited! Please set a secure password to complete your account setup.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', font: 'var(--text-body-sm)' }}>
              {error}
            </div>
          )}
          
          <FormField label="New Password" htmlFor="password">
            <div style={{ position: 'relative' }}>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={setPassword}
                required
                minLength={6}
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-ink-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff width={16} height={16} /> : <Eye width={16} height={16} />}
              </button>
            </div>
          </FormField>
          
          <FormField label="Confirm Password" htmlFor="confirmPassword">
            <div style={{ position: 'relative' }}>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={setConfirmPassword}
                required
                minLength={6}
                style={{ paddingRight: 40 }}
              />
            </div>
          </FormField>

          <Button type="submit" variant="primary" loading={loading} style={{ marginTop: 8 }}>
            Save password
          </Button>
        </form>
      </div>
    </div>
  );
}
