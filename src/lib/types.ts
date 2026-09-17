// Shared domain types for the Overflow app.
// Matches the Supabase schema from FRD §5.

export type ContentStatus = 'pending_review' | 'published' | 'unpublished' | 'archived';

export interface Series {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  created_at: string;
}

export interface Sermon {
  id: string;
  title: string;
  description: string | null;
  speaker: string | null;
  series_id: string | null;
  sermon_date: string | null;
  tags: string[];
  status: ContentStatus;
  is_featured: boolean;
  thumbnail_url: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  drive_file_id?: string | null;
  /** Joined from series table — optional */
  series?: Series | null;
  /** Joined from sermon_files table — optional */
  files?: SermonFile[];
}

export interface SermonFile {
  id: string;
  sermon_id: string;
  file_type: 'audio' | 'video' | 'notes' | 'slides' | 'other';
  storage_path: string | null;
  file_url: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  download_count: number;
}

export interface PhotoAlbum {
  id: string;
  title: string;
  event_date: string | null;
  description: string | null;
  cover_photo_url: string | null;
  status: ContentStatus;
  created_at: string;
  /** Joined from photos table — optional */
  photos?: Photo[];
  /** Computed count — optional */
  photo_count?: number;
}

export interface Photo {
  id: string;
  album_id: string;
  storage_path: string | null;
  file_url: string | null;
  thumbnail_url: string | null;
  width: number | null;
  height: number | null;
  sort_order: number;
  download_count: number;
}

export interface Profile {
  id: string;
  full_name: string | null;
  role: 'admin' | 'media_editor' | 'member';
  created_at: string;
  email?: string;
  /** Set (to a future date) when the account has been deactivated. */
  banned_until?: string | null;
}



/** A row in the admin content tables — unifies sermons and albums. */
export interface ContentRow {
  id: string;
  kind: 'sermon' | 'album';
  title: string;
  type: 'Sermon' | 'Album';
  date: string | null;
  status: ContentStatus;
  series_id?: string | null;
}
