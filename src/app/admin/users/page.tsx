'use client';

import React from 'react';
import { api } from '@/lib/api';
import type { Profile } from '@/lib/types';
import { Button } from '@/components/core/Button';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { Trash2, Plus, Mail } from 'lucide-react';
import { AdminTable } from '@/components/admin/AdminTable';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [inviting, setInviting] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState('media_editor');
  const [inviteLoading, setInviteLoading] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const loadUsers = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.users();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load users. Are you an admin?');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteLoading(true);
    try {
      await api.inviteUser(inviteEmail, inviteRole);
      setInviting(false);
      setInviteEmail('');
      setInviteRole('media_editor');
      await loadUsers();
      toast.success('User invited successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to invite user');
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleRoleChange(id: string, newRole: string) {
    try {
      await api.updateUserRole(id, newRole);
      setUsers(users.map(u => u.id === id ? { ...u, role: newRole as any } : u));
      toast.success('Role updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update role');
    }
  }

  async function handleDelete() {
    if (!userToDelete) return;
    setDeleteLoading(true);
    try {
      await api.deleteUser(userToDelete);
      setUsers(users.filter(u => u.id !== userToDelete));
      toast.success('User deleted');
      setUserToDelete(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  }

  if (error) {
    return (
      <div style={{ maxWidth: 800 }}>
        <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: 16, borderRadius: 'var(--radius-md)' }}>
          <h2 style={{ margin: '0 0 8px', font: 'var(--text-h3)' }}>Access Denied</h2>
          <p style={{ margin: 0, font: 'var(--text-body)' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000 }}>
      <div className="responsive-header" style={{ marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 style={{ font: 'var(--text-h1)', color: 'var(--color-ink)', margin: '0 0 8px' }}>Users Manager</h1>
          <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)', margin: 0 }}>
            Invite staff members and manage their access levels.
          </p>
        </div>
        {!inviting && (
          <Button variant="primary" onClick={() => setInviting(true)}>
            <Plus width={16} height={16} style={{ marginRight: 6 }} />
            Invite User
          </Button>
        )}
      </div>

      {inviting && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
          <h2 style={{ font: 'var(--text-h3)', color: 'var(--color-ink)', margin: '0 0 var(--space-4)' }}>
            Invite New User
          </h2>
          <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FormField label="Email Address" htmlFor="inviteEmail">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={setInviteEmail}
                    required
                    placeholder="colleague@church.org"
                    style={{ paddingLeft: 36 }}
                  />
                </div>
              </div>
            </FormField>

            <FormField label="Assign Role" htmlFor="inviteRole">
              <select
                id="inviteRole"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg)',
                  color: 'var(--color-ink)',
                  font: 'var(--text-body)',
                }}
              >
                <option value="member">Member (Read-only access)</option>
                <option value="media_editor">Media Editor (Can upload/edit sermons and photos)</option>
                <option value="admin">Super Admin (Full access, including user management)</option>
              </select>
            </FormField>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Button type="button" variant="secondary" onClick={() => setInviting(false)}>Cancel</Button>
              <Button type="submit" variant="primary" loading={inviteLoading}>Send Invitation</Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)' }}>Loading users...</p>
      ) : users.length === 0 ? (
        <p style={{ font: 'var(--text-body)', color: 'var(--color-ink-muted)' }}>No users found.</p>
      ) : (
        <AdminTable<Profile>
          columns={[
            {
              key: 'user',
              label: 'User',
              render: (u) => (
                <div>
                  <div style={{ fontWeight: 600 }}>{u.full_name || 'No name set'}</div>
                  <div style={{ color: 'var(--color-ink-muted)', fontSize: 13, marginTop: 4 }}>{u.email || 'Unknown email'}</div>
                </div>
              ),
            },
            {
              key: 'role',
              label: 'Role',
              render: (u) => (
                <div style={{ minWidth: 150 }}>
                  <Select
                    value={u.role}
                    onChange={(val) => handleRoleChange(u.id, val)}
                    options={[
                      { value: 'member', label: 'Member' },
                      { value: 'media_editor', label: 'Media Editor' },
                      { value: 'admin', label: 'Super Admin' },
                    ]}
                  />
                </div>
              ),
            },
            {
              key: 'joined',
              label: 'Joined',
              render: (u) => new Date(u.created_at).toLocaleDateString(),
            },
          ]}
          rows={users}
          renderActions={(u) => (
            <button onClick={() => setUserToDelete(u.id)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: 4 }} title="Delete user">
              <Trash2 width={16} height={16} />
            </button>
          )}
        />
      )}

      <ConfirmModal
        isOpen={!!userToDelete}
        title="Delete User"
        message="Are you sure you want to completely delete this user? This action cannot be undone."
        confirmText="Delete User"
        onConfirm={handleDelete}
        onCancel={() => setUserToDelete(null)}
        isLoading={deleteLoading}
      />
    </div>
  );
}
