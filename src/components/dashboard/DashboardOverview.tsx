import { MessageSquare, Users, Package, TrendingUp } from "lucide-react";
import { StatsCard } from "./StatsCard";

export function DashboardOverview() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your AI sales agent activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Conversations"
          value={156}
          change="+12% from last week"
          icon={MessageSquare}
          variant="primary"
        />
        <StatsCard
          title="Active Users"
          value={48}
          change="+5 new today"
          icon={Users}
          variant="success"
        />
        <StatsCard
          title="Products Shown"
          value={342}
          change="+28% conversion"
          icon={Package}
          variant="accent"
        />
        <StatsCard
          title="Response Rate"
          value="94%"
          change="Avg 2.3s response"
          icon={TrendingUp}
          variant="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-xl p-6">
          <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { user: "User #1234", action: "Asked about Gaming Laptops", time: "2 min ago" },
              { user: "User #5678", action: "Purchased Desktop PC", time: "15 min ago" },
              { user: "User #9012", action: "Viewed Accessories", time: "32 min ago" },
              { user: "User #3456", action: "Started new conversation", time: "1 hour ago" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                <div>
                  <p className="font-medium text-sm">{item.user}</p>
                  <p className="text-xs text-muted-foreground">{item.action}</p>
                </div>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6">
          <h3 className="font-semibold text-lg mb-4">Top Products</h3>
          <div className="space-y-4">
            {[
              { name: "Gaming Laptop Pro X", category: "Laptops", views: 89, color: "bg-primary" },
              { name: "Workstation Desktop", category: "Desktops", views: 67, color: "bg-accent" },
              { name: "Mechanical Keyboard", category: "Accessories", views: 54, color: "bg-success" },
              { name: "4K Gaming Monitor", category: "Accessories", views: 43, color: "bg-primary" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-2 h-12 rounded-full ${item.color}`} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                </div>
                <span className="text-sm font-mono text-muted-foreground">{item.views} views</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
