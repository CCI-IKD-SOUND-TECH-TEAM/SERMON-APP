import { createClient } from '@/lib/supabase/server';

export type UserRole = 'admin' | 'media_editor' | 'member';

export interface UserProfile {
  id: string;
  full_name: string | null;
  role: UserRole;
}

/**
 * Get the currently authenticated user's profile (id, full_name, role).
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  return profile as UserProfile;
}

/**
 * Require a specific role. Returns the profile if authorized,
 * or throws an error (use in Server Actions / Route Handlers).
 */
export async function requireRole(...roles: UserRole[]): Promise<UserProfile> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  if (!roles.includes(user.role)) {
    throw new Error(`Forbidden: requires role ${roles.join(' or ')}, got ${user.role}`);
  }
  return user;
}

/** Check if the current user is an admin. */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'admin';
}

/** Check if the current user is at least a media_editor. */
export async function isStaff(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'admin' || user?.role === 'media_editor';
}
