# Overflow

Overflow is a robust **sermon library + photo gallery** application for your church. It features a public-facing media site and a comprehensive **Admin Panel** that implements a powerful, separation-of-concerns ingestion pipeline for your media team.

## Architecture & Stack

- **Framework:** Next.js (App Router), React, TypeScript
- **Styling:** Design tokens mapped as CSS custom properties (`src/styles/tokens/`). Components are styled using these tokens to maintain strict design system fidelity.
- **Database & Auth:** **Supabase** (PostgreSQL) is used for the primary database, Row Level Security (RLS) policies, and user authentication.
- **Storage:**
  - **Google Drive API:** Used as the primary ingestion source for large media files (Sermons, PDFs, Photo Albums).
  - **Supabase Storage:** A dedicated `covers` bucket is used to host lightweight, optimized cover images.
- **Icons:** `lucide-react`

## The Media Ingestion Pipeline

Overflow implements an **Incoming & Ready** workflow designed specifically to separate the responsibilities of the media team (uploading) and the admin team (publishing).

1. **Media Team (Upload):** Volunteers upload raw files (Sermons, Photos) into an `Incoming` folder on Google Drive. 
2. **Media Team (Handoff):** Once an upload is complete, the folder is moved to the `Ready` folder.
3. **Backend Scanner:** The Admin Dashboard features a "Sync Google Drive" button. Clicking this triggers an API route that scans the `Ready` folder and imports any new items into the `media_imports` database table as `PENDING`.
4. **Admin Enrichment:** Admins review the pending inbox, classify the file (Sermon vs. Photo Album), provide metadata (Title, Preacher, Date), upload a cover image to Supabase, and **Publish** the content to the public site.
5. **Streaming:** The public site securely proxies media streams directly from Google Drive.

## Local Development

### Prerequisites
1. Node.js and npm installed.
2. A Supabase project set up.
3. A Google Cloud Service Account with Google Drive API enabled.

### Environment Setup
Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Drive Ingestion
GOOGLE_CLIENT_EMAIL="your-service-account-email@your-project-id.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nKey\nHere\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_READY_FOLDER_ID="your_google_drive_folder_id"
```

### Running the App

```bash
# 1. Install dependencies
npm install

# 2. Push database migrations and set up Supabase Storage buckets
npx supabase db push

# 3. Start the development server
npm run dev
```

Navigate to `http://localhost:3000` to view the public site, or `http://localhost:3000/admin` to access the dashboard.

## Directory Structure

- `src/app/(public)/` — The public-facing site: Home, Sermons, Series, and Photo Albums.
- `src/app/admin/` — The Admin panel: Dashboard, Pending Inbox (`/imports`), and metadata enrichment tools.
- `src/app/api/` — Next.js API route handlers (Drive Sync, Imports, and Media Streaming).
- `src/components/` — The core design-system components (`core`, `data-display`, `forms`, `admin`, `media`, `navigation`).
- `supabase/migrations/` — PostgreSQL schema definitions, tables (`church_media`, `sermons`, `photo_albums`, `media_imports`), and Row Level Security (RLS) policies.
