import { supabase } from './supabase';

/**
 * Uploads an image into the "photos" bucket under the signed-in user's own
 * folder (required by the storage RLS policies in supabase/schema.sql) and
 * returns its public URL, or null if the upload failed.
 */
export async function uploadPhoto(ownerId: string, folder: string, file: File): Promise<string | null> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${ownerId}/${folder}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('photos').upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) {
    console.error('[petos] uploadPhoto:', error.message);
    return null;
  }
  const { data } = supabase.storage.from('photos').getPublicUrl(path);
  return data.publicUrl;
}
