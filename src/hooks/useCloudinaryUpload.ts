import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useCloudinaryUpload() {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File, filename?: string): Promise<string | null> => {
    // Validate file type - only JPG allowed
    if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
      toast.error('Only JPG/JPEG images are allowed');
      return null;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return null;
    }

    setUploading(true);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const sanitizedFilename = filename 
        ? filename.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
        : `image-${Date.now()}`;

      const { data, error } = await supabase.functions.invoke('cloudinary-upload', {
        body: {
          action: 'upload',
          image: base64,
          filename: sanitizedFilename,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast.success('Image uploaded successfully');
      return data.url;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading };
}
