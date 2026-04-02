'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Table } from '@/components/Table';
import { createRecord, updateRecord, deleteRecord } from '@/lib/actions';
import { Cpu, Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminLLMModels() {
  const [data, setData] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', llm_provider_id: 0, provider_model_id: '', is_temperature_supported: false });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const { data: models } = await supabase.from('llm_models').select('*, llm_providers(name)').order('name');
    const { data: provs } = await supabase.from('llm_providers').select('*').order('name');
    setData(models || []);
    setProviders(provs || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.llm_provider_id === 0) {
      alert('Please select a provider');
      return;
    }
    setLoading(true);
    try {
      if (editing) {
        await updateRecord('llm_models', editing.id, formData, '/admin/llm-models');
      } else {
        await createRecord('llm_models', formData, '/admin/llm-models');
      }
      setEditing(null);
      setFormData({ name: '', llm_provider_id: 0, provider_model_id: '', is_temperature_supported: false });
      await fetchData();
    } catch (error) {
      console.error('Error saving model:', error);
      alert('Failed to save model.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditing(item);
    setFormData({ 
      name: item.name, 
      llm_provider_id: item.llm_provider_id, 
      provider_model_id: item.provider_model_id, 
      is_temperature_supported: item.is_temperature_supported 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this model?')) {
      try {
        await deleteRecord('llm_models', id, '/admin/llm-models');
        await fetchData();
      } catch (error) {
        console.error('Error deleting model:', error);
        alert('Failed to delete model.');
      }
    }
  };

  const inputClasses = "w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-1/50 transition-all text-sm font-medium";
  const labelClasses = "text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 block";

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-accent-1 mb-2">
          <Cpu className="w-5 h-5 fill-current" />
          <span className="text-xs font-black uppercase tracking-[0.3em]">AI Infrastructure</span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-white uppercase">
          LLM<span className="text-white/20">MODELS</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl space-y-6 sticky top-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-accent-1/10 flex items-center justify-center">
                {editing ? <Pencil className="w-4 h-4 text-accent-1" /> : <Plus className="w-4 h-4 text-accent-1" />}
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">{editing ? 'Edit Model' : 'Add New Model'}</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClasses}>Model Name</label>
                <input 
                  placeholder="e.g. GPT-4o" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className={inputClasses}
                  required
                />
              </div>

              <div>
                <label className={labelClasses}>Provider</label>
                <select 
                  value={formData.llm_provider_id} 
                  onChange={e => setFormData({...formData, llm_provider_id: parseInt(e.target.value)})}
                  className={cn(inputClasses, "appearance-none")}
                  required
                >
                  <option value={0} className="bg-[#111434]">Select Provider</option>
                  {providers.map(p => <option key={p.id} value={p.id} className="bg-[#111434]">{p.name}</option>)}
                </select>
              </div>

              <div>
                <label className={labelClasses}>Provider Model ID</label>
                <input 
                  placeholder="e.g. gpt-4o-2024-05-13" 
                  value={formData.provider_model_id} 
                  onChange={e => setFormData({...formData, provider_model_id: e.target.value})}
                  className={inputClasses}
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={formData.is_temperature_supported}
                    onChange={e => setFormData({...formData, is_temperature_supported: e.target.checked})}
                    id="temp_supp"
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white/40 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-1/50 peer-checked:after:bg-white"></div>
                </div>
                <label htmlFor="temp_supp" className="text-xs font-bold text-white/40 uppercase tracking-wider cursor-pointer">Temp. Supported</label>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-accent-1 hover:bg-accent-1/90 disabled:opacity-50 text-[#111434] font-black uppercase text-xs py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : (editing ? 'Update Model' : 'Create Model')}
              </button>
              {editing && (
                <button 
                  type="button" 
                  onClick={() => {
                    setEditing(null);
                    setFormData({ name: '', llm_provider_id: 0, provider_model_id: '', is_temperature_supported: false });
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
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Model Registry</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <Table
            headers={['Name', 'Provider', 'Model ID', 'Temp?', 'Actions']}
            rows={data.map(item => [
              <span key={item.id} className="font-bold text-white tracking-tight">{item.name}</span>,
              <span key={item.id} className="text-xs font-black text-accent-2 uppercase tracking-widest">{(item.llm_providers as any)?.name}</span>,
              <code key={item.id} className="text-[10px] font-mono text-white/40">{item.provider_model_id}</code>,
              <span key={item.id} className={cn(
                "text-[10px] font-black uppercase px-2 py-1 rounded border",
                item.is_temperature_supported ? "text-accent-1 border-accent-1/20 bg-accent-1/5" : "text-white/20 border-white/5"
              )}>
                {item.is_temperature_supported ? 'Yes' : 'No'}
              </span>,
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
