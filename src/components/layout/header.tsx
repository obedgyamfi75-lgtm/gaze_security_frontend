"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, HelpCircle, LogOut, User, Settings, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { useRecentActivity } from "@/hooks/use-data";

interface HeaderProps {
  title?: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { data: activity } = useRecentActivity(5);

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() || user.name : "User";
  const displayRole = user?.role ?? "";
  const initials = user
    ? ((user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "")) || (user.name?.[0] ?? "U")
    : "U";

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/50 bg-background/80 px-6 backdrop-blur-xl">
      {/* Left side - Search */}
      <div className="flex items-center gap-4">
        {title ? (
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        ) : (
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search assessments, findings, assets..."
              className="pl-10 pr-16 h-9 bg-muted/30 border-border/50 focus:border-primary/50 focus:bg-muted/50 transition-colors"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border border-border/50 bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
              <Command className="h-3 w-3" />K
            </kbd>
          </div>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-1">
        {/* Help */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title="Documentation &amp; Help"
          onClick={() => router.push("/admin/settings")}
        >
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Help</span>
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8 text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
              {activity.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-background">
                  {activity.length}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-card border-border/50">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span className="text-sm font-semibold">Recent Activity</span>
              {activity.length > 0 && (
                <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                  {activity.length} items
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            <div className="max-h-80 overflow-y-auto">
              {activity.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No recent activity</p>
              ) : (
                activity.map((item) => (
                  <NotificationItem
                    key={item.id}
                    title={item.action}
                    description={item.description}
                    time={item.timestamp}
                    type={item.type === "finding" ? "critical" : item.type === "assessment" ? "warning" : "info"}
                  />
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mx-2 h-6 w-px bg-border/50" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 px-2 gap-2 hover:bg-muted/50">
              <Avatar className="h-7 w-7 border border-border/50">
                <AvatarImage src="/avatars/user.jpg" alt={displayName} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {initials.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium">{displayName}</span>
                <span className="text-[10px] text-muted-foreground capitalize">{displayRole.replace(/_/g, " ")}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card border-border/50">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground font-mono">{user?.email ?? ""}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem className="cursor-pointer" onSelect={() => router.push("/admin/users")}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onSelect={() => router.push("/admin/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem
              className="text-red-500 cursor-pointer focus:text-red-500"
              onSelect={async () => { await logout(); router.push("/login"); }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

interface NotificationItemProps {
  title: string;
  description: string;
  time: string;
  type: "critical" | "warning" | "info";
}

function relativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotificationItem({ title, description, time, type }: NotificationItemProps) {
  const typeStyles = {
    critical: "border-l-red-500 bg-red-500/5",
    warning: "border-l-yellow-500 bg-yellow-500/5",
    info: "border-l-primary bg-primary/5",
  };

  const dotStyles = {
    critical: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-primary",
  };

  return (
    <div
      className={`border-l-2 p-3 cursor-pointer hover:bg-muted/30 transition-colors ${typeStyles[type]}`}
    >
      <div className="flex items-start gap-2">
        <div className={`mt-1.5 h-2 w-2 rounded-full ${dotStyles[type]}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
          <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">{relativeTime(time)}</p>
        </div>
      </div>
    </div>
  );
}