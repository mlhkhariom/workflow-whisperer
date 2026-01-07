import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  variant?: "primary" | "accent" | "success";
}

export function StatsCard({ title, value, change, icon: Icon, variant = "primary" }: StatsCardProps) {
  const variantStyles = {
    primary: "from-primary/20 to-primary/5 border-primary/30",
    accent: "from-accent/20 to-accent/5 border-accent/30",
    success: "from-success/20 to-success/5 border-success/30",
  };

  const iconStyles = {
    primary: "text-primary",
    accent: "text-accent",
    success: "text-success",
  };

  return (
    <div className={cn(
      "glass-panel rounded-xl p-6 bg-gradient-to-br animate-fade-in",
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {change && (
            <p className="text-sm text-success mt-2">{change}</p>
          )}
        </div>
        <div className={cn("p-3 rounded-lg bg-card/50", iconStyles[variant])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
