import { MessageSquare, Package, Radio, LayoutDashboard, Settings, Zap, ChevronLeft, ChevronRight, ImageIcon, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "chats", label: "Conversations", icon: MessageSquare },
  { id: "products", label: "Products", icon: Package },
  { id: "images", label: "Product Images", icon: ImageIcon },
  { id: "live", label: "Live Chat", icon: Radio },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [activeTab]);

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center glow-primary">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-foreground">AI LaptopWala</h1>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="h-9 w-9"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-50",
        // Desktop
        "hidden md:flex",
        collapsed ? "w-20" : "w-72"
      )}>
        {/* Logo */}
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center glow-primary shrink-0">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="animate-fade-in">
                <h1 className="font-bold text-lg text-foreground">AI LaptopWala</h1>
                <p className="text-xs text-muted-foreground">AdminPanel</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-2">
          <p className={cn(
            "text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4 transition-opacity",
            collapsed ? "opacity-0" : "opacity-100 px-4"
          )}>
            Menu
          </p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={cn(
                "nav-item w-full group relative",
                activeTab === item.id && "nav-item-active",
                collapsed && "justify-center px-3"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 shrink-0 transition-colors",
                activeTab === item.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )} />
              {!collapsed && (
                <span className="animate-fade-in">{item.label}</span>
              )}
              {item.id === "live" && (
                <span className={cn(
                  "status-online",
                  collapsed ? "absolute top-2 right-2" : "ml-auto"
                )} />
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-popover rounded-lg shadow-xl border border-border 
                              opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-sidebar-border space-y-3">
          <button className={cn(
            "nav-item w-full",
            collapsed && "justify-center px-3"
          )}>
            <Settings className="w-5 h-5 text-muted-foreground" />
            {!collapsed && <span>Settings</span>}
          </button>

          {!collapsed && (
            <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 animate-fade-in">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <p className="text-xs font-semibold text-primary">n8n Connected</p>
              </div>
              <p className="text-xs text-muted-foreground">Workflow: Active</p>
            </div>
          )}

          {/* Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center py-2 rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 mr-2" />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside className={cn(
        "md:hidden fixed top-14 left-0 bottom-0 w-72 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 z-50",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-auto">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4 px-4">
            Menu
          </p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={cn(
                "nav-item w-full group relative",
                activeTab === item.id && "nav-item-active"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 shrink-0 transition-colors",
                activeTab === item.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )} />
              <span>{item.label}</span>
              {item.id === "live" && (
                <span className="status-online ml-auto" />
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-sidebar-border space-y-3">
          <button className="nav-item w-full">
            <Settings className="w-5 h-5 text-muted-foreground" />
            <span>Settings</span>
          </button>

          <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <p className="text-xs font-semibold text-primary">n8n Connected</p>
            </div>
            <p className="text-xs text-muted-foreground">Workflow: Active</p>
          </div>
        </div>
      </aside>
    </>
  );
}
