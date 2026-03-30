import { createClient } from '@/lib/supabaseServer';
import { Table } from '@/components/Table';

export default async function AdminCaptionRequests() {
  const supabase = await createClient();

  const { data: requests } = await supabase
    .from('caption_requests')
    .select(`
      *,
      profiles (first_name, last_name, email),
      images (url)
    `)
    .order('created_datetime_utc', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Caption Requests (Read Only)</h1>
      
      <Table
        headers={['ID', 'User', 'Image', 'Date']}
        rows={(requests || []).map(r => [
          r.id,
          <div key={r.id}>
            <p className="font-medium">{(r.profiles as any)?.first_name} {(r.profiles as any)?.last_name}</p>
            <p className="text-xs text-zinc-400">{(r.profiles as any)?.email}</p>
          </div>,
          <img key={r.id} src={(r.images as any)?.url} className="w-12 h-12 object-cover rounded" />,
          new Date(r.created_datetime_utc).toLocaleString()
        ])}
      />
    </div>
  );
}
