import { createClient } from '@/lib/supabaseServer';
import { Table } from '@/components/Table';

export default async function AdminLLMPromptChains() {
  const supabase = await createClient();

  const { data: chains } = await supabase
    .from('llm_prompt_chains')
    .select(`
      *,
      caption_requests (id)
    `)
    .order('created_datetime_utc', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">LLM Prompt Chains (Read Only)</h1>
      
      <Table
        headers={['Chain ID', 'Request ID', 'Created (UTC)']}
        rows={(chains || []).map(c => [
          c.id,
          (c.caption_requests as any)?.id,
          new Date(c.created_datetime_utc).toLocaleString()
        ])}
      />
    </div>
  );
}
