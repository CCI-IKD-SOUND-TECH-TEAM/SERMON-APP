'use client';

import React from 'react';
import { api } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/core/Button';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Super Admin',
  media_editor: 'Media Editor',
  member: 'Member',
};

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          font: '600 12px/1 var(--font-body)',
          color: 'var(--color-ink-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ font: 'var(--text-body)', color: 'var(--color-ink)' }}>{value}</div>
    </div>
  );
}

export default function ProfilePage() {
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState<string | null>(null);
  const [role, setRole] = React.useState<string | null>(null);
  const [createdAt, setCreatedAt] = React.useState<string | null>(null);

  const [fullName, setFullName] = React.useState('');
  const [savingName, setSavingName] = React.useState(false);

  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [savingPassword, setSavingPassword] = React.useState(false);

  React.useEffect(() => {
    api
      .myProfile()
      .then((p) => {
        setEmail(p.email ?? null);
        setRole(p.role);
        setCreatedAt(p.created_at);
        setFullName(p.full_name ?? '');
      })
      .catch((err) => setLoadError(err.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setSavingName(true);
    try {
      await api.updateMyProfile(fullName);
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSavingName(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError('Enter your current password');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (!email) {
      setPasswordError('Could not verify your account email');
      return;
    }

    setSavingPassword(true);
    try {
      const supabase = createClient();

      // Supabase has no dedicated "verify password" call, so re-authenticate
      // with the current password first — only proceed to updateUser if that
      // succeeds, so a left-open session can't have its password swapped by
      // whoever is at the keyboard without actually knowing the password.
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (verifyError) {
        setPasswordError('Current password is incorrect');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)' }}>Loading profile...</p>;
  }

  if (loadError) {
    return (
      <div style={{ maxWidth: 700 }}>
        <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: 16, borderRadius: 'var(--radius-md)' }}>
          <h2 style={{ margin: '0 0 8px', font: 'var(--text-h3)' }}>Couldn&apos;t load profile</h2>
          <p style={{ margin: 0, font: 'var(--text-body)' }}>{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ font: 'var(--text-h1)', color: 'var(--color-ink)', margin: '0 0 8px' }}>My Profile</h1>
        <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)', margin: 0 }}>
          Manage your account details and security.
        </p>
      </div>

      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-8)',
        }}
      >
        <h2 style={{ font: 'var(--text-h3)', color: 'var(--color-ink)', margin: '0 0 var(--space-4)' }}>Account details</h2>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
          <DetailField label="Email" value={email ?? 'Unknown'} />
          <DetailField label="Role" value={role ? ROLE_LABELS[role] ?? role : 'Unknown'} />
          <DetailField label="Member since" value={createdAt ? new Date(createdAt).toLocaleDateString() : 'Unknown'} />
        </div>

        <form onSubmit={handleSaveName} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}>
          <FormField label="Full name" htmlFor="fullName">
            <Input id="fullName" value={fullName} onChange={setFullName} placeholder="Your name" />
          </FormField>
          <div>
            <Button type="submit" variant="primary" loading={savingName}>
              Save name
            </Button>
          </div>
        </form>
      </div>

      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-6)',
        }}
      >
        <h2 style={{ font: 'var(--text-h3)', color: 'var(--color-ink)', margin: '0 0 4px' }}>Change password</h2>
        <p style={{ font: 'var(--text-body-sm)', color: 'var(--color-ink-muted)', margin: '0 0 var(--space-4)' }}>
          Choose a new password for your account.
        </p>

        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}>
          {passwordError && (
            <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', font: 'var(--text-body-sm)' }}>
              {passwordError}
            </div>
          )}

          <FormField label="Current password" htmlFor="currentPassword">
            <div style={{ position: 'relative' }}>
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={setCurrentPassword}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-ink-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}
                tabIndex={-1}
              >
                {showCurrentPassword ? <EyeOff width={16} height={16} /> : <Eye width={16} height={16} />}
              </button>
            </div>
          </FormField>

          <FormField label="New password" htmlFor="newPassword">
            <div style={{ position: 'relative' }}>
              <Input id="newPassword" type={showPassword ? 'text' : 'password'} value={newPassword} onChange={setNewPassword} />
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

          <FormField label="Confirm new password" htmlFor="confirmPassword">
            <Input id="confirmPassword" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={setConfirmPassword} />
          </FormField>

          <div>
            <Button type="submit" variant="primary" loading={savingPassword}>
              Update password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
