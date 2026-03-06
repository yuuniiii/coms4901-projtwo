import { createClient } from '@/lib/supabaseServer';
import { Table } from '@/components/Table';

export default async function AdminUsers() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from('profiles')
    .select('first_name, last_name, email, is_superadmin')
    .order('last_name', { ascending: true });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">User Management</h1>
      
      <Table
        headers={['Name', 'Email', 'Superadmin Status']}
        rows={(users || []).map(u => [
          `${u.first_name} ${u.last_name}`,
          u.email,
          u.is_superadmin ? (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
              Admin
            </span>
          ) : (
            <span className="px-2 py-1 bg-zinc-100 text-zinc-600 text-xs font-semibold rounded-full">
              User
            </span>
          )
        ])}
      />
    </div>
  );
}
