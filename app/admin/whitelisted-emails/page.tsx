'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Table } from '@/components/Table';
import { createRecord, updateRecord, deleteRecord } from '@/lib/actions';

export default function AdminWhitelistedEmails() {
  const [data, setData] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({ email_address: '' });

  const fetchData = async () => {
    const { data } = await supabase.from('whitelist_email_addresses').select('*').order('email_address');
    setData(data || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await updateRecord('whitelist_email_addresses', editing.id, formData, '/admin/whitelisted-emails');
    } else {
      await createRecord('whitelist_email_addresses', formData, '/admin/whitelisted-emails');
    }
    setEditing(null);
    setFormData({ email_address: '' });
    fetchData();
  };

  const handleEdit = (item: any) => {
    setEditing(item);
    setFormData({ email_address: item.email_address });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete?')) {
      await deleteRecord('whitelist_email_addresses', id, '/admin/whitelisted-emails');
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Whitelisted Email Addresses</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-zinc-200 space-y-4">
        <h2 className="text-lg font-semibold">{editing ? 'Edit Email' : 'Add Email'}</h2>
        <input 
          type="email"
          placeholder="Email Address (e.g. user@example.com)" 
          value={formData.email_address} 
          onChange={e => setFormData({ email_address: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <div className="flex gap-2">
          <button type="submit" className="bg-zinc-900 text-white px-4 py-2 rounded-md">Save</button>
          {editing && <button type="button" onClick={() => setEditing(null)} className="bg-zinc-100 px-4 py-2 rounded-md">Cancel</button>}
        </div>
      </form>

      <Table
        headers={['Email Address', 'Actions']}
        rows={data.map(item => [
          item.email_address,
          <div key={item.id} className="flex gap-2">
            <button onClick={() => handleEdit(item)} className="text-zinc-900 font-semibold">Edit</button>
            <button onClick={() => handleDelete(item.id)} className="text-red-600 font-semibold">Delete</button>
          </div>
        ])}
      />
    </div>
  );
}
