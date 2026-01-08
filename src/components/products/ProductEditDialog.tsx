import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Upload, X, Cloud, Laptop, Monitor, Keyboard } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProductImageUpload } from "@/hooks/useProductImageUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Product } from "@/hooks/useN8nData";

interface ProductEditDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: Product) => void;
  isLoading?: boolean;
}

const categoryInfo = {
  laptops: { icon: Laptop, label: 'Laptop' },
  desktops: { icon: Monitor, label: 'Desktop' },
  accessories: { icon: Keyboard, label: 'Accessory' },
};

export function ProductEditDialog({ product, open, onOpenChange, onSave, isLoading }: ProductEditDialogProps) {
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [dragOver, setDragOver] = useState<'primary' | 'secondary' | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const { uploadImage, uploading } = useProductImageUpload();
  const fileInput1Ref = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setFormData({ ...product });
      setActiveTab('basic');
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
  const catInfo = formData.category ? categoryInfo[formData.category as keyof typeof categoryInfo] : null;
  const CategoryIcon = catInfo?.icon || Laptop;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[600px] max-h-[90vh] glass-card border-border/50 p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b border-border/30">
          <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
              {formData.image_url_1 ? (
                <img src={formData.image_url_1} alt="" className="w-full h-full object-cover" />
              ) : (
                <CategoryIcon className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span>Edit {catInfo?.label || 'Product'}</span>
              <p className="text-sm font-normal text-muted-foreground mt-0.5 truncate">
                {formData.displayName || 'Unnamed Product'}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[calc(90vh-180px)]">
            <div className="px-4 sm:px-6 py-4 space-y-5">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 h-9">
                  <TabsTrigger value="basic" className="text-xs sm:text-sm">Basic Info</TabsTrigger>
                  <TabsTrigger value="specs" className="text-xs sm:text-sm" disabled={isAccessory}>Specs</TabsTrigger>
                  <TabsTrigger value="images" className="text-xs sm:text-sm">Images</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  {/* Basic Info */}
                  {isLaptopOrDesktop && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm">Brand</Label>
                        <Input
                          value={formData.brand || ''}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                          className="bg-secondary/30 border-border/50 h-10"
                          placeholder="Dell, HP, Lenovo..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Model</Label>
                        <Input
                          value={formData.model || ''}
                          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                          className="bg-secondary/30 border-border/50 h-10"
                          placeholder="Latitude 5520"
                        />
                      </div>
                    </div>
                  )}

                  {isAccessory && (
                    <div className="space-y-2">
                      <Label className="text-sm">Accessory Name</Label>
                      <Input
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-secondary/30 border-border/50 h-10"
                        placeholder="Wireless Mouse"
                      />
                    </div>
                  )}

                  {/* Pricing & Stock */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm">Price Range (₹)</Label>
                      <Input
                        value={formData.price_range || ''}
                        onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                        className="bg-secondary/30 border-border/50 h-10"
                        placeholder="15000-20000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Stock</Label>
                      <Input
                        type="number"
                        value={formData.stock_quantity ?? ''}
                        onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value ? Number(e.target.value) : null })}
                        className="bg-secondary/30 border-border/50 h-10"
                        placeholder="10"
                      />
                    </div>
                    {isLaptopOrDesktop && (
                      <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label className="text-sm">Warranty (months)</Label>
                        <Input
                          type="number"
                          value={formData.warranty_in_months ?? ''}
                          onChange={(e) => setFormData({ ...formData, warranty_in_months: e.target.value ? Number(e.target.value) : null })}
                          className="bg-secondary/30 border-border/50 h-10"
                          placeholder="3"
                        />
                      </div>
                    )}
                  </div>

                  {/* Condition */}
                  {isLaptopOrDesktop && (
                    <div className="space-y-2">
                      <Label className="text-sm">Condition</Label>
                      <Select 
                        value={formData.condition || 'Used'} 
                        onValueChange={(value) => setFormData({ ...formData, condition: value })}
                      >
                        <SelectTrigger className="bg-secondary/30 border-border/50 h-10">
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
                </TabsContent>

                <TabsContent value="specs" className="space-y-4 mt-4">
                  {isLaptopOrDesktop && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm">Processor</Label>
                          <Input
                            value={formData.processor || ''}
                            onChange={(e) => setFormData({ ...formData, processor: e.target.value })}
                            className="bg-secondary/30 border-border/50 h-10"
                            placeholder="Intel Core i5"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Generation</Label>
                          <Input
                            value={formData.generation || ''}
                            onChange={(e) => setFormData({ ...formData, generation: e.target.value })}
                            className="bg-secondary/30 border-border/50 h-10"
                            placeholder="11th Gen"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm">RAM (GB)</Label>
                          <Input
                            type="number"
                            value={formData.ram_gb ?? ''}
                            onChange={(e) => setFormData({ ...formData, ram_gb: e.target.value ? Number(e.target.value) : null })}
                            className="bg-secondary/30 border-border/50 h-10"
                            placeholder="8"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Storage (GB)</Label>
                          <Input
                            type="number"
                            value={formData.storage_gb ?? ''}
                            onChange={(e) => setFormData({ ...formData, storage_gb: e.target.value ? Number(e.target.value) : null })}
                            className="bg-secondary/30 border-border/50 h-10"
                            placeholder="256"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Type</Label>
                          <Input
                            value={formData.category === 'laptops' ? (formData.storage_type || '') : (formData.ram_type || '')}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              ...(formData.category === 'laptops' 
                                ? { storage_type: e.target.value }
                                : { ram_type: e.target.value })
                            })}
                            className="bg-secondary/30 border-border/50 h-10"
                            placeholder="SSD / DDR4"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm">
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
                            className="bg-secondary/30 border-border/50 h-10"
                            placeholder="15.6 inch"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Graphics</Label>
                          <Input
                            value={formData.graphics || ''}
                            onChange={(e) => setFormData({ ...formData, graphics: e.target.value })}
                            className="bg-secondary/30 border-border/50 h-10"
                            placeholder="Intel UHD / NVIDIA"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Special Features</Label>
                        <Textarea
                          value={formData.special_feature || ''}
                          onChange={(e) => setFormData({ ...formData, special_feature: e.target.value })}
                          className="bg-secondary/30 border-border/50 min-h-[70px] resize-none"
                          placeholder="Backlit keyboard, Fingerprint reader..."
                        />
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="images" className="space-y-4 mt-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Cloud className="w-4 h-4 text-primary" />
                    Images upload to Cloudinary (JPG only)
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Primary Image */}
                    <div 
                      className={`relative border-2 border-dashed rounded-xl p-3 sm:p-4 text-center transition-all cursor-pointer ${
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
                            className="w-full aspect-square object-cover rounded-lg"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                          <button 
                            type="button"
                            className="absolute top-2 right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center"
                            onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, image_url_1: '' })); }}
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ) : (
                        <div className="py-6 sm:py-8">
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-xs font-medium">Primary Image</p>
                          <p className="text-xs text-muted-foreground">Drop or Click</p>
                        </div>
                      )}
                      {uploading && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-xl">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                      )}
                    </div>

                    {/* Secondary Image */}
                    <div 
                      className={`relative border-2 border-dashed rounded-xl p-3 sm:p-4 text-center transition-all cursor-pointer ${
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
                            className="w-full aspect-square object-cover rounded-lg"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                          <button 
                            type="button"
                            className="absolute top-2 right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center"
                            onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, image_url_2: '' })); }}
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ) : (
                        <div className="py-6 sm:py-8">
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-xs font-medium">Secondary</p>
                          <p className="text-xs text-muted-foreground">Optional</p>
                        </div>
                      )}
                      {uploading && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-xl">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* URL Input fallback */}
                  <div className="space-y-2 pt-3 border-t border-border/30">
                    <Label className="text-xs text-muted-foreground">Or paste image URL:</Label>
                    <div className="grid grid-cols-1 gap-2">
                      <Input
                        value={formData.image_url_1 || ''}
                        onChange={(e) => setFormData({ ...formData, image_url_1: e.target.value })}
                        className="bg-secondary/30 border-border/50 h-9 text-xs"
                        placeholder="Primary image URL"
                      />
                      <Input
                        value={formData.image_url_2 || ''}
                        onChange={(e) => setFormData({ ...formData, image_url_2: e.target.value })}
                        className="bg-secondary/30 border-border/50 h-9 text-xs"
                        placeholder="Secondary image URL (optional)"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>

          <DialogFooter className="px-4 sm:px-6 py-4 border-t border-border/30 bg-secondary/20">
            <div className="flex w-full gap-2 sm:gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || uploading}
                className="flex-1 sm:flex-none bg-gradient-to-r from-primary to-primary/80"
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
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
