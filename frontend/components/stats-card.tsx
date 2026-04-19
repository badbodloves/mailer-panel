"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | undefined;
  icon: LucideIcon;
  variant: "default" | "success" | "warning" | "destructive";
  isLoading?: boolean;
}

const variantStyles = {
  default: {
    glow: "shadow-[0_0_30px_-5px_oklch(0.65_0.15_220_/_0.3)]",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  success: {
    glow: "shadow-[0_0_30px_-5px_oklch(0.7_0.18_160_/_0.3)]",
    iconBg: "bg-success/10",
    iconColor: "text-success",
  },
  warning: {
    glow: "shadow-[0_0_30px_-5px_oklch(0.75_0.15_80_/_0.3)]",
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
  },
  destructive: {
    glow: "shadow-[0_0_30px_-5px_oklch(0.6_0.2_25_/_0.3)]",
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
  },
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  variant,
  isLoading,
}: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card
      className={cn(
        "transition-all duration-300 hover:scale-[1.02]",
        styles.glow
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("rounded-lg p-2", styles.iconBg)}>
          <Icon className={cn("h-4 w-4", styles.iconColor)} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-9 w-24" />
        ) : (
          <div className="text-3xl font-bold tabular-nums">
            {value?.toLocaleString() ?? 0}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
