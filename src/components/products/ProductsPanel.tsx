import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Laptop, Monitor, Keyboard, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useProducts, type Product } from "@/hooks/useN8nData";

const categoryIcons: Record<string, typeof Laptop> = {
  laptops: Laptop,
  desktops: Monitor,
  accessories: Keyboard,
};

const statusStyles: Record<string, string> = {
  active: "bg-success/20 text-success border-success/30",
  low_stock: "bg-accent/20 text-accent border-accent/30",
  out_of_stock: "bg-destructive/20 text-destructive border-destructive/30",
};

export function ProductsPanel() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  const { data: products = [], isLoading, error, refetch } = useProducts();

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product catalog (via n8n)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button className="bg-primary hover:bg-primary/90 glow-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-muted/50"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48 bg-muted/50">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="laptops">Laptops</SelectItem>
            <SelectItem value="desktops">Desktops</SelectItem>
            <SelectItem value="accessories">Accessories</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Products", value: products.length, color: "text-primary" },
          { label: "Low Stock", value: products.filter(p => p.status === "low_stock").length, color: "text-accent" },
          { label: "Out of Stock", value: products.filter(p => p.status === "out_of_stock").length, color: "text-destructive" },
        ].map((stat, i) => (
          <div key={i} className="glass-panel rounded-lg p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="glass-panel rounded-xl p-8 text-center">
          <p className="text-destructive mb-2">Failed to load products from n8n</p>
          <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && !error && (
        <div className="glass-panel rounded-xl p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary mr-3" />
          <span className="text-muted-foreground">Loading products from n8n...</span>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && (
        <div className="glass-panel rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {products.length === 0 
                      ? "No products found. Create n8n webhooks to populate data."
                      : "No products match your search."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const CategoryIcon = categoryIcons[product.category] || Laptop;
                  return (
                    <TableRow key={product.id} className="border-border">
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="capitalize">{product.category}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">${Number(product.price).toLocaleString()}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn("capitalize", statusStyles[product.status] || statusStyles.active)}
                        >
                          {product.status?.replace("_", " ") || "active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
