import { createClient } from '@/lib/supabaseServer';
import { Table } from '@/components/Table';
import { ClipboardList } from 'lucide-react';
import { Pagination } from '@/components/Pagination';

export default async function AdminCaptionRequests({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam || '1');
  const limit = 10;
  const offset = (page - 1) * limit;

  const supabase = await createClient();

  const { data: requests, count } = await supabase
    .from('caption_requests')
    .select(`
      *,
      profile_id,
      images (url)
    `, { count: 'exact' })
    .order('created_datetime_utc', { ascending: false })
    .range(offset, offset + limit - 1);

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-accent-1 mb-2">
          <ClipboardList className="w-5 h-5" />
          <span className="text-xs font-black uppercase tracking-[0.3em]">System Logs</span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-white uppercase">
          CAPTION<span className="text-white/20">REQUESTS</span>
        </h1>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 text-white/20">
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Transaction History</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>
        
        <Table
  headers={['ID', 'User', 'Image', 'Timestamp']}
  rows={(requests || []).map(r => [
    <span key={`id-${r.id}`} className="text-[10px] font-mono text-white/40">
      #{r.id}
    </span>,

    // 👇 THIS IS THE CHANGE
    <span key={`user-${r.id}`} className="text-xs font-mono text-white/60">
      {r.profile_id || '—'}
    </span>,

    <div key={`image-${r.id}`} className="relative group w-12 h-12">
      <img
        src={(r.images as any)?.url}
        className="w-full h-full object-cover rounded-lg border border-white/10 group-hover:border-accent-1/50 transition-all"
        alt="Request Asset"
      />
    </div>,

    <span key={`time-${r.id}`} className="text-xs text-white/40 font-medium">
      {new Date(r.created_datetime_utc).toLocaleDateString()}
      <span className="block text-[10px] opacity-50">
        {new Date(r.created_datetime_utc).toLocaleTimeString()}
      </span>
    </span>
  ])}
/>

        <Pagination 
          currentPage={page} 
          totalCount={count || 0} 
          limit={limit} 
          baseUrl="/admin/caption-requests" 
        />
      </div>
    </div>
  );
}
