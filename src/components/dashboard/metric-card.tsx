"use client";

import * as React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  trend?: "up" | "down";
  trendValue?: string;
  icon: React.ElementType;
  accentColor?: "primary" | "red" | "green" | "purple" | "yellow";
}

const colorClasses = {
  primary: { bg: "bg-primary/10", text: "text-primary" },
  red:     { bg: "bg-red-500/10",    text: "text-red-500" },
  green:   { bg: "bg-green-500/10",  text: "text-green-500" },
  purple:  { bg: "bg-purple-500/10", text: "text-purple-500" },
  yellow:  { bg: "bg-yellow-500/10", text: "text-yellow-500" },
};

export function MetricCard({
  title,
  value,
  description,
  trend,
  trendValue,
  icon: Icon,
  accentColor = "primary",
}: MetricCardProps) {
  const colors = colorClasses[accentColor];

  return (
    <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-200 group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={cn("p-2.5 rounded-lg", colors.bg)}>
            <Icon className={cn("h-4 w-4", colors.text)} />
          </div>
          {trend && trendValue && (
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                trend === "up"
                  ? "bg-green-500/10 text-green-500"
                  : "bg-red-500/10 text-red-500"
              )}
            >
              {trend === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trendValue}
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className={cn("text-3xl font-bold font-mono", colors.text)}>{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{title}</p>
          <p className="text-[10px] text-muted-foreground/70 mt-0.5">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
