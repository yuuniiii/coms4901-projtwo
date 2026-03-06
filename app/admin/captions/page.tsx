import { createClient } from '@/lib/supabaseServer';
import { Table } from '@/components/Table';

export default async function AdminCaptions() {
  const supabase = await createClient();

  const { data: captions } = await supabase
    .from('captions')
    .select(`
      id,
      content,
      is_public,
      created_datetime_utc,
      images (url),
      humor_flavors (description, slug),
      profiles (first_name, last_name)
    `)
    .order('created_datetime_utc', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Caption Management</h1>
      
      <Table
        headers={['Caption', 'Image', 'Flavor', 'Creator', 'Status']}
        rows={(captions || []).map(c => [
          <span key={c.id} className="block max-w-md whitespace-normal">{c.content}</span>,
          <img key={c.id} src={(c.images as any)?.url} className="w-12 h-12 object-cover rounded" />,
          <div key={c.id}>
            <p className="text-sm font-medium">{(c.humor_flavors as any)?.slug}</p>
            <p className="text-xs text-zinc-400">{(c.humor_flavors as any)?.description}</p>
          </div>,
          `${(c.profiles as any)?.first_name} ${(c.profiles as any)?.last_name}`,
          c.is_public ? (
            <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">Public</span>
          ) : (
            <span className="text-xs px-2 py-0.5 bg-zinc-50 text-zinc-500 rounded-full">Private</span>
          )
        ])}
      />
    </div>
  );
}
