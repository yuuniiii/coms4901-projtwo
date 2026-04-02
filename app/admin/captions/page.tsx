import { createClient } from '@/lib/supabaseServer';
import { Table } from '@/components/Table';
import { Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-accent-1 mb-2">
          <Quote className="w-5 h-5 fill-current" />
          <span className="text-xs font-black uppercase tracking-[0.3em]">Content Engine</span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-white uppercase">
          GENERATED<span className="text-white/20">CAPTIONS</span>
        </h1>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 text-white/20">
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Output Registry</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>
        
        <Table
          headers={['Caption', 'Asset', 'Flavor', 'Creator', 'Status']}
          rows={(captions || []).map(c => [
            <span key={c.id} className="block max-w-md font-bold text-white tracking-tight leading-relaxed">{c.content}</span>,
            <div key={c.id} className="relative group w-12 h-12">
              <img src={(c.images as any)?.url} className="w-full h-full object-cover rounded-lg border border-white/10 group-hover:border-accent-1/50 transition-all" />
            </div>,
            <div key={c.id} className="space-y-1">
              <p className="text-xs font-black text-accent-2 uppercase tracking-widest">{(c.humor_flavors as any)?.slug}</p>
              <p className="text-[10px] text-white/20 line-clamp-1">{(c.humor_flavors as any)?.description}</p>
            </div>,
            <span key={c.id} className="text-xs font-bold text-white/60">{(c.profiles as any)?.first_name} {(c.profiles as any)?.last_name}</span>,
            <span key={c.id} className={cn(
              "bg-accent-1/10 text-accent-1 border border-accent-1/20 font-black uppercase text-[9px] px-3 py-1 rounded-full whitespace-nowrap",
              !c.is_public && "opacity-40 grayscale"
            )}>
              {c.is_public ? 'Public' : 'Private'}
            </span>
          ])}
        />
      </div>
    </div>
  );
}
