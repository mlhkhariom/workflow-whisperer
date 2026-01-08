import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Upload, Image, Loader2, Copy, Check, Trash2, Search, RefreshCw, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CloudinaryImage {
  name: string;
  url: string;
  public_id: string;
  created_at: string;
}

export function ProductImagesPanel() {
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [renameDialog, setRenameDialog] = useState<{ open: boolean; image: CloudinaryImage | null }>({ open: false, image: null });
  const [newFileName, setNewFileName] = useState("");
  const [renaming, setRenaming] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cloudinary-upload', {
        body: { action: 'list' },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setImages(data.images || []);
    } catch (error: any) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (file: File) => {
    if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
      toast.error('Only JPG/JPEG images are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
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

      const sanitizedName = file.name
        .toLowerCase()
        .replace(/\.(jpg|jpeg)$/i, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-');

      const { data, error } = await supabase.functions.invoke('cloudinary-upload', {
        body: {
          action: 'upload',
          image: base64,
          filename: `${sanitizedName}-${Date.now()}`,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast.success('Image uploaded successfully');
      fetchImages();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => handleUpload(file));
  };

  const handleDelete = async (public_id: string, name: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('cloudinary-upload', {
        body: { action: 'delete', public_id },
      });

      if (error) throw error;
      
      toast.success('Image deleted');
      setImages(prev => prev.filter(img => img.public_id !== public_id));
    } catch (error: any) {
      toast.error('Failed to delete image');
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast.success('URL copied to clipboard');
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      toast.error('Failed to copy URL');
    }
  };

  const openRenameDialog = (image: CloudinaryImage) => {
    setNewFileName(image.name);
    setRenameDialog({ open: true, image });
  };

  const handleRename = async () => {
    if (!renameDialog.image || !newFileName.trim()) return;

    const sanitizedName = newFileName
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!sanitizedName) {
      toast.error('Please enter a valid filename');
      return;
    }

    if (sanitizedName === renameDialog.image.name) {
      setRenameDialog({ open: false, image: null });
      return;
    }

    setRenaming(true);
    try {
      const { data, error } = await supabase.functions.invoke('cloudinary-upload', {
        body: {
          action: 'rename',
          from_public_id: renameDialog.image.public_id,
          to_public_id: `product-images/${sanitizedName}`,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast.success('Image renamed successfully');
      setRenameDialog({ open: false, image: null });
      fetchImages();
    } catch (error: any) {
      console.error('Rename error:', error);
      toast.error(error.message || 'Failed to rename image');
    } finally {
      setRenaming(false);
    }
  };

  const filteredImages = images.filter(img => 
    img.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Product Images</h1>
          <p className="text-sm text-muted-foreground">Upload & manage product images on Cloudinary</p>
        </div>
        <Button onClick={fetchImages} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Upload Zone */}
      <Card className="glass-card border-border/50">
        <CardContent className="p-6">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              dragOver 
                ? 'border-primary bg-primary/10' 
                : 'border-border/50 hover:border-primary/50 hover:bg-secondary/30'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".jpg,.jpeg,image/jpeg"
              className="hidden"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                files.forEach(file => handleUpload(file));
              }}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Uploading to Cloudinary...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Drag & Drop images here</p>
                  <p className="text-xs text-muted-foreground">or click to browse (JPG only, max 5MB)</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search images..."
          className="pl-10 bg-secondary/30 border-border/50"
        />
      </div>

      {/* Image Gallery */}
      <Card className="glass-card border-border/50 flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Image className="w-5 h-5" />
            Cloudinary Images ({filteredImages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-480px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No images uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredImages.map((image) => (
                  <div 
                    key={image.public_id}
                    className="group relative bg-secondary/30 rounded-xl overflow-hidden border border-border/30 hover:border-primary/50 transition-all"
                  >
                    <div className="aspect-square">
                      <img 
                        src={image.url} 
                        alt={image.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs"
                        onClick={() => copyToClipboard(image.url)}
                      >
                        {copiedUrl === image.url ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1" />
                            Copy URL
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full text-xs"
                        onClick={() => openRenameDialog(image)}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Rename
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full text-xs"
                        onClick={() => handleDelete(image.public_id, image.name)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>

                    {/* File name */}
                    <div className="p-2 bg-secondary/50">
                      <p className="text-xs text-muted-foreground truncate" title={image.name}>
                        {image.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* URL Format Info */}
      <Card className="glass-card border-border/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Copy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Cloudinary URL Format</p>
              <p className="text-xs text-muted-foreground mt-1 break-all font-mono bg-secondary/30 p-2 rounded">
                https://res.cloudinary.com/[cloud_name]/image/upload/product-images/[filename]
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rename Dialog */}
      <Dialog open={renameDialog.open} onOpenChange={(open) => !renaming && setRenameDialog({ open, image: open ? renameDialog.image : null })}>
        <DialogContent className="sm:max-w-[425px] glass-card border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-primary" />
              Rename Image
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {renameDialog.image && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                <img 
                  src={renameDialog.image.url} 
                  alt="Preview"
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Current name:</p>
                  <p className="text-sm font-medium truncate">{renameDialog.image.name}</p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="newFileName">New filename</Label>
              <Input
                id="newFileName"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Enter new filename"
                className="bg-secondary/30 border-border/50"
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              />
              <p className="text-xs text-muted-foreground">
                Only letters, numbers, hyphens and underscores allowed
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRenameDialog({ open: false, image: null })}
              disabled={renaming}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRename}
              disabled={renaming || !newFileName.trim()}
            >
              {renaming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Renaming...
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4 mr-2" />
                  Rename
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
