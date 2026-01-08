import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useProductImageUpload() {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File, productName: string): Promise<string | null> => {
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
      // Sanitize product name for file path
      const sanitizedName = productName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const timestamp = Date.now();
      const fileName = `${sanitizedName}-${timestamp}.jpg`;
      const filePath = `products/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      toast.success('Image uploaded successfully');
      return publicUrl;
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
