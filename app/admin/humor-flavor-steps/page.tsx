import { createClient } from '@/lib/supabaseServer';
import { Table } from '@/components/Table';

export default async function AdminHumorFlavorSteps() {
  const supabase = await createClient();

  const { data: steps } = await supabase
    .from('humor_flavor_steps')
    .select(`
      *,
      humor_flavors (slug),
      llm_models (name)
    `)
    .order('humor_flavor_id', { ascending: true })
    .order('order_by', { ascending: true });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Humor Flavor Steps (Read Only)</h1>
      
      <Table
        headers={['Flavor', 'Order', 'Model', 'Description', 'System Prompt']}
        rows={(steps || []).map(s => [
          <span key={s.id} className="font-semibold text-zinc-900">{(s.humor_flavors as any)?.slug}</span>,
          s.order_by,
          (s.llm_models as any)?.name,
          s.description,
          <div key={s.id} className="max-w-xs truncate text-xs text-zinc-500" title={s.llm_system_prompt || ''}>
            {s.llm_system_prompt}
          </div>
        ])}
      />
    </div>
  );
}
