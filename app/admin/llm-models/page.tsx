'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Table } from '@/components/Table';
import { createRecord, updateRecord, deleteRecord } from '@/lib/actions';

export default function AdminLLMModels() {
  const [data, setData] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', llm_provider_id: 0, provider_model_id: '', is_temperature_supported: false });

  const fetchData = async () => {
    const { data: models } = await supabase.from('llm_models').select('*, llm_providers(name)').order('name');
    const { data: provs } = await supabase.from('llm_providers').select('*').order('name');
    setData(models || []);
    setProviders(provs || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await updateRecord('llm_models', editing.id, formData, '/admin/llm-models');
    } else {
      await createRecord('llm_models', formData, '/admin/llm-models');
    }
    setEditing(null);
    setFormData({ name: '', llm_provider_id: 0, provider_model_id: '', is_temperature_supported: false });
    fetchData();
  };

  const handleEdit = (item: any) => {
    setEditing(item);
    setFormData({ 
      name: item.name, 
      llm_provider_id: item.llm_provider_id, 
      provider_model_id: item.provider_model_id, 
      is_temperature_supported: item.is_temperature_supported 
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete?')) {
      await deleteRecord('llm_models', id, '/admin/llm-models');
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">LLM Model Management</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-zinc-200 space-y-4">
        <h2 className="text-lg font-semibold">{editing ? 'Edit Model' : 'Add Model'}</h2>
        <div className="grid grid-cols-2 gap-4">
          <input 
            placeholder="Name" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="px-3 py-2 border rounded-md"
            required
          />
          <select 
            value={formData.llm_provider_id} 
            onChange={e => setFormData({...formData, llm_provider_id: parseInt(e.target.value)})}
            className="px-3 py-2 border rounded-md"
            required
          >
            <option value={0}>Select Provider</option>
            {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input 
            placeholder="Provider Model ID (e.g. gpt-4)" 
            value={formData.provider_model_id} 
            onChange={e => setFormData({...formData, provider_model_id: e.target.value})}
            className="px-3 py-2 border rounded-md"
            required
          />
          <div className="flex items-center gap-2">
            <input 
              type="checkbox"
              checked={formData.is_temperature_supported}
              onChange={e => setFormData({...formData, is_temperature_supported: e.target.checked})}
              id="temp_supp"
            />
            <label htmlFor="temp_supp" className="text-sm">Temperature Supported</label>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-zinc-900 text-white px-4 py-2 rounded-md">Save</button>
          {editing && <button type="button" onClick={() => setEditing(null)} className="bg-zinc-100 px-4 py-2 rounded-md">Cancel</button>}
        </div>
      </form>

      <Table
        headers={['Name', 'Provider', 'Model ID', 'Temp?', 'Actions']}
        rows={data.map(item => [
          item.name,
          (item.llm_providers as any)?.name,
          item.provider_model_id,
          item.is_temperature_supported ? 'Yes' : 'No',
          <div key={item.id} className="flex gap-2">
            <button onClick={() => handleEdit(item)} className="text-zinc-900 font-semibold">Edit</button>
            <button onClick={() => handleDelete(item.id)} className="text-red-600 font-semibold">Delete</button>
          </div>
        ])}
      />
    </div>
  );
}
