import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // Fetch profile to determine redirect
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_superadmin')
        .eq('id', data.user.id)
        .single();

      if (profile?.is_superadmin) {
        return NextResponse.redirect(`${origin}/admin`);
      }
      
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
