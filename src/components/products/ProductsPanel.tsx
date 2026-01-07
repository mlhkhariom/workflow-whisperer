import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Laptop, Monitor, Keyboard } from "lucide-react";
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

interface Product {
  id: string;
  name: string;
  category: "laptops" | "desktops" | "accessories";
  price: number;
  stock: number;
  status: "active" | "low_stock" | "out_of_stock";
}

const mockProducts: Product[] = [
  { id: "1", name: "ASUS ROG Strix G16", category: "laptops", price: 1399, stock: 24, status: "active" },
  { id: "2", name: "Lenovo Legion 5 Pro", category: "laptops", price: 1499, stock: 18, status: "active" },
  { id: "3", name: "Dell XPS Desktop", category: "desktops", price: 1899, stock: 5, status: "low_stock" },
  { id: "4", name: "HP Omen 45L", category: "desktops", price: 2199, stock: 12, status: "active" },
  { id: "5", name: "Mechanical Keyboard RGB", category: "accessories", price: 149, stock: 0, status: "out_of_stock" },
  { id: "6", name: "4K Gaming Monitor 32\"", category: "accessories", price: 599, stock: 31, status: "active" },
  { id: "7", name: "MSI Raider GE78", category: "laptops", price: 2499, stock: 8, status: "active" },
  { id: "8", name: "Custom Gaming PC", category: "desktops", price: 2999, stock: 3, status: "low_stock" },
];

const categoryIcons = {
  laptops: Laptop,
  desktops: Monitor,
  accessories: Keyboard,
};

const statusStyles = {
  active: "bg-success/20 text-success border-success/30",
  low_stock: "bg-accent/20 text-accent border-accent/30",
  out_of_stock: "bg-destructive/20 text-destructive border-destructive/30",
};

export function ProductsPanel() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredProducts = mockProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product catalog</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 glow-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
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
          { label: "Total Products", value: mockProducts.length, color: "text-primary" },
          { label: "Low Stock", value: mockProducts.filter(p => p.status === "low_stock").length, color: "text-accent" },
          { label: "Out of Stock", value: mockProducts.filter(p => p.status === "out_of_stock").length, color: "text-destructive" },
        ].map((stat, i) => (
          <div key={i} className="glass-panel rounded-lg p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
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
            {filteredProducts.map((product) => {
              const CategoryIcon = categoryIcons[product.category];
              return (
                <TableRow key={product.id} className="border-border">
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="capitalize">{product.category}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">${product.price.toLocaleString()}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn("capitalize", statusStyles[product.status])}
                    >
                      {product.status.replace("_", " ")}
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
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
