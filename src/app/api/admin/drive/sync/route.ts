import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // Quick auth check (assuming you have a way to verify admin/staff here)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Google Drive Auth Setup
    // Requires GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in .env.local
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const folderId = process.env.GOOGLE_DRIVE_READY_FOLDER_ID; // The ID of the "Ready" folder

    if (!clientEmail || !privateKey || !folderId) {
      return NextResponse.json({ error: 'Google Drive credentials not fully configured.' }, { status: 500 });
    }

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Helper to recursively fetch files
    async function getAllFilesInFolder(currentFolderId: string): Promise<any[]> {
      let allFiles: any[] = [];
      const res = await drive.files.list({
        q: `'${currentFolderId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType, size, md5Checksum, createdTime, parents)',
        pageSize: 1000,
      });
      
      const items = res.data.files || [];
      for (const item of items) {
        if (item.mimeType === 'application/vnd.google-apps.folder') {
          // Recursively fetch children
          const children = await getAllFilesInFolder(item.id!);
          allFiles = allFiles.concat(children);
        } else {
          allFiles.push(item);
        }
      }
      return allFiles;
    }

    const files = await getAllFilesInFolder(folderId);

    let importedCount = 0;

    // 2. Insert into media_imports
    for (const file of files) {

      const { id, name, mimeType, size, md5Checksum, createdTime, parents } = file;

      const { error } = await supabase
        .from('media_imports')
        .upsert({
          google_file_id: id,
          parent_folder_id: parents?.[0] || null,
          file_name: name,
          mime_type: mimeType,
          size: size ? parseInt(size, 10) : null,
          md5_checksum: md5Checksum,
          drive_created_at: createdTime,
          status: 'PENDING',
        }, {
          onConflict: 'google_file_id',
          ignoreDuplicates: true // Only insert if it's new
        });

      if (!error) {
        importedCount++;
      } else {
        console.error('Error importing file:', name, error);
      }
    }

    return NextResponse.json({ message: 'Sync complete', filesFound: files.length, newImports: importedCount });

  } catch (error: any) {
    console.error('Drive Sync Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
