"use client";

import * as React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/types";

const SEVERITY_COLORS = {
  critical: "#ef4444",
  high:     "#f97316",
  medium:   "#eab308",
  low:      "#22c55e",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/95 backdrop-blur border border-border/50 rounded-lg p-3 shadow-xl">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-mono font-semibold">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

interface SeverityDistributionProps {
  stats: DashboardStats | null;
}

export function SeverityDistribution({ stats }: SeverityDistributionProps) {
  const distribution = stats?.findings?.bySeverity
    ? (["critical", "high", "medium", "low"] as const).map((key) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: stats.findings.bySeverity[key] ?? 0,
        color: SEVERITY_COLORS[key],
      }))
    : [];

  return (
    <Card className="lg:col-span-3 bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Severity Distribution</CardTitle>
        <CardDescription className="text-xs">Current open findings by severity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[180px]">
          {distribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                >
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {distribution.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-muted/30">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground flex-1">{item.name}</span>
              <span className="font-mono font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
