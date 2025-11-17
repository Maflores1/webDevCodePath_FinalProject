import { supabase } from '../supabaseClient';

export const uploadMedia = async (file, folder = 'posts') => {
  if (!file) return null;

  // Validate file type
  const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  
  const isImage = validImageTypes.includes(file.type);
  const isVideo = validVideoTypes.includes(file.type);
  
  if (!isImage && !isVideo) {
    throw new Error('Please upload a valid image (JPEG, PNG, GIF, WebP) or video (MP4, WebM, MOV)');
  }

  // Check file size (max 50MB for videos, 5MB for images)
  const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(`File too large. Max ${isVideo ? '50MB' : '5MB'}`);
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Math.random()}.${fileExt}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('post-media')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('post-media')
    .getPublicUrl(data.path);

  return {
    url: publicUrl,
    type: isVideo ? 'video' : 'image',
    path: data.path
  };
};

export const deleteMedia = async (path) => {
  if (!path) return;
  
  const { error } = await supabase.storage
    .from('post-media')
    .remove([path]);

  if (error) throw error;
};