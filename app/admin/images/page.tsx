'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Table } from '@/components/Table';

export default function AdminImages() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingImage, setEditingImage] = useState<any>(null);
  const [formData, setFormData] = useState({
    url: '',
    image_description: '',
    is_public: false,
    is_common_use: false
  });

  const fetchImages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('images')
      .select('*')
      .order('created_datetime_utc', { ascending: false });
    setImages(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (editingImage) {
      const { error } = await supabase
        .from('images')
        .update({
          ...formData,
          modified_datetime_utc: new Promise(resolve => resolve(new Date().toISOString()))
        })
        .eq('id', editingImage.id);
      if (!error) {
        setEditingImage(null);
        setFormData({ url: '', image_description: '', is_public: false, is_common_use: false });
        fetchImages();
      }
    } else {
      const { error } = await supabase
        .from('images')
        .insert([formData]);
      if (!error) {
        setFormData({ url: '', image_description: '', is_public: false, is_common_use: false });
        fetchImages();
      }
    }
  };

  const handleEdit = (img: any) => {
    setEditingImage(img);
    setFormData({
      url: img.url || '',
      image_description: img.image_description || '',
      is_public: img.is_public || false,
      is_common_use: img.is_common_use || false
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      const { error } = await supabase.from('images').delete().eq('id', id);
      if (!error) fetchImages();
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-zinc-900">Image Management</h1>
      </div>

      {/* Form Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
        <h2 className="text-lg font-semibold mb-4">
          {editingImage ? 'Edit Image' : 'Add New Image'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-zinc-700">Image URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full mt-1 px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none"
              placeholder="https://example.com/image.jpg"
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-zinc-700">Description</label>
            <textarea
              value={formData.image_description}
              onChange={(e) => setFormData({ ...formData, image_description: e.target.value })}
              className="w-full mt-1 px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none"
              rows={3}
              placeholder="Detailed description of the image content..."
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_public}
              onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
              id="is_public"
            />
            <label htmlFor="is_public" className="text-sm text-zinc-700">Make Public</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_common_use}
              onChange={(e) => setFormData({ ...formData, is_common_use: e.target.checked })}
              id="is_common_use"
            />
            <label htmlFor="is_common_use" className="text-sm text-zinc-700">Common Use</label>
          </div>
          <div className="col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-zinc-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-zinc-800 transition-colors"
            >
              {editingImage ? 'Update Image' : 'Create Image'}
            </button>
            {editingImage && (
              <button
                type="button"
                onClick={() => {
                  setEditingImage(null);
                  setFormData({ url: '', image_description: '', is_public: false, is_common_use: false });
                }}
                className="bg-zinc-100 text-zinc-700 px-6 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List Section */}
      <Table
        headers={['Preview', 'Description', 'Settings', 'Actions']}
        rows={images.map(img => [
          <img key={img.id} src={img.url} className="w-16 h-16 object-cover rounded-lg border border-zinc-200" />,
          <div key={img.id} className="max-w-xs overflow-hidden">
            <p className="truncate font-medium">{img.image_description || 'No description'}</p>
            <p className="text-xs text-zinc-400 truncate">{img.url}</p>
          </div>,
          <div key={img.id} className="flex flex-col gap-1">
            <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${img.is_public ? 'bg-blue-50 text-blue-700' : 'bg-zinc-50 text-zinc-500'}`}>
              {img.is_public ? 'Public' : 'Private'}
            </span>
            {img.is_common_use && (
              <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full w-fit">Common</span>
            )}
          </div>,
          <div key={img.id} className="flex gap-4">
            <button 
              onClick={() => handleEdit(img)}
              className="text-zinc-900 font-semibold hover:underline"
            >
              Edit
            </button>
            <button 
              onClick={() => handleDelete(img.id)}
              className="text-red-600 font-semibold hover:underline"
            >
              Delete
            </button>
          </div>
        ])}
      />
    </div>
  );
}
