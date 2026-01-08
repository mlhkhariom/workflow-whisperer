import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Upload, Laptop, Monitor, Keyboard, X, Cloud, ChevronRight, ChevronLeft, Check, Package, ImageIcon, Settings } from "lucide-react";
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

const categoryInfo = {
  laptops: { icon: Laptop, label: 'Laptop', color: 'text-blue-400' },
  desktops: { icon: Monitor, label: 'Desktop', color: 'text-purple-400' },
  accessories: { icon: Keyboard, label: 'Accessory', color: 'text-green-400' },
};

type Step = 'category' | 'basic' | 'specs' | 'images';

export function ProductAddDialog({ open, onOpenChange, onSave, isLoading }: ProductAddDialogProps) {
  const [formData, setFormData] = useState(defaultFormData);
  const [dragOver, setDragOver] = useState<'primary' | 'secondary' | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('category');
  const { uploadImage, uploading } = useProductImageUpload();
  const fileInput1Ref = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);

  const isLaptopOrDesktop = formData.category === 'laptops' || formData.category === 'desktops';
  const isAccessory = formData.category === 'accessories';
  
  const steps: Step[] = isAccessory 
    ? ['category', 'basic', 'images'] 
    : ['category', 'basic', 'specs', 'images'];

  const stepLabels: Record<Step, { label: string; icon: React.ElementType }> = {
    category: { label: 'Category', icon: Package },
    basic: { label: 'Basic', icon: Settings },
    specs: { label: 'Specs', icon: Settings },
    images: { label: 'Images', icon: ImageIcon },
  };

  const currentStepIndex = steps.indexOf(currentStep);

  const resetForm = () => {
    setFormData(defaultFormData);
    setCurrentStep('category');
  };

  const handleImageUpload = async (file: File, imageField: 'image_url_1' | 'image_url_2') => {
    const productName = formData.category === 'accessories' 
      ? formData.name 
      : `${formData.brand} ${formData.model}`.trim();
    
    if (!productName) return;

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

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const goPrev = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const canProceed = () => {
    if (currentStep === 'category') return true;
    if (currentStep === 'basic') {
      return isAccessory ? !!formData.name : !!formData.brand;
    }
    return true;
  };

  const productName = formData.category === 'accessories' 
    ? formData.name 
    : `${formData.brand} ${formData.model}`.trim();

  const CategoryIcon = categoryInfo[formData.category].icon;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[500px] h-[85vh] sm:h-auto sm:max-h-[85vh] glass-card border-border/50 p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b border-border/30 shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-base font-semibold">Add Product</span>
              {productName && (
                <p className="text-xs text-muted-foreground truncate">{productName}</p>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="px-4 py-3 border-b border-border/20 shrink-0">
          <div className="flex items-center justify-between gap-1">
            {steps.map((step, index) => {
              const StepIcon = stepLabels[step].icon;
              const isActive = step === currentStep;
              const isCompleted = index < currentStepIndex;
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => index <= currentStepIndex && setCurrentStep(step)}
                  className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-primary/15 text-primary' 
                      : isCompleted 
                        ? 'text-primary/70 cursor-pointer hover:bg-secondary/50' 
                        : 'text-muted-foreground/50'
                  }`}
                  disabled={index > currentStepIndex}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-primary text-primary-foreground' : isCompleted ? 'bg-primary/30' : 'bg-secondary/50'
                  }`}>
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : <StepIcon className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-[10px] font-medium">{stepLabels[step].label}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <form id="product-form" onSubmit={handleSubmit} className="p-4 space-y-4">
            
            {/* Step: Category */}
            {currentStep === 'category' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Select product category</p>
                <div className="grid grid-cols-1 gap-3">
                  {(Object.keys(categoryInfo) as Array<keyof typeof categoryInfo>).map((cat) => {
                    const info = categoryInfo[cat];
                    const Icon = info.icon;
                    const isSelected = formData.category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({ ...defaultFormData, category: cat })}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border/50 hover:border-primary/50 bg-secondary/20'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelected ? 'bg-primary/20' : 'bg-secondary/50'}`}>
                          <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : info.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${isSelected ? 'text-primary' : ''}`}>{info.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {cat === 'laptops' && 'Portable computers'}
                            {cat === 'desktops' && 'Desktop systems'}
                            {cat === 'accessories' && 'Mice, keyboards, etc.'}
                          </p>
                        </div>
                        {isSelected && <Check className="w-5 h-5 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step: Basic Info */}
            {currentStep === 'basic' && (
              <div className="space-y-4">
                {isLaptopOrDesktop && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm">Brand <span className="text-destructive">*</span></Label>
                      <Input
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="bg-secondary/30 border-border/50 h-11"
                        placeholder="Dell, HP, Lenovo..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Model</Label>
                      <Input
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        className="bg-secondary/30 border-border/50 h-11"
                        placeholder="Latitude 5520, ThinkPad..."
                      />
                    </div>
                  </>
                )}

                {isAccessory && (
                  <div className="space-y-2">
                    <Label className="text-sm">Name <span className="text-destructive">*</span></Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-secondary/30 border-border/50 h-11"
                      placeholder="Wireless Mouse, Keyboard..."
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm">Price Range (₹)</Label>
                    <Input
                      value={formData.price_range}
                      onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                      className="bg-secondary/30 border-border/50 h-11"
                      placeholder="15000-20000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Stock Qty</Label>
                    <Input
                      type="number"
                      value={formData.stock_quantity ?? ''}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value ? Number(e.target.value) : null })}
                      className="bg-secondary/30 border-border/50 h-11"
                      placeholder="10"
                    />
                  </div>
                </div>

                {isLaptopOrDesktop && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm">Warranty (months)</Label>
                        <Input
                          type="number"
                          value={formData.warranty_in_months ?? ''}
                          onChange={(e) => setFormData({ ...formData, warranty_in_months: e.target.value ? Number(e.target.value) : null })}
                          className="bg-secondary/30 border-border/50 h-11"
                          placeholder="3"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Condition</Label>
                        <Select 
                          value={formData.condition} 
                          onValueChange={(value) => setFormData({ ...formData, condition: value })}
                        >
                          <SelectTrigger className="bg-secondary/30 border-border/50 h-11">
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
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step: Specs (Laptop/Desktop only) */}
            {currentStep === 'specs' && isLaptopOrDesktop && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm">Processor</Label>
                    <Input
                      value={formData.processor}
                      onChange={(e) => setFormData({ ...formData, processor: e.target.value })}
                      className="bg-secondary/30 border-border/50 h-11"
                      placeholder="Intel Core i5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Generation</Label>
                    <Input
                      value={formData.generation}
                      onChange={(e) => setFormData({ ...formData, generation: e.target.value })}
                      className="bg-secondary/30 border-border/50 h-11"
                      placeholder="11th Gen"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm">RAM</Label>
                    <Input
                      type="number"
                      value={formData.ram_gb ?? ''}
                      onChange={(e) => setFormData({ ...formData, ram_gb: e.target.value ? Number(e.target.value) : null })}
                      className="bg-secondary/30 border-border/50 h-11"
                      placeholder="8 GB"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Storage</Label>
                    <Input
                      type="number"
                      value={formData.storage_gb ?? ''}
                      onChange={(e) => setFormData({ ...formData, storage_gb: e.target.value ? Number(e.target.value) : null })}
                      className="bg-secondary/30 border-border/50 h-11"
                      placeholder="256 GB"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Type</Label>
                    <Input
                      value={formData.category === 'laptops' ? formData.storage_type : formData.ram_type}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        ...(formData.category === 'laptops' 
                          ? { storage_type: e.target.value }
                          : { ram_type: e.target.value })
                      })}
                      className="bg-secondary/30 border-border/50 h-11"
                      placeholder="SSD"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm">{formData.category === 'laptops' ? 'Screen' : 'Monitor'}</Label>
                    <Input
                      value={formData.category === 'laptops' ? formData.screen_size : formData.monitor_size}
                      onChange={(e) => setFormData({
                        ...formData,
                        ...(formData.category === 'laptops'
                          ? { screen_size: e.target.value }
                          : { monitor_size: e.target.value })
                      })}
                      className="bg-secondary/30 border-border/50 h-11"
                      placeholder='15.6"'
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Graphics</Label>
                    <Input
                      value={formData.graphics}
                      onChange={(e) => setFormData({ ...formData, graphics: e.target.value })}
                      className="bg-secondary/30 border-border/50 h-11"
                      placeholder="Intel UHD"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Special Features</Label>
                  <Textarea
                    value={formData.special_feature}
                    onChange={(e) => setFormData({ ...formData, special_feature: e.target.value })}
                    className="bg-secondary/30 border-border/50 min-h-[80px] resize-none"
                    placeholder="Backlit keyboard, Fingerprint..."
                  />
                </div>
              </div>
            )}

            {/* Step: Images */}
            {currentStep === 'images' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Cloud className="w-4 h-4 text-primary" />
                  <span>Cloudinary upload (JPG only)</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Primary Image */}
                  <div 
                    className={`relative aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                      dragOver === 'primary' 
                        ? 'border-primary bg-primary/10' 
                        : formData.image_url_1
                          ? 'border-primary/50 bg-primary/5'
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
                      <>
                        <img 
                          src={formData.image_url_1} 
                          alt="Primary" 
                          className="absolute inset-0 w-full h-full object-cover rounded-xl"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                        <button 
                          type="button"
                          className="absolute top-2 right-2 w-7 h-7 bg-destructive rounded-full flex items-center justify-center shadow-lg z-10"
                          onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, image_url_1: '' })); }}
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-xs font-medium">Primary</p>
                        <p className="text-[10px] text-muted-foreground">Required</p>
                      </>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-xl">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    )}
                  </div>

                  {/* Secondary Image */}
                  <div 
                    className={`relative aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                      dragOver === 'secondary' 
                        ? 'border-primary bg-primary/10' 
                        : formData.image_url_2
                          ? 'border-primary/50 bg-primary/5'
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
                      <>
                        <img 
                          src={formData.image_url_2} 
                          alt="Secondary" 
                          className="absolute inset-0 w-full h-full object-cover rounded-xl"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                        <button 
                          type="button"
                          className="absolute top-2 right-2 w-7 h-7 bg-destructive rounded-full flex items-center justify-center shadow-lg z-10"
                          onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, image_url_2: '' })); }}
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-xs font-medium">Secondary</p>
                        <p className="text-[10px] text-muted-foreground">Optional</p>
                      </>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-xl">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                </div>

                {/* URL Input fallback */}
                <div className="space-y-3 pt-3 border-t border-border/30">
                  <p className="text-xs text-muted-foreground">Or paste image URLs:</p>
                  <Input
                    value={formData.image_url_1}
                    onChange={(e) => setFormData({ ...formData, image_url_1: e.target.value })}
                    className="bg-secondary/30 border-border/50 h-10 text-sm"
                    placeholder="Primary image URL"
                  />
                  <Input
                    value={formData.image_url_2}
                    onChange={(e) => setFormData({ ...formData, image_url_2: e.target.value })}
                    className="bg-secondary/30 border-border/50 h-10 text-sm"
                    placeholder="Secondary image URL (optional)"
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border/30 bg-secondary/20 shrink-0">
          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={goPrev}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            )}
            
            <div className="flex-1" />
            
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            
            {currentStepIndex < steps.length - 1 ? (
              <Button 
                type="button"
                onClick={goNext}
                disabled={!canProceed()}
                className="gap-1 bg-primary hover:bg-primary/90"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                type="submit"
                form="product-form"
                disabled={isLoading || uploading || !productName}
                className="gap-2 bg-gradient-to-r from-primary to-primary/80"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>Add Product</span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
