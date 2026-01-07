import { useState } from "react";
import { Search, Laptop, Monitor, Keyboard, Loader2, RefreshCw } from "lucide-react";
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
import { useProducts } from "@/hooks/useN8nData";
import { useQueryClient } from "@tanstack/react-query";

const categoryIcons: Record<string, React.ElementType> = {
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
  const { data: products = [], isLoading, error } = useProducts();
  const queryClient = useQueryClient();

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: products.length,
    lowStock: products.filter(p => p.status === "low_stock" || (p.stock > 0 && p.stock <= 5)).length,
    outOfStock: products.filter(p => p.status === "out_of_stock" || p.stock === 0).length,
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">View products from n8n database</p>
        </div>
        <Button 
          variant="outline"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["products"] })}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
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
          { label: "Total Products", value: stats.total, color: "text-primary" },
          { label: "Low Stock", value: stats.lowStock, color: "text-accent" },
          { label: "Out of Stock", value: stats.outOfStock, color: "text-destructive" },
        ].map((stat, i) => (
          <div key={i} className="glass-panel rounded-lg p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-12 text-muted-foreground">
            <div className="text-center">
              <p>Failed to load products from n8n</p>
              <p className="text-xs mt-1">Make sure your n8n API endpoints are set up</p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const CategoryIcon = categoryIcons[product.category] || Laptop;
                  const status = product.stock === 0 ? "out_of_stock" : product.stock <= 5 ? "low_stock" : "active";
                  return (
                    <TableRow key={product.id} className="border-border">
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="capitalize">{product.category}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        ${typeof product.price === 'number' ? product.price.toLocaleString() : product.price}
                      </TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn("capitalize", statusStyles[status] || statusStyles.active)}
                        >
                          {status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
