import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Laptop, Monitor, Keyboard, Loader2, RefreshCw, Package, AlertTriangle, XCircle, LayoutGrid, LayoutList, ArrowUpDown, ArrowDown, ArrowUp, Image as ImageIcon, Check, X } from "lucide-react";
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
import { useProducts, useUpdateProduct, useDeleteProduct, useAddProduct, type Product } from "@/hooks/useN8nData";
import { ProductEditDialog } from "./ProductEditDialog";
import { ProductDeleteDialog } from "./ProductDeleteDialog";
import { ProductAddDialog } from "./ProductAddDialog";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

type ViewMode = 'table' | 'grid';
type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc';
type StatusFilter = 'all' | 'active' | 'low_stock' | 'out_of_stock';

export function ProductsPanel() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingStockValue, setEditingStockValue] = useState<string>("");
  
  const { data: products = [], isLoading, error, refetch } = useProducts();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const addMutation = useAddProduct();

  const handleEdit = (product: Product) => {
    setEditProduct(product);
  };

  const handleSaveEdit = (updatedProduct: Product) => {
    updateMutation.mutate(updatedProduct, {
      onSuccess: () => {
        toast.success("Product updated successfully!");
        setEditProduct(null);
        refetch();
      },
      onError: (err) => {
        toast.error(`Failed to update product: ${err.message}`);
      },
    });
  };

  const handleDelete = (product: Product) => {
    setDeleteProduct(product);
  };

  const handleConfirmDelete = () => {
    if (deleteProduct) {
      deleteMutation.mutate(
        { id: deleteProduct.id, category: deleteProduct.category },
        {
          onSuccess: () => {
            toast.success("Product deleted successfully!");
            setDeleteProduct(null);
            refetch();
          },
          onError: (err) => {
            toast.error(`Failed to delete product: ${err.message}`);
          },
        }
      );
    }
  };

  const handleAddProduct = (newProduct: Omit<Product, 'id'>) => {
    addMutation.mutate(newProduct, {
      onSuccess: () => {
        toast.success("Product added successfully!");
        setShowAddDialog(false);
        refetch();
      },
      onError: (err) => {
        toast.error(`Failed to add product: ${err.message}`);
      },
    });
  };

  // Quick stock edit handlers
  const startEditingStock = (product: Product) => {
    setEditingStockId(product.id);
    setEditingStockValue(String(product.stock_quantity ?? 0));
  };

  const saveStockEdit = (product: Product) => {
    const newStock = parseInt(editingStockValue) || 0;
    updateMutation.mutate(
      { ...product, stock_quantity: newStock },
      {
        onSuccess: () => {
          toast.success("Stock updated!");
          setEditingStockId(null);
          refetch();
        },
        onError: (err) => {
          toast.error(`Failed to update stock: ${err.message}`);
        },
      }
    );
  };

  const cancelStockEdit = () => {
    setEditingStockId(null);
    setEditingStockValue("");
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(p => {
      const name = p.displayName || '';
      const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || p.category.toLowerCase() === categoryFilter.toLowerCase();
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc': return (a.displayName || '').localeCompare(b.displayName || '');
        case 'name-desc': return (b.displayName || '').localeCompare(a.displayName || '');
        case 'price-asc': return (a.price ?? 0) - (b.price ?? 0);
        case 'price-desc': return (b.price ?? 0) - (a.price ?? 0);
        case 'stock-asc': return (a.stock_quantity ?? 0) - (b.stock_quantity ?? 0);
        case 'stock-desc': return (b.stock_quantity ?? 0) - (a.stock_quantity ?? 0);
        default: return 0;
      }
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
          <Button 
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 glow-primary"
            onClick={() => setShowAddDialog(true)}
          >
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
              "glass-card p-5 flex items-center gap-4 animate-slide-up border cursor-pointer transition-all hover:scale-[1.02]",
              stat.bg,
              stat.label === "Low Stock" && statusFilter === "low_stock" && "ring-2 ring-warning",
              stat.label === "Out of Stock" && statusFilter === "out_of_stock" && "ring-2 ring-destructive"
            )}
            style={{ animationDelay: `${i * 100}ms` }}
            onClick={() => {
              if (stat.label === "Low Stock") {
                setStatusFilter(statusFilter === "low_stock" ? "all" : "low_stock");
              } else if (stat.label === "Out of Stock") {
                setStatusFilter(statusFilter === "out_of_stock" ? "all" : "out_of_stock");
              } else {
                setStatusFilter("all");
              }
            }}
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

      {/* Filters & View Toggle */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 flex-wrap flex-1">
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
            <SelectTrigger className="w-40 bg-secondary/30 border-border/50 h-11 rounded-xl">
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

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-36 bg-secondary/30 border-border/50 h-11 rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">
                <span className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-success" /> In Stock
                </span>
              </SelectItem>
              <SelectItem value="low_stock">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" /> Low Stock
                </span>
              </SelectItem>
              <SelectItem value="out_of_stock">
                <span className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-destructive" /> Out of Stock
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-40 bg-secondary/30 border-border/50 h-11 rounded-xl">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">
                <span className="flex items-center gap-2"><ArrowUp className="w-3 h-3" /> Name A-Z</span>
              </SelectItem>
              <SelectItem value="name-desc">
                <span className="flex items-center gap-2"><ArrowDown className="w-3 h-3" /> Name Z-A</span>
              </SelectItem>
              <SelectItem value="price-asc">
                <span className="flex items-center gap-2"><ArrowUp className="w-3 h-3" /> Price Low</span>
              </SelectItem>
              <SelectItem value="price-desc">
                <span className="flex items-center gap-2"><ArrowDown className="w-3 h-3" /> Price High</span>
              </SelectItem>
              <SelectItem value="stock-asc">
                <span className="flex items-center gap-2"><ArrowUp className="w-3 h-3" /> Stock Low</span>
              </SelectItem>
              <SelectItem value="stock-desc">
                <span className="flex items-center gap-2"><ArrowDown className="w-3 h-3" /> Stock High</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-secondary/30 rounded-xl">
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-9 w-9 rounded-lg"
            onClick={() => setViewMode('table')}
          >
            <LayoutList className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-9 w-9 rounded-lg"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {(statusFilter !== 'all' || categoryFilter !== 'all') && (
        <div className="flex flex-wrap gap-2 animate-fade-in">
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
              {statusConfig[statusFilter]?.label}
              <button onClick={() => setStatusFilter('all')} className="ml-2 hover:text-primary-foreground">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {categoryFilter !== 'all' && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 capitalize">
              {categoryFilter}
              <button onClick={() => setCategoryFilter('all')} className="ml-2 hover:text-primary-foreground">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

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

      {/* Grid View */}
      {!isLoading && !error && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full glass-card p-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {products.length === 0 
                  ? "No products found. Connect n8n webhooks to load data."
                  : "No products match your filters."}
              </p>
            </div>
          ) : (
            filteredProducts.map((product, i) => {
              const CategoryIcon = categoryIcons[product.category] || Package;
              const status = statusConfig[product.status] || statusConfig.active;
              const StatusIcon = status.icon;
              
              return (
                <Card 
                  key={product.id}
                  className="glass-card overflow-hidden group hover:border-primary/30 transition-all animate-fade-in"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {/* Product Image */}
                  <div className="aspect-square relative bg-gradient-to-br from-secondary/50 to-secondary/20 overflow-hidden">
                    {product.image_url_1 ? (
                      <img 
                        src={product.image_url_1} 
                        alt={product.displayName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={cn(
                      "absolute inset-0 flex items-center justify-center",
                      product.image_url_1 ? "hidden" : ""
                    )}>
                      <CategoryIcon className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                    
                    {/* Status Badge */}
                    <Badge 
                      variant="outline" 
                      className={cn("absolute top-3 left-3 gap-1", status.class)}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </Badge>

                    {/* Category Badge */}
                    <Badge variant="secondary" className="absolute top-3 right-3 capitalize bg-background/80 backdrop-blur-sm">
                      {product.category}
                    </Badge>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate mb-2">{product.displayName}</h3>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-accent">
                        {product.price != null ? `₹${product.price.toLocaleString()}` : '—'}
                      </span>
                      
                      {/* Quick Stock Edit */}
                      {product.category !== 'accessories' && (
                        editingStockId === product.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={editingStockValue}
                              onChange={(e) => setEditingStockValue(e.target.value)}
                              className="w-16 h-7 text-xs bg-secondary/50"
                              autoFocus
                            />
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => saveStockEdit(product)}>
                              <Check className="w-3 h-3 text-success" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={cancelStockEdit}>
                              <X className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => startEditingStock(product)}
                            className={cn(
                              "text-sm font-medium px-2 py-1 rounded-lg hover:bg-secondary/50 transition-colors",
                              product.stock_quantity === 0 && "text-destructive",
                              product.stock_quantity && product.stock_quantity <= 3 && "text-warning",
                              product.stock_quantity && product.stock_quantity > 3 && "text-foreground"
                            )}
                          >
                            Stock: {product.stock_quantity ?? 0}
                          </button>
                        )
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(product)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Table View */}
      {!isLoading && !error && viewMode === 'table' && (
        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground font-semibold w-16">Image</TableHead>
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
                  <TableCell colSpan={7} className="text-center py-12">
                    <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {products.length === 0 
                        ? "No products found. Connect n8n webhooks to load data."
                        : "No products match your filters."}
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
                      {/* Product Image */}
                      <TableCell>
                        <Avatar className="h-10 w-10 rounded-lg">
                          <AvatarImage 
                            src={product.image_url_1 || ''} 
                            alt={product.displayName}
                            className="object-cover"
                          />
                          <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                            <CategoryIcon className="w-5 h-5 text-primary" />
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{product.displayName}</span>
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
                        {product.category !== 'accessories' && editingStockId === product.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={editingStockValue}
                              onChange={(e) => setEditingStockValue(e.target.value)}
                              className="w-16 h-7 text-xs bg-secondary/50"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveStockEdit(product);
                                if (e.key === 'Escape') cancelStockEdit();
                              }}
                            />
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => saveStockEdit(product)}>
                              <Check className="w-3 h-3 text-success" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={cancelStockEdit}>
                              <X className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => product.category !== 'accessories' && startEditingStock(product)}
                            className={cn(
                              "font-medium px-2 py-1 rounded-lg transition-colors",
                              product.category !== 'accessories' && "hover:bg-secondary/50 cursor-pointer",
                              product.stock_quantity === 0 && "text-destructive",
                              product.stock_quantity && product.stock_quantity <= 3 && "text-warning",
                              product.stock_quantity && product.stock_quantity > 3 && "text-foreground"
                            )}
                            disabled={product.category === 'accessories'}
                          >
                            {product.stock_quantity ?? "—"}
                          </button>
                        )}
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
                            onClick={() => handleEdit(product)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg"
                            onClick={() => handleDelete(product)}
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

      {/* Results count */}
      {!isLoading && !error && (
        <p className="text-sm text-muted-foreground text-center">
          Showing {filteredProducts.length} of {products.length} products
        </p>
      )}

      {/* Edit Dialog */}
      <ProductEditDialog
        product={editProduct}
        open={!!editProduct}
        onOpenChange={(open) => !open && setEditProduct(null)}
        onSave={handleSaveEdit}
        isLoading={updateMutation.isPending}
      />

      {/* Delete Dialog */}
      <ProductDeleteDialog
        product={deleteProduct}
        open={!!deleteProduct}
        onOpenChange={(open) => !open && setDeleteProduct(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />

      {/* Add Dialog */}
      <ProductAddDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={handleAddProduct}
        isLoading={addMutation.isPending}
      />
    </div>
  );
}