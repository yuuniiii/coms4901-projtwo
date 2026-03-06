/**
 * ONE-TIME ADMIN BOOTSTRAP SCRIPT
 * 
 * Usage: 
 * 1. Ensure SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL are in your .env
 * 2. Run: npx tsx scripts/promote-admin.ts <user_email>
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing env variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function promoteUser(email: string) {
  console.log(`Searching for user with email: ${email}...`);

  // 1. Find user by email (using admin auth API)
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error fetching users:', authError.message);
    return;
  }

  const user = users.find(u => u.email === email);

  if (!user) {
    console.error(`User with email ${email} not found.`);
    return;
  }

  console.log(`Found user: ${user.id}. Promoting to superadmin...`);

  // 2. Update profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ is_superadmin: true })
    .eq('id', user.id);

  if (profileError) {
    console.error('Error updating profile:', profileError.message);
    return;
  }

  console.log(`Success! User ${email} is now a superadmin.`);
}

const targetEmail = process.argv[2];
if (!targetEmail) {
  console.error('Please provide an email address as an argument.');
  process.exit(1);
}

promoteUser(targetEmail);
