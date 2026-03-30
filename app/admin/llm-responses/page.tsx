import { createClient } from '@/lib/supabaseServer';
import { Table } from '@/components/Table';

export default async function AdminLLMResponses() {
  const supabase = await createClient();

  const { data: responses } = await supabase
    .from('llm_model_responses')
    .select(`
      *,
      llm_models (name),
      humor_flavors (slug)
    `)
    .order('created_datetime_utc', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">LLM Responses (Read Only)</h1>
      
      <Table
        headers={['ID', 'Model', 'Flavor', 'Response', 'Time (s)']}
        rows={(responses || []).map(r => [
          r.id.substring(0, 8) + '...',
          (r.llm_models as any)?.name,
          (r.humor_flavors as any)?.slug,
          <div key={r.id} className="max-w-md whitespace-normal text-sm">
            {r.llm_model_response}
          </div>,
          r.processing_time_seconds
        ])}
      />
    </div>
  );
}
