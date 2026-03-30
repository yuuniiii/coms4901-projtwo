'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Table } from '@/components/Table';
import { uploadImage, updateRecord, deleteRecord } from '@/lib/actions';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    try {
      if (editingImage) {
        await updateRecord('images', editingImage.id, {
          ...formData,
          modified_datetime_utc: new Date().toISOString()
        }, '/admin/images');
      } else {
        const file = fileInputRef.current?.files?.[0];
        if (file) {
          const uploadFormData = new FormData();
          uploadFormData.append('file', file);
          uploadFormData.append('description', formData.image_description);
          uploadFormData.append('is_public', String(formData.is_public));
          uploadFormData.append('is_common_use', String(formData.is_common_use));
          await uploadImage(uploadFormData);
        } else {
          // Fallback if no file selected (just use URL)
          const { error } = await supabase.from('images').insert([formData]);
          if (error) throw error;
        }
      }
      setEditingImage(null);
      setFormData({ url: '', image_description: '', is_public: false, is_common_use: false });
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchImages();
    } catch (err) {
      alert('Error saving image: ' + (err as any).message);
    } finally {
      setLoading(false);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      await deleteRecord('images', id, '/admin/images');
      fetchImages();
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
          {editingImage ? 'Edit Image' : 'Add / Upload New Image'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!editingImage && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-700">Upload File (Optional)</label>
              <input
                type="file"
                ref={fileInputRef}
                className="w-full mt-1 px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none"
                accept="image/*"
              />
              <p className="text-xs text-zinc-400 mt-1">If you upload a file, the URL field below will be ignored.</p>
            </div>
          )}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-zinc-700">Image URL {editingImage ? '' : '(or use field above)'}</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full mt-1 px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none"
              placeholder="https://example.com/image.jpg"
              disabled={!!editingImage && !!formData.url && !formData.url.includes('admin-uploads')}
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
              className="bg-zinc-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : editingImage ? 'Update Image' : 'Create Image'}
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
