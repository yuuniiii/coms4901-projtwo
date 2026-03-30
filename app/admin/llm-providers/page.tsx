'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Table } from '@/components/Table';
import { createRecord, updateRecord, deleteRecord } from '@/lib/actions';

export default function AdminLLMProviders() {
  const [data, setData] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '' });

  const fetchData = async () => {
    const { data } = await supabase.from('llm_providers').select('*').order('name');
    setData(data || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await updateRecord('llm_providers', editing.id, formData, '/admin/llm-providers');
    } else {
      await createRecord('llm_providers', formData, '/admin/llm-providers');
    }
    setEditing(null);
    setFormData({ name: '' });
    fetchData();
  };

  const handleEdit = (item: any) => {
    setEditing(item);
    setFormData({ name: item.name });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete?')) {
      await deleteRecord('llm_providers', id, '/admin/llm-providers');
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">LLM Provider Management</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-zinc-200 space-y-4">
        <h2 className="text-lg font-semibold">{editing ? 'Edit Provider' : 'Add Provider'}</h2>
        <input 
          placeholder="Provider Name (e.g. OpenAI, Anthropic)" 
          value={formData.name} 
          onChange={e => setFormData({ name: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <div className="flex gap-2">
          <button type="submit" className="bg-zinc-900 text-white px-4 py-2 rounded-md">Save</button>
          {editing && <button type="button" onClick={() => setEditing(null)} className="bg-zinc-100 px-4 py-2 rounded-md">Cancel</button>}
        </div>
      </form>

      <Table
        headers={['Name', 'Actions']}
        rows={data.map(item => [
          item.name,
          <div key={item.id} className="flex gap-2">
            <button onClick={() => handleEdit(item)} className="text-zinc-900 font-semibold">Edit</button>
            <button onClick={() => handleDelete(item.id)} className="text-red-600 font-semibold">Delete</button>
          </div>
        ])}
      />
    </div>
  );
}
