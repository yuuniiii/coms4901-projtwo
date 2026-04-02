'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Table } from '@/components/Table';
import { createRecord, updateRecord, deleteRecord } from '@/lib/actions';
import { Cloud, Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminLLMProviders() {
  const [data, setData] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const { data } = await supabase.from('llm_providers').select('*').order('name');
    setData(data || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await updateRecord('llm_providers', editing.id, formData, '/admin/llm-providers');
      } else {
        await createRecord('llm_providers', formData, '/admin/llm-providers');
      }
      setEditing(null);
      setFormData({ name: '' });
      await fetchData();
    } catch (error) {
      console.error('Error saving provider:', error);
      alert('Failed to save provider.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditing(item);
    setFormData({ name: item.name });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this provider?')) {
      try {
        await deleteRecord('llm_providers', id, '/admin/llm-providers');
        await fetchData();
      } catch (error) {
        console.error('Error deleting provider:', error);
        alert('Failed to delete provider.');
      }
    }
  };

  const inputClasses = "w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-1/50 transition-all text-sm font-medium";
  const labelClasses = "text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 block";

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-accent-1 mb-2">
          <Cloud className="w-5 h-5 fill-current" />
          <span className="text-xs font-black uppercase tracking-[0.3em]">Network Topology</span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-white uppercase">
          LLM<span className="text-white/20">PROVIDERS</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl space-y-6 sticky top-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-accent-1/10 flex items-center justify-center">
                {editing ? <Pencil className="w-4 h-4 text-accent-1" /> : <Plus className="w-4 h-4 text-accent-1" />}
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">{editing ? 'Edit Provider' : 'Add New Provider'}</h2>
            </div>

            <div>
              <label className={labelClasses}>Provider Name</label>
              <input 
                placeholder="e.g. OpenAI, Anthropic" 
                value={formData.name} 
                onChange={e => setFormData({ name: e.target.value })}
                className={inputClasses}
                required
              />
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-accent-1 hover:bg-accent-1/90 disabled:opacity-50 text-[#111434] font-black uppercase text-xs py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : (editing ? 'Update Provider' : 'Create Provider')}
              </button>
              {editing && (
                <button 
                  type="button" 
                  onClick={() => {
                    setEditing(null);
                    setFormData({ name: '' });
                  }} 
                  className="w-full bg-white/5 hover:bg-white/10 text-white/60 font-black uppercase text-xs py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 text-white/20">
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Provider Registry</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <Table
            headers={['Name', 'Actions']}
            rows={data.map(item => [
              <span key={item.id} className="font-bold text-white tracking-tight">{item.name}</span>,
              <div key={item.id} className="flex gap-4">
                <button onClick={() => handleEdit(item)} className="text-accent-2 hover:text-accent-2/80 transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="text-red-400/50 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ])}
          />
        </div>
      </div>
    </div>
  );
}
