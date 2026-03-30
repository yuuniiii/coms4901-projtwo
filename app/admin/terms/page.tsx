'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Table } from '@/components/Table';
import { createRecord, updateRecord, deleteRecord } from '@/lib/actions';

export default function AdminTerms() {
  const [data, setData] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({ term: '', definition: '', example: '', priority: 0 });

  const fetchData = async () => {
    const { data } = await supabase.from('terms').select('*').order('term');
    setData(data || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await updateRecord('terms', editing.id, formData, '/admin/terms');
    } else {
      await createRecord('terms', formData, '/admin/terms');
    }
    setEditing(null);
    setFormData({ term: '', definition: '', example: '', priority: 0 });
    fetchData();
  };

  const handleEdit = (item: any) => {
    setEditing(item);
    setFormData({ term: item.term, definition: item.definition, example: item.example, priority: item.priority });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete?')) {
      await deleteRecord('terms', id, '/admin/terms');
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Term Management</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-zinc-200 space-y-4">
        <h2 className="text-lg font-semibold">{editing ? 'Edit Term' : 'Add Term'}</h2>
        <div className="grid grid-cols-2 gap-4">
          <input 
            placeholder="Term" 
            value={formData.term} 
            onChange={e => setFormData({...formData, term: e.target.value})}
            className="px-3 py-2 border rounded-md"
            required
          />
          <input 
            type="number" 
            placeholder="Priority" 
            value={formData.priority} 
            onChange={e => setFormData({...formData, priority: parseInt(e.target.value)})}
            className="px-3 py-2 border rounded-md"
          />
        </div>
        <textarea 
          placeholder="Definition" 
          value={formData.definition} 
          onChange={e => setFormData({...formData, definition: e.target.value})}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <textarea 
          placeholder="Example" 
          value={formData.example} 
          onChange={e => setFormData({...formData, example: e.target.value})}
          className="w-full px-3 py-2 border rounded-md"
        />
        <div className="flex gap-2">
          <button type="submit" className="bg-zinc-900 text-white px-4 py-2 rounded-md">Save</button>
          {editing && <button type="button" onClick={() => setEditing(null)} className="bg-zinc-100 px-4 py-2 rounded-md">Cancel</button>}
        </div>
      </form>

      <Table
        headers={['Term', 'Definition', 'Priority', 'Actions']}
        rows={data.map(item => [
          item.term,
          <div key={item.id} className="max-w-xs truncate">{item.definition}</div>,
          item.priority,
          <div key={item.id} className="flex gap-2">
            <button onClick={() => handleEdit(item)} className="text-zinc-900 font-semibold">Edit</button>
            <button onClick={() => handleDelete(item.id)} className="text-red-600 font-semibold">Delete</button>
          </div>
        ])}
      />
    </div>
  );
}
