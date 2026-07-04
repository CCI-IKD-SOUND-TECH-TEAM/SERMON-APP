import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const googleFileId = resolvedParams.id;
    
    // Optional: Add Supabase auth checking here if you only want authenticated 
    // members to be able to stream the content.
    // const supabase = createClient();
    // const { data: { user } } = await supabase.auth.getUser();

    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!clientEmail || !privateKey) {
      return new NextResponse('Server configuration error', { status: 500 });
    }

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Stream the file from Google Drive directly to the client
    const response = await drive.files.get(
      { fileId: googleFileId, alt: 'media' },
      { responseType: 'stream' }
    );

    // Forward headers from Google Drive (like Content-Type, Content-Length)
    const headers = new Headers();
    if (response.headers['content-type']) headers.set('Content-Type', response.headers['content-type']);
    if (response.headers['content-length']) headers.set('Content-Length', response.headers['content-length']);
    
    // Enable range requests (useful for video/audio streaming in mobile apps)
    headers.set('Accept-Ranges', 'bytes');

    return new NextResponse(response.data as any, {
      status: 200,
      headers,
    });

  } catch (error: any) {
    console.error('Stream Error:', error);
    return new NextResponse('Error streaming file', { status: 500 });
  }
}
