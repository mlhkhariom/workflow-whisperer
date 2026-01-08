import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Image } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
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

  useEffect(() => {
    if (product) {
      setFormData({ ...product });
    }
  }, [product]);

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

            {/* Image URLs */}
            <div className="space-y-4 p-4 rounded-xl bg-secondary/20 border border-border/30">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Image className="w-4 h-4" />
                Image URLs
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Primary Image</Label>
                  <Input
                    value={formData.image_url_1 || ''}
                    onChange={(e) => setFormData({ ...formData, image_url_1: e.target.value })}
                    className="bg-secondary/30 border-border/50"
                    placeholder="https://example.com/image1.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Secondary Image</Label>
                  <Input
                    value={formData.image_url_2 || ''}
                    onChange={(e) => setFormData({ ...formData, image_url_2: e.target.value })}
                    className="bg-secondary/30 border-border/50"
                    placeholder="https://example.com/image2.jpg"
                  />
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
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border/50">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
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
