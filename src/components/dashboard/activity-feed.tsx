"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ActivityItem } from "@/types";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function ActivityRow({ activity }: { activity: ActivityItem }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
      <Avatar className="h-8 w-8 border border-border/50">
        <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
          {getInitials(activity.user?.name ?? "UN")}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{activity.user?.name ?? "Unknown"}</p>
        <p className="text-xs text-muted-foreground truncate">
          {activity.description ?? activity.action}
        </p>
      </div>
      <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
        {formatTime(activity.timestamp)}
      </span>
    </div>
  );
}

interface ActivityFeedProps {
  activity: ActivityItem[];
  isLoading: boolean;
}

export function ActivityFeed({ activity, isLoading }: ActivityFeedProps) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Team Activity</CardTitle>
        <CardDescription className="text-xs">Recent actions by team members</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isLoading ? (
            <div className="py-4 text-center text-muted-foreground">Loading activity...</div>
          ) : activity.length > 0 ? (
            activity.map((item, index) => (
              <ActivityRow key={item.id ?? index} activity={item} />
            ))
          ) : (
            <div className="py-4 text-center text-muted-foreground">No recent activity</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
