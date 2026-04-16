"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Shield,
  Target,
  Bug,
  Server,
  FileText,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  Activity,
  AlertTriangle,
  Clock,
  Wrench,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useDashboardStats } from "@/hooks/use-data";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: "default" | "destructive" | "warning";
}

const mainNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Products", href: "/products", icon: Package },
  { title: "Assessments", href: "/assessments", icon: Shield },
  { title: "Findings", href: "/findings", icon: Bug, badgeVariant: "destructive" },
  { title: "Assets", href: "/assets", icon: Server },
  { title: "Reports", href: "/reports", icon: FileText },
];

const toolsNav: NavItem[] = [
  { title: "Recon", href: "/tools/recon", icon: Target },
  { title: "POC Scaffold", href: "/tools/scaffold", icon: Wrench },
];

const adminNav: NavItem[] = [
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Audit Logs", href: "/admin/audit", icon: Activity },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const { data: stats } = useDashboardStats();

  const criticalCount = stats?.findings?.bySeverity?.critical ?? 0;
  const slaBreaches = stats?.sla?.overdue ?? 0;
  const openFindings = stats?.findings?.open ?? 0;

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r border-border/50 bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Subtle grid background - only visible in dark mode */}
      <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none dark:opacity-30 opacity-10" />

      {/* Logo Section */}
      <div className="relative flex h-16 items-center justify-between px-4 border-b border-border/50">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 border border-primary/30 glow-sm">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-foreground tracking-tight">GAZE</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Security Platform</span>
            </div>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 border border-primary/30">
              <Shield className="h-5 w-5 text-primary" />
            </div>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="relative flex-1 px-3 py-4">
        <nav className="space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            {!collapsed && (
              <h4 className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Main
              </h4>
            )}
            {mainNav.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                collapsed={collapsed}
                badgeOverride={item.href === "/findings" && openFindings > 0 ? String(openFindings) : undefined}
              />
            ))}
          </div>

          <Separator className="bg-border/50" />

          {/* Tools */}
          <div className="space-y-1">
            {!collapsed && (
              <h4 className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Tools
              </h4>
            )}
            {toolsNav.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                collapsed={collapsed}
              />
            ))}
          </div>

          <Separator className="bg-border/50" />

          {/* Admin */}
          <div className="space-y-1">
            {!collapsed && (
              <h4 className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Admin
              </h4>
            )}
            {adminNav.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                collapsed={collapsed}
              />
            ))}
          </div>
        </nav>
      </ScrollArea>

      {/* Quick Stats (when expanded) */}
      {!collapsed && (
        <div className="relative border-t border-border/50 p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-red-500/10">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                </div>
                <span className="text-xs">Critical Issues</span>
              </div>
              <span className="font-mono text-sm font-semibold text-red-500">{criticalCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-yellow-500/10">
                  <Clock className="h-3.5 w-3.5 text-yellow-500" />
                </div>
                <span className="text-xs">SLA Breaches</span>
              </div>
              <span className="font-mono text-sm font-semibold text-yellow-500">{slaBreaches}</span>
            </div>
          </div>
        </div>
      )}

      {/* Collapse Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-background shadow-md hover:bg-primary/10 hover:border-primary/50 transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>
    </aside>
  );
}

interface NavLinkProps {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
  badgeOverride?: string;
}

function NavLink({ item, pathname, collapsed, badgeOverride }: NavLinkProps) {
  const badge = badgeOverride ?? item.badge;
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [tooltipPosition, setTooltipPosition] = React.useState({ top: 0, left: 0 });
  const linkRef = React.useRef<HTMLAnchorElement>(null);
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;

  const handleMouseEnter = () => {
    if (collapsed && linkRef.current) {
      const rect = linkRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 8,
      });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <>
      <Link
        ref={linkRef}
        href={item.href}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-primary/10 text-primary border border-primary/20"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent",
          collapsed && "justify-center px-2"
        )}
      >
        <Icon className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )} />
        {!collapsed && (
          <>
            <span className="flex-1">{item.title}</span>
            {badge && (
              <span
                className={cn(
                  "flex h-5 min-w-[20px] items-center justify-center rounded px-1.5 text-xs font-mono font-semibold",
                  item.badgeVariant === "destructive"
                    ? "bg-red-500/10 text-red-500 border border-red-500/20"
                    : item.badgeVariant === "warning"
                      ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                      : "bg-primary/10 text-primary border border-primary/20"
                )}
              >
                {badge}
              </span>
            )}
          </>
        )}
      </Link>

      {/* Fixed position tooltip */}
      {collapsed && showTooltip && (
        <div
          className="fixed px-3 py-1.5 bg-card border border-border/50 rounded-md shadow-lg text-sm whitespace-nowrap z-[9999] flex items-center gap-2 -translate-y-1/2"
          style={{ top: tooltipPosition.top, left: tooltipPosition.left }}
        >
          {item.title}
          {badge && (
            <span
              className={cn(
                "flex h-5 min-w-[20px] items-center justify-center rounded px-1.5 text-xs font-mono font-semibold",
                item.badgeVariant === "destructive"
                  ? "bg-red-500/10 text-red-500"
                  : "bg-primary/10 text-primary"
              )}
            >
              {badge}
            </span>
          )}
        </div>
      )}
    </>
  );
}