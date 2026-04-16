"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Chart configuration type
export interface ChartConfig {
  [key: string]: {
    label: string;
    color?: string;
    icon?: React.ComponentType;
  };
}

// Chart container component
interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
}

export function ChartContainer({
  config,
  className,
  children,
  ...props
}: ChartContainerProps) {
  // Generate CSS variables for chart colors
  const cssVars = React.useMemo(() => {
    const vars: Record<string, string> = {};
    Object.entries(config).forEach(([key, value]) => {
      if (value.color) {
        vars[`--color-${key}`] = value.color;
      }
    });
    return vars;
  }, [config]);

  return (
    <div
      className={cn("", className)}
      style={cssVars as React.CSSProperties}
      {...props}
    >
      {children}
    </div>
  );
}

// Chart tooltip content component
interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color?: string;
    dataKey?: string;
    payload?: Record<string, unknown>;
  }>;
  label?: string;
  config?: ChartConfig;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "line" | "dot" | "dashed";
  nameKey?: string;
  labelKey?: string;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  config,
  hideLabel = false,
  hideIndicator = false,
  indicator = "dot",
  nameKey,
  labelKey,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-md">
      {!hideLabel && label && (
        <div className="mb-1.5 text-xs font-medium text-muted-foreground">
          {label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((item, index) => {
          const key = nameKey ? item.payload?.[nameKey] as string : item.name || item.dataKey || "";
          const configItem = config?.[key as keyof typeof config];
          const color = item.color || configItem?.color || `hsl(var(--chart-${index + 1}))`;
          
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              {!hideIndicator && (
                <div
                  className={cn(
                    "shrink-0",
                    indicator === "dot" && "h-2 w-2 rounded-full",
                    indicator === "line" && "h-0.5 w-4",
                    indicator === "dashed" && "h-0.5 w-4 border-t border-dashed"
                  )}
                  style={{ backgroundColor: indicator !== "dashed" ? color : undefined, borderColor: color }}
                />
              )}
              <span className="text-muted-foreground">
                {configItem?.label || key}:
              </span>
              <span className="font-medium">
                {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}