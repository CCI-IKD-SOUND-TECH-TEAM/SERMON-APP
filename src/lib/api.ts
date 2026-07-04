import type { PhotoAlbum, ContentRow, Sermon } from './types';

async function json<T>(res: Response): Promise<T> {
  if (res.status === 401 && typeof window !== 'undefined') {
    window.location.href = '/admin/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    let msg = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      if (data.error) msg = data.error;
    } catch (e) {}
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

export const api = {
  sermons: () => fetch('/api/sermons').then((r) => json<{ sermons: Sermon[]; total: number }>(r).then(d => d.sermons)),
  sermon: (id: string) => fetch(`/api/sermons/${id}`).then((r) => json<Sermon>(r)),
  createSermon: (sermon: Partial<Sermon>) =>
    fetch('/api/admin/sermons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sermon),
    }).then((r) => json<Sermon>(r)),
  updateSermon: (id: string, patch: Partial<Sermon>) =>
    fetch(`/api/admin/sermons/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    }).then((r) => json<Sermon>(r)),

  albums: () => fetch('/api/albums').then((r) => json<PhotoAlbum[]>(r)),
  album: (id: string) => fetch(`/api/albums/${id}`).then((r) => json<PhotoAlbum>(r)),
  createAlbum: (album: Partial<PhotoAlbum>) =>
    fetch('/api/admin/albums', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(album),
    }).then((r) => json<PhotoAlbum>(r)),
  updateAlbum: (id: string, updates: Partial<PhotoAlbum>) =>
    fetch(`/api/admin/albums/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).then(r => json<{ ok: true }>(r)),

  allSeries: () => fetch('/api/admin/series').then((r) => json<import('./types').Series[]>(r)),
  publicSeries: () => fetch('/api/series').then((r) => json<import('./types').Series[]>(r)),
  series: (id: string) => fetch(`/api/series/${id}`).then((r) => json<import('./types').Series & { sermons: import('./types').Sermon[] }>(r)),
  createSeries: (series: Partial<import('./types').Series>) =>
    fetch('/api/admin/series', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(series),
    }).then(r => json<import('./types').Series>(r)),
  updateSeries: (id: string, updates: Partial<import('./types').Series>) =>
    fetch(`/api/admin/series/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).then(r => json<import('./types').Series>(r)),
  deleteSeries: (id: string) =>
    fetch(`/api/admin/series/${id}`, { method: 'DELETE' }).then(r => json<{ ok: true }>(r)),

  users: () => fetch('/api/admin/users').then((r) => json<import('./types').Profile[]>(r)),
  inviteUser: (email: string, role: string) =>
    fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    }).then(r => json<{ ok: true }>(r)),
  updateUserRole: (id: string, role: string) =>
    fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    }).then(r => json<import('./types').Profile>(r)),
  deleteUser: (id: string) =>
    fetch(`/api/admin/users/${id}`, { method: 'DELETE' }).then(r => json<{ ok: true }>(r)),

  content: () => fetch('/api/admin/content').then((r) => json<ContentRow[]>(r)),
  stats: () => fetch('/api/admin/stats').then((r) => json<{ sermons: number, albums: number }>(r)),
  setStatus: (kind: ContentRow['kind'], id: string, status: ContentRow['status']) =>
    fetch('/api/admin/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, id, status }),
    }).then((r) => json<{ ok: true }>(r)),
};
