import { createClient } from '@/lib/supabaseServer';
import { Table } from '@/components/Table';

export default async function AdminHumorFlavors() {
  const supabase = await createClient();

  const { data: flavors } = await supabase
    .from('humor_flavors')
    .select('*')
    .order('slug', { ascending: true });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Humor Flavors (Read Only)</h1>
      
      <Table
        headers={['ID', 'Slug', 'Description', 'Created (UTC)']}
        rows={(flavors || []).map(f => [
          f.id,
          <span key={f.id} className="font-mono text-xs font-semibold">{f.slug}</span>,
          f.description,
          new Date(f.created_datetime_utc).toLocaleString()
        ])}
      />
    </div>
  );
}
