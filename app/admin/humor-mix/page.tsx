'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Table } from '@/components/Table';
import { updateRecord } from '@/lib/actions';

export default function AdminHumorMix() {
  const [mixes, setMixes] = useState<any[]>([]);
  const [flavors, setFlavors] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({ humor_flavor_id: 0, caption_count: 0 });

  const fetchData = async () => {
    const { data: mixData } = await supabase
      .from('humor_flavor_mix')
      .select(`
        *,
        humor_flavors (slug, description)
      `)
      .order('id');
    const { data: flavorData } = await supabase.from('humor_flavors').select('*').order('slug');
    
    setMixes(mixData || []);
    setFlavors(flavorData || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (m: any) => {
    setEditing(m);
    setFormData({ humor_flavor_id: m.humor_flavor_id, caption_count: m.caption_count });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateRecord('humor_flavor_mix', editing.id, formData, '/admin/humor-mix');
      setEditing(null);
      fetchData();
    } catch (err) {
      alert('Error updating record');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Humor Mix Management</h1>

      {editing && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-zinc-200 space-y-4">
          <h2 className="text-lg font-semibold">Edit Humor Mix Step</h2>
          <div>
            <label className="block text-sm font-medium">Humor Flavor</label>
            <select 
              value={formData.humor_flavor_id} 
              onChange={e => setFormData({...formData, humor_flavor_id: parseInt(e.target.value)})}
              className="w-full mt-1 px-3 py-2 border rounded-md"
              required
            >
              <option value={0}>Select Flavor</option>
              {flavors.map(f => <option key={f.id} value={f.id}>{f.slug}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Caption Count</label>
            <input 
              type="number"
              value={formData.caption_count} 
              onChange={e => setFormData({...formData, caption_count: parseInt(e.target.value)})}
              className="w-full mt-1 px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-zinc-900 text-white px-4 py-2 rounded-md">Save</button>
            <button type="button" onClick={() => setEditing(null)} className="bg-zinc-100 px-4 py-2 rounded-md">Cancel</button>
          </div>
        </form>
      )}

      <Table
        headers={['Mix ID', 'Flavor Slug', 'Caption Count', 'Actions']}
        rows={mixes.map(m => [
          m.id,
          <span key={m.id} className="font-mono">{(m.humor_flavors as any)?.slug}</span>,
          m.caption_count,
          <button key={m.id} onClick={() => handleEdit(m)} className="text-zinc-900 font-semibold hover:underline">Edit</button>
        ])}
      />
    </div>
  );
}
