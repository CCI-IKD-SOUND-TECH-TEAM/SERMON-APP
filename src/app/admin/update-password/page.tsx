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
    <div className="max-w-[400px] mx-auto pt-12">
      <div className="bg-surface border border-border rounded-md p-8">
        <h1 className="font-h2 text-ink m-0 mb-2">
          Welcome to Overflow
        </h1>
        <p className="font-body text-ink-muted m-0 mb-6">
          You've been invited! Please set a secure password to complete your account setup.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-danger-bg text-danger py-3 px-4 rounded-sm font-body-sm">
              {error}
            </div>
          )}
          
          <FormField label="New Password" htmlFor="password">
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={setPassword}
                required
                minLength={6}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-ink-muted cursor-pointer p-0 flex items-center"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff width={16} height={16} /> : <Eye width={16} height={16} />}
              </button>
            </div>
          </FormField>
          
          <FormField label="Confirm Password" htmlFor="confirmPassword">
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={setConfirmPassword}
                required
                minLength={6}
                className="pr-10"
              />
            </div>
          </FormField>

          <Button type="submit" variant="primary" loading={loading} className="mt-2">
            Save password
          </Button>
        </form>
      </div>
    </div>
  );
}
