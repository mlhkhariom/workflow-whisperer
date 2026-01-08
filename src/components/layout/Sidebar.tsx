import { MessageSquare, Package, Radio, LayoutDashboard, Settings, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "chats", label: "Conversations", icon: MessageSquare },
  { id: "products", label: "Products", icon: Package },
  { id: "live", label: "Live Chat", icon: Radio },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
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
              <h1 className="font-bold text-lg text-foreground">TinoChat</h1>
              <p className="text-xs text-muted-foreground">AI Sales Agent</p>
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
            onClick={() => onTabChange(item.id)}
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
  );
}