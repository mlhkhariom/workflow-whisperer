import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Image, Upload } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProductImageUpload } from "@/hooks/useProductImageUpload";
import type { Product } from "@/hooks/useN8nData";

interface ProductAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: Partial<Product>) => void;
  isLoading?: boolean;
}

const defaultFormData = {
  category: 'laptops' as 'laptops' | 'desktops' | 'accessories',
  brand: '',
  model: '',
  name: '',
  processor: '',
  generation: '',
  ram_gb: null as number | null,
  ram_type: '',
  storage_type: '',
  storage_gb: null as number | null,
  screen_size: '',
  monitor_size: '',
  graphics: '',
  condition: 'Used',
  price_range: '',
  stock_quantity: null as number | null,
  special_feature: '',
  warranty_in_months: null as number | null,
  image_url_1: '',
  image_url_2: '',
};

export function ProductAddDialog({ open, onOpenChange, onSave, isLoading }: ProductAddDialogProps) {
  const [formData, setFormData] = useState(defaultFormData);
  const { uploadImage, uploading } = useProductImageUpload();
  const fileInput1Ref = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);

  const resetForm = () => setFormData(defaultFormData);

  const handleImageUpload = async (file: File, imageField: 'image_url_1' | 'image_url_2') => {
    const productName = formData.category === 'accessories' 
      ? formData.name 
      : `${formData.brand} ${formData.model}`.trim();
    
    if (!productName) {
      return;
    }

    const imageUrl = await uploadImage(file, `${productName}-${imageField === 'image_url_1' ? 'primary' : 'secondary'}`);
    if (imageUrl) {
      setFormData(prev => ({ ...prev, [imageField]: imageUrl }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hasName = formData.category === 'accessories' 
      ? formData.name 
      : (formData.brand || formData.model);
    
    if (hasName) {
      onSave({
        ...formData,
        displayName: formData.category === 'accessories' 
          ? formData.name 
          : `${formData.brand} ${formData.model}`.trim(),
        status: 'active',
        price: null,
      });
      resetForm();
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  const isLaptopOrDesktop = formData.category === 'laptops' || formData.category === 'desktops';
  const isAccessory = formData.category === 'accessories';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] glass-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add New Product
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Category <span className="text-destructive">*</span></Label>
              <Select 
                value={formData.category} 
                onValueChange={(value: 'laptops' | 'desktops' | 'accessories') => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-secondary/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="laptops">Laptops</SelectItem>
                  <SelectItem value="desktops">Desktops</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Basic Info */}
            {isLaptopOrDesktop && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Brand <span className="text-destructive">*</span></Label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="bg-secondary/30 border-border/50"
                    placeholder="e.g., Dell, HP, Lenovo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Model</Label>
                  <Input
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="bg-secondary/30 border-border/50"
                    placeholder="e.g., Latitude 5520"
                  />
                </div>
              </div>
            )}

            {isAccessory && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Accessory Name <span className="text-destructive">*</span></Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-secondary/30 border-border/50"
                  placeholder="e.g., Wireless Mouse"
                  required
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
                      value={formData.processor}
                      onChange={(e) => setFormData({ ...formData, processor: e.target.value })}
                      className="bg-secondary/30 border-border/50"
                      placeholder="e.g., Intel Core i5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Generation</Label>
                    <Input
                      value={formData.generation}
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
                      value={formData.category === 'laptops' ? formData.storage_type : formData.ram_type}
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
                      value={formData.category === 'laptops' ? formData.screen_size : formData.monitor_size}
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
                      value={formData.graphics}
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
                  value={formData.price_range}
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
                  value={formData.condition} 
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
                  value={formData.special_feature}
                  onChange={(e) => setFormData({ ...formData, special_feature: e.target.value })}
                  className="bg-secondary/30 border-border/50 min-h-[80px]"
                  placeholder="Backlit keyboard, Fingerprint reader..."
                />
              </div>
            )}

            {/* Image URLs & Upload */}
            <div className="space-y-4 p-4 rounded-xl bg-secondary/20 border border-border/30">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Image className="w-4 h-4" />
                Product Images (JPG only)
              </div>
              <div className="space-y-3">
                {/* Primary Image */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Primary Image</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.image_url_1}
                      onChange={(e) => setFormData({ ...formData, image_url_1: e.target.value })}
                      className="bg-secondary/30 border-border/50 flex-1"
                      placeholder="https://example.com/image1.jpg"
                    />
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
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={uploading || (!formData.brand && !formData.name)}
                      onClick={() => fileInput1Ref.current?.click()}
                      title={!formData.brand && !formData.name ? "Enter product name first" : "Upload JPG image"}
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                {/* Secondary Image */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Secondary Image</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.image_url_2}
                      onChange={(e) => setFormData({ ...formData, image_url_2: e.target.value })}
                      className="bg-secondary/30 border-border/50 flex-1"
                      placeholder="https://example.com/image2.jpg"
                    />
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
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={uploading || (!formData.brand && !formData.name)}
                      onClick={() => fileInput2Ref.current?.click()}
                      title={!formData.brand && !formData.name ? "Enter product name first" : "Upload JPG image"}
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              {formData.image_url_1 && (
                <div className="flex gap-2 mt-2">
                  <img 
                    src={formData.image_url_1} 
                    alt="Preview 1" 
                    className="w-16 h-16 rounded-lg object-cover border border-border/30"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                  {formData.image_url_2 && (
                    <img 
                      src={formData.image_url_2} 
                      alt="Preview 2" 
                      className="w-16 h-16 rounded-lg object-cover border border-border/30"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                </div>
              )}
            </div>
          </form>
        </ScrollArea>
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className="border-border/50">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || uploading || (isAccessory ? !formData.name : !formData.brand)}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
