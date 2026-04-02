'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Table } from '@/components/Table';
import { uploadImage, updateRecord, deleteRecord } from '@/lib/actions';
import { Image as ImageIcon, Upload, Trash2, Edit3, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-accent-2 mb-2">
          <ImageIcon className="w-5 h-5 fill-current" />
          <span className="text-xs font-black uppercase tracking-[0.3em]">Media Assets</span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-white uppercase">
          IMAGE<span className="text-white/20">RY</span>
        </h1>
      </div>

      {/* Form Section */}
      <div className="bg-white/[0.02] p-8 rounded-2xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-1/5 blur-[100px] -mr-32 -mt-32" />
        
        <h2 className="text-lg font-bold mb-8 flex items-center gap-3">
          {editingImage ? <Edit3 className="w-5 h-5 text-accent-1" /> : <Plus className="w-5 h-5 text-accent-1" />}
          {editingImage ? 'Modify Instance' : 'Register New Asset'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          {!editingImage && (
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Binary Upload</label>
              <div className="group relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="w-full cursor-pointer opacity-0 absolute inset-0 z-10 h-14"
                  accept="image/*"
                />
                <div className="flex items-center gap-4 px-6 h-14 bg-white/5 border border-white/10 rounded-xl group-hover:border-accent-1/50 transition-all">
                  <Upload className="w-5 h-5 text-white/20 group-hover:text-accent-1" />
                  <span className="text-sm text-white/40 group-hover:text-white/60">Choose local file or drop here...</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Remote Source URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-sm text-white outline-none focus:border-accent-1/50 focus:bg-white/[0.07] transition-all placeholder:text-white/10"
              placeholder="https://cdn.example.com/source-image.webp"
              disabled={!!editingImage && !!formData.url && !formData.url.includes('admin-uploads')}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Contextual Description</label>
            <textarea
              value={formData.image_description}
              onChange={(e) => setFormData({ ...formData, image_description: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-sm text-white outline-none focus:border-accent-1/50 focus:bg-white/[0.07] transition-all placeholder:text-white/10"
              rows={3}
              placeholder="Define visual elements, mood, and core subjects..."
            />
          </div>

          <div className="flex gap-8">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-white/10 rounded-full peer-checked:bg-accent-1 transition-colors" />
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
              </div>
              <span className="text-xs font-bold text-white/40 group-hover:text-white/60 transition-colors uppercase tracking-widest">Global Visibility</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.is_common_use}
                  onChange={(e) => setFormData({ ...formData, is_common_use: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-white/10 rounded-full peer-checked:bg-accent-2 transition-colors" />
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
              </div>
              <span className="text-xs font-bold text-white/40 group-hover:text-white/60 transition-colors uppercase tracking-widest">Common Library</span>
            </label>
          </div>

          <div className="col-span-2 flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-accent-1 text-navy-dark px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-accent-1/80 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : editingImage ? 'Commit Changes' : 'Initialize Asset'}
            </button>
            {editingImage && (
              <button
                type="button"
                onClick={() => {
                  setEditingImage(null);
                  setFormData({ url: '', image_description: '', is_public: false, is_common_use: false });
                }}
                className="bg-white/5 text-white/40 px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Abort
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 text-white/20">
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Registry View</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>
        
        <Table
          headers={['Media', 'Metadata', 'Attributes', 'Control']}
          rows={images.map(img => [
            <div key={img.id} className="relative group">
               <img src={img.url} className="w-20 h-20 object-cover rounded-2xl border border-white/10 group-hover:border-accent-1/50 transition-all shadow-xl" />
               <div className="absolute inset-0 bg-accent-1/20 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity pointer-events-none" />
            </div>,
            <div key={img.id} className="max-w-xs space-y-2">
              <p className="font-bold text-white leading-tight">{img.image_description || 'Untagged Asset'}</p>
              <p className="text-[10px] text-white/20 font-mono truncate lowercase">{img.url}</p>
            </div>,
            <div key={img.id} className="flex flex-col gap-2">
              <span className={cn(
                "text-[9px] font-black px-3 py-1 rounded-full w-fit uppercase tracking-widest border",
                img.is_public ? "bg-accent-1/10 text-accent-1 border-accent-1/20" : "bg-white/5 text-white/30 border-white/5"
              )}>
                {img.is_public ? 'Global' : 'Internal'}
              </span>
              {img.is_common_use && (
                <span className="text-[9px] font-black px-3 py-1 bg-accent-2/10 text-accent-2 border border-accent-2/20 rounded-full w-fit uppercase tracking-widest">
                  Library
                </span>
              )}
            </div>,
            <div key={img.id} className="flex gap-6">
              <button 
                onClick={() => handleEdit(img)}
                className="text-white/40 hover:text-accent-1 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
              <button 
                onClick={() => handleDelete(img.id)}
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
