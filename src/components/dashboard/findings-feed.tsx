"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, XCircle, AlertCircle, CheckCircle2, Server } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Finding } from "@/types";

const severityColors: Record<string, string> = {
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
  high:     "bg-orange-500/10 text-orange-500 border-orange-500/20",
  medium:   "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  low:      "bg-green-500/10 text-green-500 border-green-500/20",
  info:     "bg-primary/10 text-primary border-primary/20",
};

const statusConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  open:           { icon: <XCircle className="h-3.5 w-3.5" />,      color: "text-red-500" },
  in_progress:    { icon: <AlertCircle className="h-3.5 w-3.5" />,  color: "text-yellow-500" },
  remediated:     { icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: "text-green-500" },
  accepted:       { icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: "text-blue-500" },
  false_positive: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: "text-gray-500" },
};

function FindingRow({ finding }: { finding: Finding }) {
  const status = statusConfig[finding.status] ?? statusConfig.open;
  const dueDate = finding.slaDueDate;

  return (
    <Link href={`/findings/${finding.id}`}>
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 border border-transparent hover:border-border/50 transition-all cursor-pointer group">
        <Badge
          variant="outline"
          className={cn("w-16 justify-center text-[10px] font-semibold uppercase", severityColors[finding.severity])}
        >
          {finding.severity}
        </Badge>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-mono text-muted-foreground">{finding.id}</span>
          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
            {finding.title}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Server className="h-3 w-3" />
            <span className="font-mono">{finding.asset?.name ?? "Unknown Asset"}</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className={cn("flex items-center gap-1", status.color)}>
            {status.icon}
            <span className="text-[10px] capitalize">{finding.status.replace("_", " ")}</span>
          </div>
          {dueDate && (
            <span className="text-[10px] text-muted-foreground font-mono">
              Due: {new Date(dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

interface FindingsFeedProps {
  findings: Finding[];
  isLoading: boolean;
}

export function FindingsFeed({ findings, isLoading }: FindingsFeedProps) {
  return (
    <Card className="lg:col-span-4 bg-card/50 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold">Recent Findings</CardTitle>
          <CardDescription className="text-xs">Latest security vulnerabilities discovered</CardDescription>
        </div>
        <Link href="/findings">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
            View All <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading findings...</div>
          ) : findings.length > 0 ? (
            findings.map((finding) => <FindingRow key={finding.id} finding={finding} />)
          ) : (
            <div className="py-8 text-center text-muted-foreground">No recent findings</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
