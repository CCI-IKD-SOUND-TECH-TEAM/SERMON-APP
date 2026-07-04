import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/admin';

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    
    if (!error) {
      // redirect user to specified redirect URL
      const nextUrl = request.nextUrl.clone();
      
      if (type === 'invite') {
        nextUrl.pathname = '/admin/update-password';
      } else {
        nextUrl.pathname = next;
      }
      
      nextUrl.searchParams.delete('token_hash');
      nextUrl.searchParams.delete('type');
      nextUrl.searchParams.delete('next');
      return NextResponse.redirect(nextUrl);
    }
  }

  // redirect the user to an error page with some instructions
  const errorUrl = request.nextUrl.clone();
  errorUrl.pathname = '/admin/login';
  errorUrl.searchParams.set('error', 'Auth token is invalid or has expired.');
  // Make sure to remove old token hashes from URL if they exist
  errorUrl.searchParams.delete('token_hash');
  errorUrl.searchParams.delete('type');
  return NextResponse.redirect(errorUrl);
}
