import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Image, Upload } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProductImageUpload } from "@/hooks/useProductImageUpload";
import type { Product } from "@/hooks/useN8nData";

interface ProductEditDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: Product) => void;
  isLoading?: boolean;
}

export function ProductEditDialog({ product, open, onOpenChange, onSave, isLoading }: ProductEditDialogProps) {
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [dragOver, setDragOver] = useState<'primary' | 'secondary' | null>(null);
  const { uploadImage, uploading } = useProductImageUpload();
  const fileInput1Ref = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setFormData({ ...product });
    }
  }, [product]);

  const handleImageUpload = async (file: File, imageField: 'image_url_1' | 'image_url_2') => {
    const productName = formData.category === 'accessories' 
      ? formData.name 
      : `${formData.brand || ''} ${formData.model || ''}`.trim();
    
    if (!productName) {
      return;
    }

    const imageUrl = await uploadImage(file, `${productName}-${imageField === 'image_url_1' ? 'primary' : 'secondary'}`);
    if (imageUrl) {
      setFormData(prev => ({ ...prev, [imageField]: imageUrl }));
    }
  };

  const handleDrop = (e: React.DragEvent, imageField: 'image_url_1' | 'image_url_2') => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/jpg')) {
      handleImageUpload(file, imageField);
    }
  };

  const handleDragOver = (e: React.DragEvent, field: 'primary' | 'secondary') => {
    e.preventDefault();
    setDragOver(field);
  };

  const handleDragLeave = () => setDragOver(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id && formData.category) {
      onSave(formData as Product);
    }
  };

  const isLaptopOrDesktop = formData.category === 'laptops' || formData.category === 'desktops';
  const isAccessory = formData.category === 'accessories';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] glass-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit {formData.category?.slice(0, -1)}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {/* Basic Info */}
            {isLaptopOrDesktop && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Brand</Label>
                  <Input
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="bg-secondary/30 border-border/50"
                    placeholder="e.g., Dell, HP, Lenovo"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Model</Label>
                  <Input
                    value={formData.model || ''}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="bg-secondary/30 border-border/50"
                    placeholder="e.g., Latitude 5520"
                  />
                </div>
              </div>
            )}

            {isAccessory && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Accessory Name</Label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-secondary/30 border-border/50"
                  placeholder="e.g., Wireless Mouse"
                />
              </div>
            )}

            {/* Specs - Only for Laptops/Desktops */}
            {isLaptopOrDesktop && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Processor</Label>
                    <Input
                      value={formData.processor || ''}
                      onChange={(e) => setFormData({ ...formData, processor: e.target.value })}
                      className="bg-secondary/30 border-border/50"
                      placeholder="e.g., Intel Core i5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Generation</Label>
                    <Input
                      value={formData.generation || ''}
                      onChange={(e) => setFormData({ ...formData, generation: e.target.value })}
                      className="bg-secondary/30 border-border/50"
                      placeholder="e.g., 11th Gen"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">RAM (GB)</Label>
                    <Input
                      type="number"
                      value={formData.ram_gb ?? ''}
                      onChange={(e) => setFormData({ ...formData, ram_gb: e.target.value ? Number(e.target.value) : null })}
                      className="bg-secondary/30 border-border/50"
                      placeholder="8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Storage (GB)</Label>
                    <Input
                      type="number"
                      value={formData.storage_gb ?? ''}
                      onChange={(e) => setFormData({ ...formData, storage_gb: e.target.value ? Number(e.target.value) : null })}
                      className="bg-secondary/30 border-border/50"
                      placeholder="256"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {formData.category === 'laptops' ? 'Storage Type' : 'RAM Type'}
                    </Label>
                    <Input
                      value={formData.category === 'laptops' ? (formData.storage_type || '') : (formData.ram_type || '')}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        ...(formData.category === 'laptops' 
                          ? { storage_type: e.target.value }
                          : { ram_type: e.target.value })
                      })}
                      className="bg-secondary/30 border-border/50"
                      placeholder="SSD / DDR4"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {formData.category === 'laptops' ? 'Screen Size' : 'Monitor Size'}
                    </Label>
                    <Input
                      value={formData.category === 'laptops' ? (formData.screen_size || '') : (formData.monitor_size || '')}
                      onChange={(e) => setFormData({
                        ...formData,
                        ...(formData.category === 'laptops'
                          ? { screen_size: e.target.value }
                          : { monitor_size: e.target.value })
                      })}
                      className="bg-secondary/30 border-border/50"
                      placeholder="15.6 inch"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Graphics</Label>
                    <Input
                      value={formData.graphics || ''}
                      onChange={(e) => setFormData({ ...formData, graphics: e.target.value })}
                      className="bg-secondary/30 border-border/50"
                      placeholder="Intel UHD / NVIDIA"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Pricing & Stock */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Price Range (₹)</Label>
                <Input
                  value={formData.price_range || ''}
                  onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                  className="bg-secondary/30 border-border/50"
                  placeholder="15000-20000"
                />
              </div>
              {isLaptopOrDesktop && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Stock Qty</Label>
                    <Input
                      type="number"
                      value={formData.stock_quantity ?? ''}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value ? Number(e.target.value) : null })}
                      className="bg-secondary/30 border-border/50"
                      placeholder="10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Warranty (months)</Label>
                    <Input
                      type="number"
                      value={formData.warranty_in_months ?? ''}
                      onChange={(e) => setFormData({ ...formData, warranty_in_months: e.target.value ? Number(e.target.value) : null })}
                      className="bg-secondary/30 border-border/50"
                      placeholder="3"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Condition - Only for Laptops/Desktops */}
            {isLaptopOrDesktop && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Condition</Label>
                <Select 
                  value={formData.condition || 'Used'} 
                  onValueChange={(value) => setFormData({ ...formData, condition: value })}
                >
                  <SelectTrigger className="bg-secondary/30 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Like New">Like New</SelectItem>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Used">Used</SelectItem>
                    <SelectItem value="Refurbished">Refurbished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Special Features */}
            {isLaptopOrDesktop && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Special Features</Label>
                <Textarea
                  value={formData.special_feature || ''}
                  onChange={(e) => setFormData({ ...formData, special_feature: e.target.value })}
                  className="bg-secondary/30 border-border/50 min-h-[80px]"
                  placeholder="Backlit keyboard, Fingerprint reader..."
                />
              </div>
            )}

            {/* Image URLs & Upload with Drag-Drop */}
            <div className="space-y-4 p-4 rounded-xl bg-secondary/20 border border-border/30">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Image className="w-4 h-4" />
                Product Images (JPG only - Drag & Drop supported)
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Primary Image Drop Zone */}
                <div 
                  className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
                    dragOver === 'primary' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border/50 hover:border-primary/50 hover:bg-secondary/30'
                  }`}
                  onDrop={(e) => handleDrop(e, 'image_url_1')}
                  onDragOver={(e) => handleDragOver(e, 'primary')}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInput1Ref.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInput1Ref}
                    accept=".jpg,.jpeg,image/jpeg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'image_url_1');
                    }}
                  />
                  {formData.image_url_1 ? (
                    <div className="space-y-2">
                      <img 
                        src={formData.image_url_1} 
                        alt="Primary" 
                        className="w-full h-24 object-cover rounded-lg"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                      <p className="text-xs text-muted-foreground truncate">{formData.image_url_1.split('/').pop()}</p>
                    </div>
                  ) : (
                    <div className="py-4">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground">Primary Image</p>
                      <p className="text-xs text-muted-foreground/60">Drop or Click</p>
                    </div>
                  )}
                  {uploading && dragOver === 'primary' && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-xl">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>

                {/* Secondary Image Drop Zone */}
                <div 
                  className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
                    dragOver === 'secondary' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border/50 hover:border-primary/50 hover:bg-secondary/30'
                  }`}
                  onDrop={(e) => handleDrop(e, 'image_url_2')}
                  onDragOver={(e) => handleDragOver(e, 'secondary')}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInput2Ref.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInput2Ref}
                    accept=".jpg,.jpeg,image/jpeg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'image_url_2');
                    }}
                  />
                  {formData.image_url_2 ? (
                    <div className="space-y-2">
                      <img 
                        src={formData.image_url_2} 
                        alt="Secondary" 
                        className="w-full h-24 object-cover rounded-lg"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                      <p className="text-xs text-muted-foreground truncate">{formData.image_url_2.split('/').pop()}</p>
                    </div>
                  ) : (
                    <div className="py-4">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground">Secondary Image</p>
                      <p className="text-xs text-muted-foreground/60">Drop or Click</p>
                    </div>
                  )}
                  {uploading && dragOver === 'secondary' && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-xl">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* URL Input fallback */}
              <div className="space-y-2 pt-2 border-t border-border/30">
                <Label className="text-xs text-muted-foreground">Or paste image URL directly:</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={formData.image_url_1 || ''}
                    onChange={(e) => setFormData({ ...formData, image_url_1: e.target.value })}
                    className="bg-secondary/30 border-border/50 text-xs"
                    placeholder="Primary image URL"
                  />
                  <Input
                    value={formData.image_url_2 || ''}
                    onChange={(e) => setFormData({ ...formData, image_url_2: e.target.value })}
                    className="bg-secondary/30 border-border/50 text-xs"
                    placeholder="Secondary image URL"
                  />
                </div>
              </div>
            </div>
          </form>
        </ScrollArea>
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border/50">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || uploading}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
