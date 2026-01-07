import { MessageSquare, Package, Radio, LayoutDashboard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

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
  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center glow-primary">
            <MessageSquare className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">TinoChat</h1>
            <p className="text-xs text-muted-foreground">AI Sales Agent</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "nav-item w-full",
              activeTab === item.id && "nav-item-active"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
            {item.id === "live" && (
              <span className="ml-auto status-online" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button className="nav-item w-full">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
        <div className="mt-4 px-4 py-3 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-xs text-primary font-medium">n8n Connected</p>
          <p className="text-xs text-muted-foreground mt-1">Workflow: working</p>
        </div>
      </div>
    </aside>
  );
}
