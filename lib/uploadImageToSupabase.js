import { supabase } from './supabase.js';

export async function uploadImageToSupabase(buffer, filename) {
  const { data, error } = await supabase.storage
    .from('coincarnation-images')
    .upload(filename, buffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (error) {
    console.error('❌ Supabase upload error:', error.message);
    throw error;
  }

  const { publicUrl } = supabase
    .storage
    .from('coincarnation-images')
    .getPublicUrl(filename).data;

  return publicUrl;
}
