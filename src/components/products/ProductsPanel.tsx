import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Laptop, Monitor, Keyboard, Loader2, RefreshCw, Package, AlertTriangle, XCircle } from "lucide-react";
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

const statusConfig: Record<string, { icon: typeof Package; class: string; label: string }> = {
  active: { 
    icon: Package, 
    class: "bg-success/10 text-success border-success/30 hover:bg-success/20",
    label: "In Stock"
  },
  low_stock: { 
    icon: AlertTriangle, 
    class: "bg-warning/10 text-warning border-warning/30 hover:bg-warning/20",
    label: "Low Stock"
  },
  out_of_stock: { 
    icon: XCircle, 
    class: "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20",
    label: "Out of Stock"
  },
};

export function ProductsPanel() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  const { data: products = [], isLoading, error, refetch } = useProducts();

  const filteredProducts = products.filter(p => {
    const name = p.name || '';
    const category = p.category || '';
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const stats = [
    { 
      label: "Total Products", 
      value: products.length, 
      icon: Package,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20"
    },
    { 
      label: "Low Stock", 
      value: products.filter(p => p.status === "low_stock").length, 
      icon: AlertTriangle,
      color: "text-warning",
      bg: "bg-warning/10 border-warning/20"
    },
    { 
      label: "Out of Stock", 
      value: products.filter(p => p.status === "out_of_stock").length, 
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10 border-destructive/20"
    },
  ];

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Products<span className="text-gradient">.</span>
          </h1>
          <p className="text-muted-foreground mt-2">Manage your product catalog from n8n database</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => refetch()} 
            disabled={isLoading}
            className="border-border/50 hover:bg-secondary/50"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 glow-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div 
            key={stat.label}
            className={cn(
              "glass-card p-5 flex items-center gap-4 animate-slide-up border",
              stat.bg
            )}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className={cn("p-3 rounded-xl bg-card/50", stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className={cn("text-3xl font-bold", stat.color)}>{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 bg-secondary/30 border-border/50 h-11 rounded-xl focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48 bg-secondary/30 border-border/50 h-11 rounded-xl">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="laptops">
              <span className="flex items-center gap-2">
                <Laptop className="w-4 h-4" /> Laptops
              </span>
            </SelectItem>
            <SelectItem value="desktops">
              <span className="flex items-center gap-2">
                <Monitor className="w-4 h-4" /> Desktops
              </span>
            </SelectItem>
            <SelectItem value="accessories">
              <span className="flex items-center gap-2">
                <Keyboard className="w-4 h-4" /> Accessories
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error state */}
      {error && (
        <div className="glass-card p-8 text-center border border-destructive/20">
          <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-medium mb-2">Failed to load products</p>
          <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && !error && (
        <div className="glass-card p-12 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 glow-primary">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground">Loading products from n8n...</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && (
        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground font-semibold">Product</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Category</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Price</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Stock</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                <TableHead className="text-right text-muted-foreground font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {products.length === 0 
                        ? "No products found. Connect n8n webhooks to load data."
                        : "No products match your search."}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product, i) => {
                  const CategoryIcon = categoryIcons[product.category] || Package;
                  const status = statusConfig[product.status] || statusConfig.active;
                  const StatusIcon = status.icon;
                  
                  return (
                    <TableRow 
                      key={product.id} 
                      className="border-border/30 hover:bg-secondary/20 transition-colors animate-fade-in"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                            <CategoryIcon className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize bg-secondary/30 border-border/50">
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono font-medium">
                        {product.price == null ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <span className="text-accent">₹{product.price.toLocaleString()}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "font-medium",
                          product.stock === 0 && "text-destructive",
                          product.stock && product.stock <= 3 && "text-warning",
                          product.stock && product.stock > 3 && "text-foreground"
                        )}>
                          {product.stock ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn("gap-1.5 transition-colors", status.class)}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 hover:bg-primary/10 hover:text-primary rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg"
                          >
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