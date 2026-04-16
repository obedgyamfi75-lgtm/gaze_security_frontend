"use client";

import * as React from "react";
import {
  Search,
  Activity,
  Download,
  Calendar,
  Shield,
  LogIn,
  LogOut,
  FileText,
  Settings,
  Trash2,
  Edit,
  Plus,
  Eye,
  Key,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Server,
  Globe,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuditLogs } from "@/hooks/use-data";
import { ListPageSkeleton } from "@/components/shared/skeletons";
import { ErrorState, EmptyState } from "@/components/shared/empty-state";
import type { AuditLog, AuditAction } from "@/types";

// =============================================================================
// CONFIGURATION
// =============================================================================

const entityTypeConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  user: { label: "User", icon: User, color: "text-blue-500", bg: "bg-blue-500/10" },
  finding: { label: "Finding", icon: FileText, color: "text-green-500", bg: "bg-green-500/10" },
  assessment: { label: "Assessment", icon: Shield, color: "text-purple-500", bg: "bg-purple-500/10" },
  report: { label: "Report", icon: FileText, color: "text-orange-500", bg: "bg-orange-500/10" },
  asset: { label: "Asset", icon: Server, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  product: { label: "Product", icon: Settings, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  auth: { label: "Auth", icon: Key, color: "text-red-500", bg: "bg-red-500/10" },
  system: { label: "System", icon: Server, color: "text-muted-foreground", bg: "bg-muted/50" },
};

const actionIcons: Record<AuditAction, React.ElementType> = {
  login: LogIn,
  logout: LogOut,
  create: Plus,
  update: Edit,
  delete: Trash2,
  export: Download,
  status_change: Edit,
};

const actionConfig: Record<AuditAction, { label: string; color: string }> = {
  login: { label: "Login", color: "text-blue-500" },
  logout: { label: "Logout", color: "text-muted-foreground" },
  create: { label: "Create", color: "text-green-500" },
  update: { label: "Update", color: "text-yellow-500" },
  delete: { label: "Delete", color: "text-red-500" },
  export: { label: "Export", color: "text-purple-500" },
  status_change: { label: "Status Change", color: "text-orange-500" },
};

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function AuditLogsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [actionFilter, setActionFilter] = React.useState<string>("all");
  const [dateRange, setDateRange] = React.useState("today");

  // Fetch audit logs from API
  const { data: auditLogs, isLoading, error, refetch, meta } = useAuditLogs({
    action: actionFilter !== "all" ? actionFilter : undefined,
  });

  // Compute date boundary from dateRange selection
  const dateFrom = React.useMemo(() => {
    const now = new Date();
    if (dateRange === "today") {
      const d = new Date(now); d.setHours(0, 0, 0, 0); return d;
    }
    if (dateRange === "yesterday") {
      const d = new Date(now); d.setDate(d.getDate() - 1); d.setHours(0, 0, 0, 0); return d;
    }
    if (dateRange === "week") {
      const d = new Date(now); d.setDate(d.getDate() - 7); return d;
    }
    if (dateRange === "month") {
      const d = new Date(now); d.setDate(d.getDate() - 30); return d;
    }
    return null; // "all"
  }, [dateRange]);

  // Filter logs client-side for search and date range
  const filteredLogs = React.useMemo(() => {
    let logs = auditLogs;
    if (dateFrom) {
      logs = logs.filter((log) => new Date(log.createdAt) >= dateFrom);
    }
    if (!searchQuery) return logs;
    const query = searchQuery.toLowerCase();
    return logs.filter((log) =>
      log.user?.name?.toLowerCase().includes(query) ||
      log.action.toLowerCase().includes(query) ||
      log.entityType.toLowerCase().includes(query) ||
      log.entityName?.toLowerCase().includes(query)
    );
  }, [auditLogs, searchQuery, dateFrom]);

  // Export logs as CSV
  const handleExport = React.useCallback(() => {
    const headers = ["Timestamp", "Action", "Entity Type", "Entity Name", "Entity ID", "User", "IP Address"];
    const rows = filteredLogs.map((log) => [
      new Date(log.createdAt).toISOString(),
      log.action,
      log.entityType,
      log.entityName ?? "",
      log.entityId ?? "",
      log.user?.name ?? "Unknown",
      log.ipAddress ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredLogs]);

  // Calculate stats
  const stats = React.useMemo(() => ({
    total: auditLogs.length,
    logins: auditLogs.filter((l) => l.action === "login").length,
    creates: auditLogs.filter((l) => l.action === "create").length,
    deletes: auditLogs.filter((l) => l.action === "delete").length,
  }), [auditLogs]);

  // Loading state
  if (isLoading) {
    return <ListPageSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title="Failed to load audit logs"
        description={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-sm text-muted-foreground">
            Track all system activities and user actions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={refetch} className="border-border/50">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="border-border/50" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <QuickStat label="Total Events" value={stats.total} icon={Activity} color="primary" />
        <QuickStat label="Logins" value={stats.logins} icon={LogIn} color="blue" />
        <QuickStat label="Creates" value={stats.creates} icon={Plus} color="green" />
        <QuickStat label="Deletes" value={stats.deletes} icon={Trash2} color="red" />
      </div>

      {/* Filters */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search logs by user, action, or resource..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/30 border-border/50"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-36 bg-muted/30 border-border/50">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="week">Last 7 days</SelectItem>
                  <SelectItem value="month">Last 30 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-32 bg-muted/30 border-border/50">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredLogs.length === 0 && (
        <EmptyState
          icon={Activity}
          title="No audit logs found"
          description="Try adjusting your search or filter criteria."
        />
      )}

      {/* Logs Timeline */}
      {filteredLogs.length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Activity Timeline</CardTitle>
            <CardDescription>
              Showing {filteredLogs.length} of {auditLogs.length} events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {filteredLogs.map((log, index) => (
                  <LogEntry key={log.id} log={log} isLast={index === filteredLogs.length - 1} />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-mono font-medium">{filteredLogs.length}</span> logs
          {meta && meta.totalItems > 0 && (
            <> of <span className="font-mono font-medium">{meta.totalItems}</span></>
          )}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled className="border-border/50">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled className="border-border/50">
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// QUICK STAT COMPONENT
// =============================================================================

function QuickStat({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  const colorClasses: Record<string, { bg: string; text: string }> = {
    primary: { bg: "bg-primary/10", text: "text-primary" },
    green: { bg: "bg-green-500/10", text: "text-green-500" },
    red: { bg: "bg-red-500/10", text: "text-red-500" },
    blue: { bg: "bg-blue-500/10", text: "text-blue-500" },
    orange: { bg: "bg-orange-500/10", text: "text-orange-500" },
  };

  const colors = colorClasses[color] || colorClasses.primary;

  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-lg", colors.bg)}>
            <Icon className={cn("h-5 w-5", colors.text)} />
          </div>
          <div>
            <p className={cn("text-2xl font-bold font-mono", colors.text)}>{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// LOG ENTRY COMPONENT
// =============================================================================

function LogEntry({ log, isLast }: { log: AuditLog; isLast: boolean }) {
  const entityConfig = entityTypeConfig[log.entityType.toLowerCase()] || entityTypeConfig.system;
  const action = actionConfig[log.action] || { label: log.action, color: "text-muted-foreground" };
  const EntityIcon = entityConfig.icon;
  const ActionIcon = actionIcons[log.action] || Activity;

  const time = new Date(log.createdAt);
  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString();

  const getUserInitials = () => {
    if (log.user?.initials) return log.user.initials;
    if (log.user?.name) {
      return log.user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return "??";
  };

  const getUserName = () => log.user?.name || "Unknown";

  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[19px] top-10 bottom-0 w-px bg-border/50" />
      )}

      {/* Icon */}
      <div className={cn("relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border", entityConfig.bg, "border-border/50")}>
        <EntityIcon className={cn("h-4 w-4", entityConfig.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={cn("gap-1 text-[10px] bg-muted/50 border-border/50", action.color)}>
                <ActionIcon className="h-3 w-3" />
                {action.label.toUpperCase()}
              </Badge>
              <span className="text-sm font-medium capitalize">{log.entityType}</span>
              {log.entityId && (
                <span className="text-xs font-mono text-muted-foreground">{log.entityId}</span>
              )}
            </div>
            {log.entityName && (
              <p className="text-sm text-muted-foreground">{log.entityName}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-mono text-muted-foreground">{timeStr}</p>
            <p className="text-[10px] text-muted-foreground">{dateStr}</p>
          </div>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <Avatar className="h-4 w-4">
              <AvatarFallback className="text-[8px] bg-muted">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <span>{getUserName()}</span>
          </div>
          {log.ipAddress && (
            <div className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              <span className="font-mono">{log.ipAddress}</span>
            </div>
          )}
          {log.userAgent && (
            <span className="hidden sm:inline truncate max-w-[200px]">{log.userAgent}</span>
          )}
        </div>
      </div>
    </div>
  );
}