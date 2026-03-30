'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Table } from '@/components/Table';
import { createRecord, updateRecord, deleteRecord } from '@/lib/actions';

export default function AdminCaptionExamples() {
  const [data, setData] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({ image_description: '', caption: '', explanation: '', priority: 0 });

  const fetchData = async () => {
    const { data } = await supabase.from('caption_examples').select('*').order('priority', { ascending: false });
    setData(data || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await updateRecord('caption_examples', editing.id, formData, '/admin/caption-examples');
    } else {
      await createRecord('caption_examples', formData, '/admin/caption-examples');
    }
    setEditing(null);
    setFormData({ image_description: '', caption: '', explanation: '', priority: 0 });
    fetchData();
  };

  const handleEdit = (item: any) => {
    setEditing(item);
    setFormData({ 
      image_description: item.image_description, 
      caption: item.caption, 
      explanation: item.explanation, 
      priority: item.priority 
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete?')) {
      await deleteRecord('caption_examples', id, '/admin/caption-examples');
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Caption Example Management</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-zinc-200 space-y-4">
        <h2 className="text-lg font-semibold">{editing ? 'Edit Example' : 'Add Example'}</h2>
        <div className="grid grid-cols-2 gap-4">
          <input 
            placeholder="Priority" 
            type="number"
            value={formData.priority} 
            onChange={e => setFormData({...formData, priority: parseInt(e.target.value)})}
            className="px-3 py-2 border rounded-md"
          />
          <input 
            placeholder="Caption" 
            value={formData.caption} 
            onChange={e => setFormData({...formData, caption: e.target.value})}
            className="px-3 py-2 border rounded-md"
            required
          />
        </div>
        <textarea 
          placeholder="Image Description" 
          value={formData.image_description} 
          onChange={e => setFormData({...formData, image_description: e.target.value})}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <textarea 
          placeholder="Explanation" 
          value={formData.explanation} 
          onChange={e => setFormData({...formData, explanation: e.target.value})}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <div className="flex gap-2">
          <button type="submit" className="bg-zinc-900 text-white px-4 py-2 rounded-md">Save</button>
          {editing && <button type="button" onClick={() => setEditing(null)} className="bg-zinc-100 px-4 py-2 rounded-md">Cancel</button>}
        </div>
      </form>

      <Table
        headers={['Caption', 'Description', 'Priority', 'Actions']}
        rows={data.map(item => [
          item.caption,
          <div key={item.id} className="max-w-xs truncate">{item.image_description}</div>,
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
