import { redirect } from 'next/navigation';
import { createClient } from './supabaseServer';

/**
 * Server-side helper to check if the current user is a superadmin.
 */
export async function adminCheck() {
  const supabase = await createClient();

  // 1. Authenticate the user (reads from cookies)
  // We use getUser() for security as it re-validates the session with Supabase
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.log("AdminCheck: No user or session error", authError?.message);
    redirect('/');
  }

  // 2. Authorize the user (check profile)
  // We use the ADMIN client here to bypass RLS. 
  // If RLS is strict on the 'profiles' table, the user might not be able to 
  // read their own profile even if logged in, which causes a "false logout".
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile || !profile.is_superadmin) {
    console.log("AdminCheck: Not a superadmin or profile error", profileError?.message);
    redirect('/');
  }

  return { user, profile };
}
