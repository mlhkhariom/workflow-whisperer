import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Upload, Image, Loader2, Copy, Check, Trash2, Search, RefreshCw, Pencil, Cloud, ExternalLink } from "lucide-react";
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
  const [selectedImage, setSelectedImage] = useState<CloudinaryImage | null>(null);
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
      setSelectedImage(null);
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
    <div className="h-full flex flex-col p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Cloud className="w-6 h-6 text-primary" />
            Product Images
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Upload & manage product images on Cloudinary</p>
        </div>
        <Button onClick={fetchImages} variant="outline" size="sm" className="w-full sm:w-auto">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="glass-card border-border/50 p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Image className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold">{images.length}</p>
              <p className="text-xs text-muted-foreground">Total Images</p>
            </div>
          </div>
        </Card>
        <Card className="glass-card border-border/50 p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Upload className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold">5MB</p>
              <p className="text-xs text-muted-foreground">Max Size</p>
            </div>
          </div>
        </Card>
        <Card className="glass-card border-border/50 p-3 sm:p-4 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Cloud className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold">JPG</p>
              <p className="text-xs text-muted-foreground">Format Only</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Upload Zone */}
      <Card className="glass-card border-border/50">
        <CardContent className="p-4 sm:p-6">
          <div
            className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
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
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-primary animate-spin" />
                </div>
                <p className="text-sm text-muted-foreground">Uploading to Cloudinary...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-medium">Drag & Drop images here</p>
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
      <Card className="glass-card border-border/50 flex-1 min-h-0">
        <CardHeader className="pb-3 px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Image className="w-5 h-5 text-primary" />
            Cloudinary Gallery
            <span className="ml-auto text-xs sm:text-sm font-normal text-muted-foreground bg-secondary/50 px-2 py-1 rounded-lg">
              {filteredImages.length} images
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <ScrollArea className="h-[calc(100vh-580px)] sm:h-[calc(100vh-520px)] md:h-[calc(100vh-480px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                  <Image className="w-8 h-8 opacity-50" />
                </div>
                <p className="font-medium">No images uploaded yet</p>
                <p className="text-xs mt-1">Upload your first product image above</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {filteredImages.map((image) => (
                  <div 
                    key={image.public_id}
                    className={`group relative bg-secondary/30 rounded-xl overflow-hidden border transition-all cursor-pointer ${
                      selectedImage?.public_id === image.public_id 
                        ? 'border-primary ring-2 ring-primary/30' 
                        : 'border-border/30 hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedImage(selectedImage?.public_id === image.public_id ? null : image)}
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
                    
                    {/* Overlay with actions - Desktop */}
                    <div className="absolute inset-0 bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex flex-col items-center justify-center gap-2 p-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs h-8"
                        onClick={(e) => { e.stopPropagation(); copyToClipboard(image.url); }}
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
                        className="w-full text-xs h-8"
                        onClick={(e) => { e.stopPropagation(); openRenameDialog(image); }}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Rename
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full text-xs h-8"
                        onClick={(e) => { e.stopPropagation(); handleDelete(image.public_id, image.name); }}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>

                    {/* Selection indicator */}
                    {selectedImage?.public_id === image.public_id && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center sm:hidden">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}

                    {/* File name */}
                    <div className="p-2 bg-secondary/70 backdrop-blur-sm">
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

      {/* Mobile Action Bar */}
      {selectedImage && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-xl border-t border-border animate-slide-up z-50">
          <div className="flex items-center gap-2 mb-3">
            <img src={selectedImage.url} alt="" className="w-10 h-10 rounded-lg object-cover" />
            <p className="text-sm font-medium truncate flex-1">{selectedImage.name}</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => copyToClipboard(selectedImage.url)}
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="flex-1"
              onClick={() => openRenameDialog(selectedImage)}
            >
              <Pencil className="w-4 h-4 mr-1" />
              Rename
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDelete(selectedImage.public_id, selectedImage.name)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* URL Format Info */}
      <Card className="glass-card border-border/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
              <ExternalLink className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium mb-1">Cloudinary URL Format</p>
              <div className="text-xs text-muted-foreground font-mono bg-secondary/50 p-2 sm:p-3 rounded-lg overflow-x-auto">
                <code className="break-all">https://res.cloudinary.com/[cloud]/image/upload/product-images/[file]</code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rename Dialog */}
      <Dialog open={renameDialog.open} onOpenChange={(open) => !renaming && setRenameDialog({ open, image: open ? renameDialog.image : null })}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[425px] glass-card border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-primary" />
              Rename Image
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {renameDialog.image && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
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
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setRenameDialog({ open: false, image: null })}
              disabled={renaming}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRename}
              disabled={renaming || !newFileName.trim()}
              className="w-full sm:w-auto"
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
