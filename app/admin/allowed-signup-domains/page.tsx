'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Table } from '@/components/Table';
import { createRecord, updateRecord, deleteRecord } from '@/lib/actions';
import { Globe, Plus, Edit3, Trash2, X } from 'lucide-react';

export default function AdminAllowedSignupDomains() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({ apex_domain: '' });

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('allowed_signup_domains').select('*').order('apex_domain');
    setData(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await updateRecord('allowed_signup_domains', editing.id, formData, '/admin/allowed-signup-domains');
      } else {
        await createRecord('allowed_signup_domains', formData, '/admin/allowed-signup-domains');
      }
      setEditing(null);
      setFormData({ apex_domain: '' });
      fetchData();
    } catch (err) {
      alert('Error: ' + (err as any).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditing(item);
    setFormData({ apex_domain: item.apex_domain });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this domain?')) {
      await deleteRecord('allowed_signup_domains', id, '/admin/allowed-signup-domains');
      fetchData();
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-accent-2 mb-2">
          <Globe className="w-5 h-5" />
          <span className="text-xs font-black uppercase tracking-[0.3em]">Access Control</span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-white uppercase">
          SIGNUP<span className="text-white/20">DOMAINS</span>
        </h1>
      </div>

      <div className="bg-white/[0.02] p-8 rounded-2xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-1/5 blur-[100px] -mr-32 -mt-32" />
        
        <h2 className="text-lg font-bold mb-8 flex items-center gap-3">
          {editing ? <Edit3 className="w-5 h-5 text-accent-1" /> : <Plus className="w-5 h-5 text-accent-1" />}
          {editing ? 'Modify Domain' : 'Authorize New Domain'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Apex Domain</label>
            <input 
              placeholder="e.g. columbia.edu" 
              value={formData.apex_domain} 
              onChange={e => setFormData({ apex_domain: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-sm text-white outline-none focus:border-accent-1/50 focus:bg-white/[0.07] transition-all placeholder:text-white/10"
              required
            />
          </div>
          
          <div className="flex gap-4 pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-accent-1 text-navy-dark px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-accent-1/80 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : editing ? 'Update Domain' : 'Authorize Domain'}
            </button>
            {editing && (
              <button 
                type="button" 
                onClick={() => {
                  setEditing(null);
                  setFormData({ apex_domain: '' });
                }} 
                className="bg-white/5 text-white/40 px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 text-white/20">
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Authorized Registry</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <Table
          headers={['Apex Domain', 'Actions']}
          rows={data.map(item => [
            <span key={item.id} className="text-white font-black tracking-tight">{item.apex_domain}</span>,
            <div key={item.id} className="flex gap-6">
              <button 
                onClick={() => handleEdit(item)} 
                className="text-white/40 hover:text-accent-1 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
              <button 
                onClick={() => handleDelete(item.id)} 
                className="text-white/20 hover:text-accent-3 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          ])}
        />
      </div>
    </div>
  );
}
