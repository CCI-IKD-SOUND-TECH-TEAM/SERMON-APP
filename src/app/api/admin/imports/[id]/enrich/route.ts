import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    
    // Basic auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const importId = resolvedParams.id;
    const body = await req.json();
    
    // type can be 'sermon' or 'photo_album'
    const { type, title, description, preacher, seriesId, eventDate, coverImageUrl } = body;

    if (!type || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Fetch the import record
    const { data: importRecord, error: importError } = await supabase
      .from('media_imports')
      .select('*')
      .eq('id', importId)
      .single();

    if (importError || !importRecord) {
      return NextResponse.json({ error: 'Import not found' }, { status: 404 });
    }

    // 2. Insert into specific table based on type
    if (type === 'sermon') {
      const { error: sermonError } = await supabase
        .from('sermons')
        .insert({
          title,
          description,
          speaker: preacher,
          series_id: seriesId || null,
          media_import_id: importId,
          drive_file_id: importRecord.google_file_id,
          thumbnail_url: coverImageUrl,
          sermon_date: eventDate,
          status: 'published',
          published_by: user.id,
          published_at: new Date().toISOString()
        });
        
      if (sermonError) throw sermonError;
    } else if (type === 'photo_album') {
      const { error: albumError } = await supabase
        .from('photo_albums')
        .insert({
          title,
          description,
          media_import_id: importId,
          cover_image_url: coverImageUrl,
          event_date: eventDate,
          published_by: user.id,
          published_at: new Date().toISOString()
        });

      if (albumError) throw albumError;
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // 3. Update the media_imports status
    const { error: updateError } = await supabase
      .from('media_imports')
      .update({ status: 'PUBLISHED' })
      .eq('id', importId);

    if (updateError) throw updateError;

    return NextResponse.json({ message: 'Enrichment and publishing successful' });

  } catch (error: any) {
    console.error('Enrichment Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
