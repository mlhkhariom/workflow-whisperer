import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Laptop, Monitor, Keyboard, Loader2, RefreshCw, Package, AlertTriangle, XCircle, LayoutGrid, LayoutList, ArrowUpDown, ArrowDown, ArrowUp, Image as ImageIcon, Check, X, Filter, MoreVertical } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useProducts, useUpdateProduct, useDeleteProduct, useAddProduct, type Product } from "@/hooks/useN8nData";
import { ProductEditDialog } from "./ProductEditDialog";
import { ProductDeleteDialog } from "./ProductDeleteDialog";
import { ProductAddDialog } from "./ProductAddDialog";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingStockValue, setEditingStockValue] = useState<string>("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
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

  const statsData = {
    total: products.length,
    active: products.filter(p => p.status === "active").length,
    lowStock: products.filter(p => p.status === "low_stock").length,
    outOfStock: products.filter(p => p.status === "out_of_stock").length,
  };

  const stats = [
    { 
      label: "Total", 
      value: statsData.total, 
      icon: Package,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
      activeBg: "ring-primary",
      filter: "all" as StatusFilter
    },
    { 
      label: "In Stock", 
      value: statsData.active, 
      icon: Package,
      color: "text-success",
      bg: "bg-success/10 border-success/20",
      activeBg: "ring-success",
      filter: "active" as StatusFilter
    },
    { 
      label: "Low Stock", 
      value: statsData.lowStock, 
      icon: AlertTriangle,
      color: "text-warning",
      bg: "bg-warning/10 border-warning/20",
      activeBg: "ring-warning",
      filter: "low_stock" as StatusFilter
    },
    { 
      label: "Out", 
      value: statsData.outOfStock, 
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10 border-destructive/20",
      activeBg: "ring-destructive",
      filter: "out_of_stock" as StatusFilter
    },
  ];

  const activeFiltersCount = [
    statusFilter !== 'all',
    categoryFilter !== 'all',
  ].filter(Boolean).length;

  // Handle filter changes with mobile sheet auto-close
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setMobileFiltersOpen(false);
  };

  const handleStatusChange = (value: StatusFilter) => {
    setStatusFilter(value);
    setMobileFiltersOpen(false);
  };

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    setMobileFiltersOpen(false);
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setMobileFiltersOpen(false);
  };

  const FiltersContent = ({ closeOnChange = false }: { closeOnChange?: boolean }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select 
          value={categoryFilter} 
          onValueChange={closeOnChange ? handleCategoryChange : setCategoryFilter}
        >
          <SelectTrigger className="w-full bg-secondary/30 border-border/50">
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

      <div className="space-y-2">
        <label className="text-sm font-medium">Status</label>
        <Select 
          value={statusFilter} 
          onValueChange={(v) => closeOnChange ? handleStatusChange(v as StatusFilter) : setStatusFilter(v as StatusFilter)}
        >
          <SelectTrigger className="w-full bg-secondary/30 border-border/50">
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
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Sort By</label>
        <Select 
          value={sortBy} 
          onValueChange={(v) => closeOnChange ? handleSortChange(v as SortOption) : setSortBy(v as SortOption)}
        >
          <SelectTrigger className="w-full bg-secondary/30 border-border/50">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name A-Z</SelectItem>
            <SelectItem value="name-desc">Name Z-A</SelectItem>
            <SelectItem value="price-asc">Price Low to High</SelectItem>
            <SelectItem value="price-desc">Price High to Low</SelectItem>
            <SelectItem value="stock-asc">Stock Low to High</SelectItem>
            <SelectItem value="stock-desc">Stock High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(statusFilter !== 'all' || categoryFilter !== 'all') && (
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleClearFilters}
        >
          <X className="w-4 h-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Products<span className="text-gradient">.</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage your product catalog</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetch()} 
            disabled={isLoading}
            className="border-border/50 hover:bg-secondary/50"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            <span className="hidden sm:inline ml-2">Refresh</span>
          </Button>
          <Button 
            size="sm"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 glow-primary"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="w-4 h-4" />
            <span className="ml-1 sm:ml-2">Add</span>
            <span className="hidden sm:inline ml-1">Product</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards - Horizontal scrollable on mobile */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4">
        {stats.map((stat, i) => {
          const isActive = statusFilter === stat.filter;
          return (
            <button 
              key={stat.label}
              className={cn(
                "glass-card p-3 sm:p-4 flex items-center gap-3 min-w-[110px] sm:min-w-0 animate-slide-up border cursor-pointer transition-all hover:scale-[1.02] shrink-0 sm:shrink",
                stat.bg,
                isActive && `ring-2 ring-offset-2 ring-offset-background ${stat.activeBg}`
              )}
              style={{ animationDelay: `${i * 80}ms` }}
              onClick={() => setStatusFilter(isActive && stat.filter !== 'all' ? 'all' : stat.filter)}
            >
              <div className={cn("p-2 rounded-xl bg-card/50", stat.color)}>
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="text-left">
                <p className={cn("text-xl sm:text-2xl font-bold", stat.color)}>{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">{stat.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary/30 border-border/50 h-10 sm:h-11 rounded-xl focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Desktop Filters */}
        <div className="hidden lg:flex gap-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40 bg-secondary/30 border-border/50 h-11 rounded-xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="laptops">Laptops</SelectItem>
              <SelectItem value="desktops">Desktops</SelectItem>
              <SelectItem value="accessories">Accessories</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-36 bg-secondary/30 border-border/50 h-11 rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">In Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-40 bg-secondary/30 border-border/50 h-11 rounded-xl">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="price-asc">Price Low</SelectItem>
              <SelectItem value="price-desc">Price High</SelectItem>
              <SelectItem value="stock-asc">Stock Low</SelectItem>
              <SelectItem value="stock-desc">Stock High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mobile Filter Sheet */}
        <div className="flex gap-2 lg:hidden">
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10 relative">
                <Filter className="w-4 h-4" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Filters & Sort</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FiltersContent closeOnChange={true} />
              </div>
            </SheetContent>
          </Sheet>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-secondary/30 rounded-xl">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => setViewMode('table')}
            >
              <LayoutList className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Desktop View Toggle */}
        <div className="hidden lg:flex items-center gap-1 p-1 bg-secondary/30 rounded-xl">
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
        <div className="flex flex-wrap items-center gap-2 animate-fade-in">
          <span className="text-xs text-muted-foreground">Filters:</span>
          {statusFilter !== 'all' && (
            <Badge 
              variant="secondary" 
              className={cn(
                "border cursor-pointer",
                statusFilter === 'active' && "bg-success/10 text-success border-success/30",
                statusFilter === 'low_stock' && "bg-warning/10 text-warning border-warning/30",
                statusFilter === 'out_of_stock' && "bg-destructive/10 text-destructive border-destructive/30"
              )}
            >
              {statusConfig[statusFilter]?.label || 'In Stock'}
              <button onClick={() => setStatusFilter('all')} className="ml-2 opacity-60 hover:opacity-100">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {categoryFilter !== 'all' && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 capitalize">
              {categoryFilter}
              <button onClick={() => setCategoryFilter('all')} className="ml-2 opacity-60 hover:opacity-100">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => { setStatusFilter('all'); setCategoryFilter('all'); }}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="glass-card p-6 sm:p-8 text-center border border-destructive/20">
          <XCircle className="w-10 h-10 sm:w-12 sm:h-12 text-destructive mx-auto mb-4" />
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
        <div className="glass-card p-8 sm:p-12 flex flex-col items-center justify-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 glow-primary">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">Loading products...</p>
        </div>
      )}

      {/* Grid View */}
      {!isLoading && !error && viewMode === 'grid' && (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full glass-card p-8 sm:p-12 text-center">
              <Package className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/30 mx-auto mb-4" />
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
              
              const cardStatusClass = product.status === 'out_of_stock' 
                ? 'border-destructive/50 bg-destructive/5' 
                : product.status === 'low_stock' 
                  ? 'border-warning/50 bg-warning/5' 
                  : '';
              
              return (
                <Card 
                  key={product.id}
                  className={cn(
                    "glass-card overflow-hidden group hover:border-primary/30 transition-all animate-fade-in",
                    cardStatusClass
                  )}
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
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <CategoryIcon className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/20" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge className={cn("text-xs border", status.class)}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        <span className="hidden xs:inline">{status.label}</span>
                      </Badge>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm capitalize text-xs">
                        <CategoryIcon className="w-3 h-3 mr-1" />
                        <span className="hidden xs:inline">{product.category}</span>
                      </Badge>
                    </div>

                    {/* Quick Actions - Desktop hover */}
                    <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleEdit(product)}>
                        <Edit2 className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(product)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm sm:text-base truncate" title={product.displayName}>
                          {product.displayName || 'Unnamed Product'}
                        </h3>
                        {product.processor && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {product.processor} {product.generation && `• ${product.generation}`}
                          </p>
                        )}
                      </div>
                      
                      {/* Mobile Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 sm:hidden shrink-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(product)}>
                            <Edit2 className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(product)} className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                      <div>
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="font-bold text-primary text-sm sm:text-base">
                          {product.price_range || (product.price ? `₹${product.price.toLocaleString()}` : 'N/A')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Stock</p>
                        {editingStockId === product.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={editingStockValue}
                              onChange={(e) => setEditingStockValue(e.target.value)}
                              className="w-16 h-7 text-xs p-1"
                              autoFocus
                            />
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => saveStockEdit(product)}>
                              <Check className="w-3 h-3 text-success" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={cancelStockEdit}>
                              <X className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                        ) : (
                          <button 
                            className="font-bold text-sm sm:text-base hover:text-primary transition-colors"
                            onClick={() => startEditingStock(product)}
                            title="Click to edit"
                          >
                            {product.stock_quantity ?? 'N/A'}
                          </button>
                        )}
                      </div>
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
        <Card className="glass-card border-border/50 overflow-hidden">
          <ScrollArea className="w-full">
            <div className="min-w-[700px]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-right w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        No products found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => {
                      const CategoryIcon = categoryIcons[product.category] || Package;
                      const status = statusConfig[product.status] || statusConfig.active;
                      const StatusIcon = status.icon;

                      return (
                        <TableRow key={product.id} className="hover:bg-secondary/30 border-border/30">
                          <TableCell>
                            <Avatar className="w-10 h-10 rounded-lg">
                              <AvatarImage src={product.image_url_1} alt={product.displayName} className="object-cover" />
                              <AvatarFallback className="rounded-lg bg-secondary">
                                <CategoryIcon className="w-5 h-5 text-muted-foreground" />
                              </AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium truncate max-w-[200px]">{product.displayName || 'Unnamed'}</p>
                              {product.processor && (
                                <p className="text-xs text-muted-foreground truncate">{product.processor}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline" className="capitalize">
                              <CategoryIcon className="w-3 h-3 mr-1" />
                              {product.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("text-xs border", status.class)}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-primary">
                            {product.price_range || (product.price ? `₹${product.price.toLocaleString()}` : 'N/A')}
                          </TableCell>
                          <TableCell className="text-center">
                            {editingStockId === product.id ? (
                              <div className="flex items-center justify-center gap-1">
                                <Input
                                  type="number"
                                  value={editingStockValue}
                                  onChange={(e) => setEditingStockValue(e.target.value)}
                                  className="w-16 h-7 text-xs text-center"
                                  autoFocus
                                />
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => saveStockEdit(product)}>
                                  <Check className="w-3 h-3 text-success" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={cancelStockEdit}>
                                  <X className="w-3 h-3 text-destructive" />
                                </Button>
                              </div>
                            ) : (
                              <button 
                                className="font-medium hover:text-primary transition-colors"
                                onClick={() => startEditingStock(product)}
                                title="Click to edit"
                              >
                                {product.stock_quantity ?? 'N/A'}
                              </button>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(product)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(product)}>
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
          </ScrollArea>
        </Card>
      )}

      {/* Dialogs */}
      <ProductEditDialog
        product={editProduct}
        open={!!editProduct}
        onOpenChange={(open) => !open && setEditProduct(null)}
        onSave={handleSaveEdit}
        isLoading={updateMutation.isPending}
      />

      <ProductDeleteDialog
        product={deleteProduct}
        open={!!deleteProduct}
        onOpenChange={(open) => !open && setDeleteProduct(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />

      <ProductAddDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={handleAddProduct}
        isLoading={addMutation.isPending}
      />
    </div>
  );
}
