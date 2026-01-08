import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  variant?: "primary" | "accent" | "success" | "warning";
  trend?: "up" | "down" | "neutral";
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  variant = "primary",
  trend = "up" 
}: StatsCardProps) {
  const variantStyles = {
    primary: {
      bg: "from-primary/15 via-primary/5 to-transparent",
      border: "border-primary/20",
      icon: "bg-primary/20 text-primary",
      glow: "shadow-[0_0_30px_-10px_hsl(262_83%_58%/0.4)]",
    },
    accent: {
      bg: "from-accent/15 via-accent/5 to-transparent",
      border: "border-accent/20",
      icon: "bg-accent/20 text-accent",
      glow: "shadow-[0_0_30px_-10px_hsl(172_66%_50%/0.4)]",
    },
    success: {
      bg: "from-success/15 via-success/5 to-transparent",
      border: "border-success/20",
      icon: "bg-success/20 text-success",
      glow: "shadow-[0_0_30px_-10px_hsl(142_71%_45%/0.4)]",
    },
    warning: {
      bg: "from-warning/15 via-warning/5 to-transparent",
      border: "border-warning/20",
      icon: "bg-warning/20 text-warning",
      glow: "shadow-[0_0_30px_-10px_hsl(38_92%_50%/0.4)]",
    },
  };

  const trendColors = {
    up: "text-success",
    down: "text-destructive",
    neutral: "text-muted-foreground",
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn(
      "stat-card glass-card p-6 bg-gradient-to-br animate-slide-up",
      styles.bg,
      styles.border,
      styles.glow
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-4xl font-bold tracking-tight">{value}</p>
          {change && (
            <p className={cn("text-sm font-medium flex items-center gap-1", trendColors[trend])}>
              {trend === "up" && "↑"}
              {trend === "down" && "↓"}
              {change}
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", styles.icon)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}