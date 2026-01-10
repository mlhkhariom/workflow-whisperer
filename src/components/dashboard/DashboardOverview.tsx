import { MessageSquare, Users, Package, TrendingUp, Activity, Clock, ArrowUpRight, PieChart as PieChartIcon, BarChart3 } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { InventoryPieChart } from "./InventoryPieChart";
import { StockBarChart } from "./StockBarChart";
import { ChatStatsCard } from "./ChatStatsCard";
import { useProducts } from "@/hooks/useN8nData";
import { useChats } from "@/hooks/useN8nData";

export function DashboardOverview() {
  const { data: products = [] } = useProducts();
  const { data: contacts = [] } = useChats();

  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.status === "low_stock").length;
  const outOfStockCount = products.filter(p => p.status === "out_of_stock").length;
  const totalConversations = contacts.length;

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome back<span className="text-gradient">!</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Here's what's happening with your AI sales agent
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20">
          <Activity className="w-4 h-4 text-success" />
          <span className="text-sm font-medium text-success">All systems operational</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard
          title="Total Conversations"
          value={totalConversations}
          change="Live from n8n"
          icon={MessageSquare}
          variant="primary"
          trend="neutral"
        />
        <StatsCard
          title="Active Contacts"
          value={contacts.filter(c => c.unread > 0).length}
          change="With unread messages"
          icon={Users}
          variant="accent"
          trend="up"
        />
        <StatsCard
          title="Total Products"
          value={totalProducts}
          change={`${lowStockCount} low stock`}
          icon={Package}
          variant="success"
          trend={lowStockCount > 0 ? "down" : "up"}
        />
        <StatsCard
          title="Response Rate"
          value="94%"
          change="Avg 2.3s response"
          icon={TrendingUp}
          variant="warning"
          trend="up"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Distribution */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary" />
              Inventory Distribution
            </h3>
          </div>
          <InventoryPieChart />
        </div>

        {/* Stock Levels */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-warning" />
              Stock Levels
            </h3>
          </div>
          <StockBarChart />
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-success/10 border border-success/20">
              <p className="text-lg font-bold text-success">{products.filter(p => p.status === 'active').length}</p>
              <p className="text-[10px] text-muted-foreground">In Stock</p>
            </div>
            <div className="p-2 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-lg font-bold text-warning">{lowStockCount}</p>
              <p className="text-[10px] text-muted-foreground">Low Stock</p>
            </div>
            <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-lg font-bold text-destructive">{outOfStockCount}</p>
              <p className="text-[10px] text-muted-foreground">Out of Stock</p>
            </div>
          </div>
        </div>

        {/* Chat Analytics */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-accent" />
              Chat Analytics
            </h3>
          </div>
          <ChatStatsCard />
        </div>
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Activity
            </h3>
            <button className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              View all <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1">
            {contacts.slice(0, 5).map((contact, i) => (
              <div 
                key={contact.id} 
                className="flex items-center justify-between py-4 px-4 -mx-4 hover:bg-secondary/30 rounded-xl transition-colors cursor-pointer group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {contact.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm group-hover:text-primary transition-colors">
                      {contact.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {contact.lastMessage}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                  {contact.time}
                </span>
              </div>
            ))}
            {contacts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-1">Chats will appear here from n8n</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-accent" />
              Product Inventory
            </h3>
            <button className="text-sm text-accent hover:text-accent/80 transition-colors flex items-center gap-1">
              View all <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1">
            {products.slice(0, 5).map((product, i) => {
              const categoryColors = {
                laptops: "from-primary to-primary/50",
                desktops: "from-accent to-accent/50",
                accessories: "from-success to-success/50",
              };
              const color = categoryColors[product.category as keyof typeof categoryColors] || categoryColors.laptops;
              
              return (
                <div 
                  key={product.id}
                  className="flex items-center gap-4 py-4 px-4 -mx-4 hover:bg-secondary/30 rounded-xl transition-colors cursor-pointer group"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`w-1.5 h-12 rounded-full bg-gradient-to-b ${color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate group-hover:text-accent transition-colors">
                      {product.name || product.displayName}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-medium">
                      {product.price ? `₹${product.price.toLocaleString()}` : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Stock: {product.stock_quantity ?? '—'}
                    </p>
                  </div>
                </div>
              );
            })}
            {products.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No products loaded</p>
                <p className="text-xs mt-1">Products will appear here from n8n</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-2xl font-bold text-gradient">{totalProducts}</p>
              <p className="text-xs text-muted-foreground">Products in catalog</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div>
              <p className="text-2xl font-bold text-gradient">{totalConversations}</p>
              <p className="text-xs text-muted-foreground">Total conversations</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div>
              <p className="text-2xl font-bold text-gradient">{lowStockCount}</p>
              <p className="text-xs text-muted-foreground">Low stock alerts</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Syncing with n8n
          </div>
        </div>
      </div>
    </div>
  );
}