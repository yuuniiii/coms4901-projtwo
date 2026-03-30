'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Table } from '@/components/Table';
import { createRecord, updateRecord, deleteRecord } from '@/lib/actions';

export default function AdminAllowedSignupDomains() {
  const [data, setData] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({ apex_domain: '' });

  const fetchData = async () => {
    const { data } = await supabase.from('allowed_signup_domains').select('*').order('apex_domain');
    setData(data || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await updateRecord('allowed_signup_domains', editing.id, formData, '/admin/allowed-signup-domains');
    } else {
      await createRecord('allowed_signup_domains', formData, '/admin/allowed-signup-domains');
    }
    setEditing(null);
    setFormData({ apex_domain: '' });
    fetchData();
  };

  const handleEdit = (item: any) => {
    setEditing(item);
    setFormData({ apex_domain: item.apex_domain });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete?')) {
      await deleteRecord('allowed_signup_domains', id, '/admin/allowed-signup-domains');
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Allowed Signup Domains</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-zinc-200 space-y-4">
        <h2 className="text-lg font-semibold">{editing ? 'Edit Domain' : 'Add Domain'}</h2>
        <input 
          placeholder="Apex Domain (e.g. columbia.edu)" 
          value={formData.apex_domain} 
          onChange={e => setFormData({ apex_domain: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <div className="flex gap-2">
          <button type="submit" className="bg-zinc-900 text-white px-4 py-2 rounded-md">Save</button>
          {editing && <button type="button" onClick={() => setEditing(null)} className="bg-zinc-100 px-4 py-2 rounded-md">Cancel</button>}
        </div>
      </form>

      <Table
        headers={['Apex Domain', 'Actions']}
        rows={data.map(item => [
          item.apex_domain,
          <div key={item.id} className="flex gap-2">
            <button onClick={() => handleEdit(item)} className="text-zinc-900 font-semibold">Edit</button>
            <button onClick={() => handleDelete(item.id)} className="text-red-600 font-semibold">Delete</button>
          </div>
        ])}
      />
    </div>
  );
}
