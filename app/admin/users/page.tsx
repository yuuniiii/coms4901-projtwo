import { createClient } from '@/lib/supabaseServer';
import { Table } from '@/components/Table';
import { Users as UsersIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function AdminUsers() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from('profiles')
    .select('first_name, last_name, email, is_superadmin')
    .order('last_name', { ascending: true });

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-accent-1 mb-2">
          <UsersIcon className="w-5 h-5 fill-current" />
          <span className="text-xs font-black uppercase tracking-[0.3em]">User Directory</span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-white uppercase">
          PER<span className="text-white/20">SONNEL</span>
        </h1>
      </div>
      
      <Table
        headers={['Identified Agent', 'Authentication Root', 'Access Level']}
        rows={(users || []).map(u => [
          <span key={u.email} className="font-black text-white">{u.first_name} {u.last_name}</span>,
          <span key={u.email} className="text-xs text-white/40 font-mono">{u.email}</span>,
          u.is_superadmin ? (
            <span className="px-3 py-1 bg-accent-1/10 text-accent-1 border border-accent-1/20 text-[9px] font-black uppercase rounded-full tracking-widest">
              Superadmin
            </span>
          ) : (
            <span className="px-3 py-1 bg-white/5 text-white/30 border border-white/5 text-[9px] font-black uppercase rounded-full tracking-widest">
              Standard
            </span>
          )
        ])}
      />
    </div>
  );
}
