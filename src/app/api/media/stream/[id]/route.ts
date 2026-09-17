import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient } from '@/lib/supabase/server';

// The Drive client's declared response header type disagrees with what the
// underlying gaxios version actually returns (a Headers instance vs. a plain
// record), so this reads either shape defensively instead of trusting one.
function getHeader(headers: unknown, name: string): string | undefined {
  if (!headers) return undefined;
  const asHeaders = headers as Headers;
  if (typeof asHeaders.get === 'function') {
    return asHeaders.get(name) ?? undefined;
  }
  const record = headers as Record<string, string | string[] | undefined>;
  const value = record[name] ?? record[name.toLowerCase()] ?? record[name.toUpperCase()];
  return Array.isArray(value) ? value[0] : value;
}

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

    // Forward the browser's Range header (used for seeking/scrubbing) to Drive
    // so it returns a real 206 Partial Content response instead of replaying
    // the whole file from byte 0 on every seek.
    const range = req.headers.get('range');

    // Stream the file from Google Drive directly to the client
    const response = await drive.files.get(
      { fileId: googleFileId, alt: 'media' },
      {
        responseType: 'stream',
        headers: range ? { Range: range } : undefined,
      }
    );

    const headers = new Headers();
    const contentType = getHeader(response.headers, 'content-type');
    const contentLength = getHeader(response.headers, 'content-length');
    const contentRange = getHeader(response.headers, 'content-range');
    if (contentType) headers.set('Content-Type', contentType);
    if (contentLength) headers.set('Content-Length', contentLength);
    if (contentRange) headers.set('Content-Range', contentRange);
    headers.set('Accept-Ranges', 'bytes');

    return new NextResponse(response.data as any, {
      status: range ? response.status : 200,
      headers,
    });

  } catch (error: any) {
    console.error('Stream Error:', error);
    return new NextResponse('Error streaming file', { status: 500 });
  }
}
