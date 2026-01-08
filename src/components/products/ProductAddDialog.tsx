import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";

interface ProductAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: {
    name: string;
    category: string;
    price: number | null;
    stock: number | null;
    status: string;
    imageUrl?: string;
  }) => void;
  isLoading?: boolean;
}

export function ProductAddDialog({ open, onOpenChange, onSave, isLoading }: ProductAddDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'laptops',
    price: '' as string | number,
    stock: '' as string | number,
    status: 'active',
    imageUrl: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'laptops',
      price: '',
      stock: '',
      status: 'active',
      imageUrl: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.category) {
      onSave({
        name: formData.name,
        category: formData.category,
        price: formData.price !== '' ? Number(formData.price) : null,
        stock: formData.stock !== '' ? Number(formData.stock) : null,
        status: formData.status,
        imageUrl: formData.imageUrl || undefined,
      });
      resetForm();
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] glass-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add New Product
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="add-name" className="text-sm font-medium">Product Name <span className="text-destructive">*</span></Label>
            <Input
              id="add-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-secondary/30 border-border/50"
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="add-category" className="text-sm font-medium">Category <span className="text-destructive">*</span></Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-secondary/30 border-border/50">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="laptops">Laptops</SelectItem>
                  <SelectItem value="desktops">Desktops</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-status" className="text-sm font-medium">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="bg-secondary/30 border-border/50">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="add-price" className="text-sm font-medium">Price (₹)</Label>
              <Input
                id="add-price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="bg-secondary/30 border-border/50"
                placeholder="Enter price"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-stock" className="text-sm font-medium">Stock Quantity</Label>
              <Input
                id="add-stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="bg-secondary/30 border-border/50"
                placeholder="Enter stock"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-imageUrl" className="text-sm font-medium">Image URL</Label>
            <Input
              id="add-imageUrl"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="bg-secondary/30 border-border/50"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className="border-border/50">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.name}
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
