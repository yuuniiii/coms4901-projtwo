'use server';

import { createClient } from '@/lib/supabaseServer';
import { revalidatePath } from 'next/cache';

export async function createRecord(table: string, data: any, path: string) {
  const supabase = await createClient();
  const { error } = await supabase.from(table).insert([data]);
  if (error) throw error;
  revalidatePath(path);
}

export async function updateRecord(table: string, id: string | number, data: any, path: string) {
  const supabase = await createClient();
  const { error } = await supabase.from(table).update(data).eq('id', id);
  if (error) throw error;
  revalidatePath(path);
}

export async function deleteRecord(table: string, id: string | number, path: string) {
  const supabase = await createClient();
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
  revalidatePath(path);
}

// Special action for Image Upload + Record Creation
export async function uploadImage(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get('file') as File;
  const description = formData.get('description') as string;
  const is_public = formData.get('is_public') === 'true';
  const is_common_use = formData.get('is_common_use') === 'true';

  if (!file) throw new Error('No file provided');

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `admin-uploads/${fileName}`;

  // Upload to 'images' bucket
  const { error: uploadError, data } = await supabase.storage
    .from('images')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // Get Public URL
  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);

  // Create database record
  const { error: dbError } = await supabase.from('images').insert([{
    url: publicUrl,
    image_description: description,
    is_public,
    is_common_use,
    modified_datetime_utc: new Date().toISOString()
  }]);

  if (dbError) throw dbError;

  revalidatePath('/admin/images');
}
