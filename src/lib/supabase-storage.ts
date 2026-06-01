import { cloudUrl, supabase } from '@/integrations/supabase/client';

export function getPublicUrl(bucket: string, path: string): string {
  return `${cloudUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export async function uploadFile(
  bucket: string,
  file: File,
  folder: string = ''
): Promise<string> {
  const ext = file.name.split('.').pop() || 'bin';
  const fileName = `${folder ? folder + '/' : ''}${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  return getPublicUrl(bucket, fileName);
}

export async function deleteFileByUrl(bucket: string, url: string): Promise<void> {
  // Extract path from public URL
  const prefix = `${cloudUrl}/storage/v1/object/public/${bucket}/`;
  if (!url.startsWith(prefix)) return;
  const path = url.slice(prefix.length);
  await supabase.storage.from(bucket).remove([path]);
}
