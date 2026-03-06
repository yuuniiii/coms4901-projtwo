import { redirect } from 'next/navigation';
import { createClient } from './supabaseServer';

/**
 * Server-side helper to check if the current user is a superadmin.
 * If not, it redirects to /login.
 */
export async function adminCheck() {
  const supabase = await createClient();

  // 1. Get current session
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/');
  }

  // 2. Fetch the user's profile to check superadmin status
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || !profile.is_superadmin) {
    redirect('/');
  }

  return { user, profile };
}
