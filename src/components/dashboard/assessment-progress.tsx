"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { DashboardStats } from "@/types";

interface AssessmentProgressProps {
  stats: DashboardStats | null;
}

export function AssessmentProgress({ stats }: AssessmentProgressProps) {
  const total = stats?.assessments.total ?? 0;

  const rows = stats
    ? [
        { label: "Completed",   count: stats.assessments.completed },
        { label: "In Progress", count: stats.assessments.inProgress },
        { label: "Planned",     count: stats.assessments.planned },
      ]
    : [];

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Assessment Progress</CardTitle>
        <CardDescription className="text-xs">Current status overview</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.length > 0 ? (
          rows.map(({ label, count }) => (
            <div key={label} className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{label}</span>
                <span className="text-muted-foreground font-mono">
                  {count}/{total}
                </span>
              </div>
              <Progress
                value={total > 0 ? (count / total) * 100 : 0}
                className="h-2 bg-muted/30"
              />
            </div>
          ))
        ) : (
          <div className="py-4 text-center text-muted-foreground">No data</div>
        )}
      </CardContent>
    </Card>
  );
}
