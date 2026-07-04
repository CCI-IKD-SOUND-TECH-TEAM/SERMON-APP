import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
const archiver = require('archiver');

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: album, error } = await supabase
    .from('photo_albums')
    .select('*, photos(*)')
    .eq('id', id)
    .single();

  if (error || !album) return NextResponse.json({ error: 'Album not found' }, { status: 404 });
  if (album.status !== 'published') return NextResponse.json({ error: 'Album not published' }, { status: 403 });

  const photos = album.photos;
  if (!photos || photos.length === 0) return NextResponse.json({ error: 'No photos in album' }, { status: 400 });

  // Stream zip to response
  const stream = new ReadableStream({
    async start(controller) {
      const archive = archiver('zip', { zlib: { level: 0 } }); // store only (faster)
      
      archive.on('data', (chunk: any) => controller.enqueue(chunk));
      archive.on('end', () => controller.close());
      archive.on('error', (err: any) => controller.error(err));

      // fetch each photo and append to zip
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        if (photo.file_url) {
          try {
            const res = await fetch(photo.file_url);
            if (res.ok && res.body) {
              // Convert Web ReadableStream to Node Readable
              const reader = res.body.getReader();
              const nodeStream = new ReadableStream({
                async start(c) {
                  while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    c.enqueue(value);
                  }
                  c.close();
                }
              });
              
              // We have to use a node stream adapter or buffer for archiver
              const arrayBuffer = await res.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              archive.append(buffer, { name: `photo_${i + 1}.jpg` });
            }
          } catch (e) {
            console.error('Failed to append photo to zip', e);
          }
        }
      }
      archive.finalize();
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${album.title.replace(/[^a-z0-9]/gi, '_')}.zip"`,
    },
  });
}
