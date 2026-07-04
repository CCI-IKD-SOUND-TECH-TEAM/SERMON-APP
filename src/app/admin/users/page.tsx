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
      <div className="max-w-[800px]">
        <div className="bg-danger-bg text-danger p-4 rounded-md">
          <h2 className="m-0 mb-2 font-h3">Access Denied</h2>
          <p className="m-0 font-body">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px]">
      <div className="responsive-header mb-8">
        <div>
          <h1 className="font-h1 text-ink m-0 mb-2">Users Manager</h1>
          <p className="font-body text-ink-muted m-0">
            Invite staff members and manage their access levels.
          </p>
        </div>
        {!inviting && (
          <Button variant="primary" onClick={() => setInviting(true)}>
            <Plus width={16} height={16} className="mr-1.5" />
            Invite User
          </Button>
        )}
      </div>

      {inviting && (
        <div className="bg-surface border border-border rounded-md p-6 mb-8">
          <h2 className="font-h3 text-ink m-0 mb-4">
            Invite New User
          </h2>
          <form onSubmit={handleInvite} className="flex flex-col gap-4">
            <FormField label="Email Address" htmlFor="inviteEmail">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex-1 min-w-[200px] relative">
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={setInviteEmail}
                    required
                    placeholder="colleague@church.org"
                className="pl-9"
              />
            </div>
          </div>
        </FormField>

        <FormField label="Assign Role" htmlFor="inviteRole">
          <select
            id="inviteRole"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="w-full py-2 px-3 rounded-sm border border-border bg-bg text-ink font-body"
          >
            <option value="member">Member (Read-only access)</option>
                <option value="media_editor">Media Editor (Can upload/edit sermons and photos)</option>
                <option value="admin">Super Admin (Full access, including user management)</option>
              </select>
            </select>
          </FormField>

          <div className="flex gap-2 mt-2">
            <Button type="button" variant="secondary" onClick={() => setInviting(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={inviteLoading}>Send Invitation</Button>
          </div>
        </form>
      </div>
      )}

      {loading ? (
        <p className="font-body text-ink-muted">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="font-body text-ink-muted">No users found.</p>
      ) : (
        <AdminTable<Profile>
          columns={[
            {
              key: 'user',
              label: 'User',
              render: (u) => (
                <div>
                  <div className="font-semibold">{u.full_name || 'No name set'}</div>
                  <div className="text-ink-muted text-[13px] mt-1">{u.email || 'Unknown email'}</div>
                </div>
              ),
            },
            {
              key: 'role',
              label: 'Role',
              render: (u) => (
                <div className="min-w-[150px]">
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
            <button onClick={() => setUserToDelete(u.id)} className="bg-transparent border-none text-danger cursor-pointer p-1 hover:text-[#932F16] transition-colors" title="Delete user">
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
