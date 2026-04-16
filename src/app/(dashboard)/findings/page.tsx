"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  MoreHorizontal,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Download,
  Bug,
  Server,
  AlertTriangle,
  FileText,
  User,
  Shield,
  Timer,
  Paperclip,
  Package,
  RefreshCw,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { CreateFindingDialog } from "@/components/assessments/create-finding-dialog";
import { useFindings, useProducts, useAssets, useAssessments, useUsers } from "@/hooks/use-data";
import { findingsApi } from "@/lib/api";
import { ListPageSkeleton } from "@/components/shared/skeletons";
import { ErrorState, EmptyState } from "@/components/shared/empty-state";
import type { Finding, Severity, FindingStatus, Asset, Assessment, CreateFindingInput, UpdateFindingInput } from "@/types";

// =============================================================================
// CONFIGURATION
// =============================================================================

const severityConfig: Record<Severity, { color: string; bg: string; border: string }> = {
  critical: { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  high: { color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  medium: { color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  low: { color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
  info: { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
};

const statusConfig: Record<FindingStatus, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  open: { label: "Open", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  in_progress: { label: "In Progress", icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  remediated: { label: "Remediated", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
  accepted: { label: "Accepted", icon: AlertCircle, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  false_positive: { label: "False Positive", icon: AlertCircle, color: "text-muted-foreground", bg: "bg-muted/50", border: "border-border/50" },
  duplicate: { label: "Duplicate", icon: AlertCircle, color: "text-muted-foreground", bg: "bg-muted/50", border: "border-border/50" },
  verified: { label: "Verified", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
};

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function FindingsPage() {
  // Filter states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [severityFilter, setSeverityFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [productFilter, setProductFilter] = React.useState<string>("all");
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = React.useState(false);
  const [bulkStatusDialogOpen, setBulkStatusDialogOpen] = React.useState(false);
  const [bulkNewStatus, setBulkNewStatus] = React.useState<FindingStatus | "">("");
  const [isBulkProcessing, setIsBulkProcessing] = React.useState(false);

  // Fetch data from API
  const { data: findings, isLoading, error, refetch, meta, setPage } = useFindings({
    search: searchQuery || undefined,
    severity: severityFilter !== "all" ? severityFilter as Severity : undefined,
    status: statusFilter !== "all" ? statusFilter as FindingStatus : undefined,
    productId: productFilter !== "all" ? productFilter : undefined,
  });

  const currentPage = meta?.page ?? 1;
  const totalPages = meta?.totalPages ?? 1;

  const handleExport = React.useCallback(() => {
    const headers = ["ID", "Title", "Severity", "Status", "Asset", "Assessment", "Created"];
    const rows = findings.map((f) => [
      f.id,
      f.title,
      f.severity,
      f.status,
      f.asset?.name ?? "",
      f.assessment?.name ?? "",
      new Date(f.createdAt ?? "").toISOString().slice(0, 10),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `findings-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [findings]);

  // Fetch products for filter dropdown
  const { data: products } = useProducts();

  // Calculate stats from data
  const stats = React.useMemo(() => ({
    total: findings.length,
    critical: findings.filter((f) => f.severity === "critical").length,
    high: findings.filter((f) => f.severity === "high").length,
    open: findings.filter((f) => f.status === "open").length,
    overdue: findings.filter((f) => {
      const dueDate = f.slaDueDate;
      if (!dueDate || f.status === "remediated" || f.status === "verified") return false;
      return new Date(dueDate) < new Date();
    }).length,
  }), [findings]);

  // Bulk action handlers
  const handleBulkDelete = async () => {
    setIsBulkProcessing(true);
    try {
      await Promise.all(selectedRows.map((id) => findingsApi.delete(id)));
      setSelectedRows([]);
      setBulkDeleteDialogOpen(false);
      refetch();
    } catch {
      // silent — keep dialog open so user can retry
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkStatusChange = async () => {
    if (!bulkNewStatus) return;
    setIsBulkProcessing(true);
    try {
      await Promise.all(selectedRows.map((id) => findingsApi.updateStatus(id, bulkNewStatus as FindingStatus)));
      setSelectedRows([]);
      setBulkStatusDialogOpen(false);
      refetch();
    } catch {
      // silent
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedRows.length === findings.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(findings.map((f) => f.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((r) => r !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Loading state
  if (isLoading) {
    return <ListPageSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title="Failed to load findings"
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
          <h1 className="text-2xl font-bold tracking-tight">Security Findings</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage discovered vulnerabilities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={refetch} className="border-border/50">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="border-border/50 hover:border-primary/50 hover:bg-primary/5" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Finding
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <QuickStat label="Total Findings" value={stats.total} icon={Bug} color="primary" />
        <QuickStat label="Critical" value={stats.critical} icon={AlertTriangle} color="red" />
        <QuickStat label="High" value={stats.high} icon={AlertCircle} color="orange" />
        <QuickStat label="Open" value={stats.open} icon={XCircle} color="yellow" />
        <QuickStat label="Overdue" value={stats.overdue} icon={Timer} color="red" />
      </div>

      {/* Filters */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title, ID, asset, or CWE..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/30 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={productFilter} onValueChange={setProductFilter}>
                <SelectTrigger className="w-40 bg-muted/30 border-border/50">
                  <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.shortName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-36 bg-muted/30 border-border/50">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 bg-muted/30 border-border/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="remediated">Remediated</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <span className="text-sm font-medium">
            <span className="font-mono text-primary">{selectedRows.length}</span> finding(s) selected
          </span>
          <Button size="sm" variant="outline" className="border-border/50" onClick={() => setBulkStatusDialogOpen(true)}>
            Update Status
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-500/50 text-red-500 hover:bg-red-500/10"
            onClick={() => setBulkDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-3 w-3" />
            Delete
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedRows([])}>Clear Selection</Button>
        </div>
      )}

      {/* Empty State */}
      {findings.length === 0 && (
        <EmptyState
          icon={Bug}
          title="No findings found"
          description="Try adjusting your search or filter criteria, or add a new finding."
          action={{
            label: "Add Finding",
            onClick: () => setCreateDialogOpen(true),
          }}
        />
      )}

      {/* Findings Table */}
      {findings.length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRows.length === findings.length && findings.length > 0}
                      onCheckedChange={toggleSelectAll}
                      className="border-border"
                    />
                  </TableHead>
                  <TableHead className="w-28 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">ID</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Title</TableHead>
                  <TableHead className="w-24 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Severity</TableHead>
                  <TableHead className="w-28 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                  <TableHead className="hidden lg:table-cell text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Asset</TableHead>
                  <TableHead className="hidden md:table-cell w-20 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">CVSS</TableHead>
                  <TableHead className="hidden xl:table-cell text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Due Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {findings.map((finding) => (
                <FindingTableRow
                  key={finding.id}
                  finding={finding}
                  isSelected={selectedRows.includes(finding.id)}
                  onToggleSelect={() => toggleSelectRow(finding.id)}
                  onRefetch={refetch}
                />
              ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-mono font-medium text-foreground">{findings.length}</span> findings
          {meta && meta.totalItems > 0 && (
            <> of <span className="font-mono font-medium text-foreground">{meta.totalItems}</span></>
          )}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline" size="sm" className="border-border/50"
            disabled={currentPage <= 1}
            onClick={() => setPage(currentPage - 1)}
          >Previous</Button>
          <span className="text-xs text-muted-foreground px-1 font-mono">{currentPage}/{totalPages}</span>
          <Button
            variant="outline" size="sm" className="border-border/50"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(currentPage + 1)}
          >Next</Button>
        </div>
      </div>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedRows.length} Finding(s)</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedRows.length} finding(s). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isBulkProcessing}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isBulkProcessing ? "Deleting..." : `Delete ${selectedRows.length} Finding(s)`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Status Change */}
      <Dialog open={bulkStatusDialogOpen} onOpenChange={setBulkStatusDialogOpen}>
        <DialogContent className="bg-card border-border/50 max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
            <DialogDescription>
              Set a new status for {selectedRows.length} selected finding(s).
            </DialogDescription>
          </DialogHeader>
          <Select value={bulkNewStatus} onValueChange={(v) => setBulkNewStatus(v as FindingStatus)}>
            <SelectTrigger className="bg-muted/30 border-border/50">
              <SelectValue placeholder="Choose new status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="remediated">Remediated</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="false_positive">False Positive</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkStatusDialogOpen(false)} disabled={isBulkProcessing}>
              Cancel
            </Button>
            <Button onClick={handleBulkStatusChange} disabled={!bulkNewStatus || isBulkProcessing}>
              {isBulkProcessing ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Finding Dialog */}
      <CreateFindingDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={refetch}
      />
    </div>
  );
}

// =============================================================================
// QUICK STAT COMPONENT
// =============================================================================

function QuickStat({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  const colorClasses: Record<string, { bg: string; text: string }> = {
    primary: { bg: "bg-primary/10", text: "text-primary" },
    red: { bg: "bg-red-500/10", text: "text-red-500" },
    orange: { bg: "bg-orange-500/10", text: "text-orange-500" },
    yellow: { bg: "bg-yellow-500/10", text: "text-yellow-500" },
    green: { bg: "bg-green-500/10", text: "text-green-500" },
  };

  const colors = colorClasses[color] || colorClasses.primary;

  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", colors.bg)}>
            <Icon className={cn("h-4 w-4", colors.text)} />
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
// SLA BADGE COMPONENT
// =============================================================================

function SLABadge({ dueDate, status }: { dueDate?: string; status: string }) {
  if (!dueDate) return null;

  const now = new Date();
  const due = new Date(dueDate);
  const daysRemaining = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isResolved = status === "remediated" || status === "verified";
  const isOverdue = daysRemaining < 0 && !isResolved;
  const isUrgent = daysRemaining <= 3 && daysRemaining >= 0 && !isResolved;

  if (isResolved) {
    return (
      <span className="text-xs text-green-500 flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Resolved
      </span>
    );
  }

  if (isOverdue) {
    return (
      <span className="text-xs text-red-500 font-medium flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        {Math.abs(daysRemaining)}d overdue
      </span>
    );
  }

  if (isUrgent) {
    return (
      <span className="text-xs text-orange-500 font-medium flex items-center gap-1">
        <Timer className="h-3 w-3" />
        {daysRemaining}d left
      </span>
    );
  }

  return (
    <span className="text-xs text-muted-foreground flex items-center gap-1">
      <Clock className="h-3 w-3" />
      {daysRemaining}d left
    </span>
  );
}

// =============================================================================
// FINDING TABLE ROW
// =============================================================================

function FindingTableRow({
  finding,
  isSelected,
  onToggleSelect,
  onRefetch,
}: {
  finding: Finding;
  isSelected: boolean;
  onToggleSelect: () => void;
  onRefetch: () => void;
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const status = statusConfig[finding.status] || statusConfig.open;
  const severity = severityConfig[finding.severity] || severityConfig.medium;
  const StatusIcon = status.icon;

  const cvssScore = finding.cvssScore || 0;
  const cweId = finding.cweId;
  const dueDate = finding.slaDueDate;

  return (
    <>
      <TableRow
        className={cn(
          "cursor-pointer border-border/50 transition-colors hover:bg-muted/30",
          isSelected && "bg-primary/5"
        )}
        onClick={() => setDialogOpen(true)}
      >
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelect}
            className="border-border"
          />
        </TableCell>
        <TableCell className="font-mono text-xs text-muted-foreground">{finding.id}</TableCell>
        <TableCell>
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-sm line-clamp-1 hover:text-primary transition-colors">{finding.title}</span>
            <span className="text-[10px] text-muted-foreground font-mono">{cweId || "N/A"}</span>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className={cn("text-[10px] uppercase font-semibold", severity.color, severity.bg, severity.border)}>
            {finding.severity}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className={cn("gap-1 text-[10px]", status.color, status.bg, status.border)}>
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </Badge>
        </TableCell>
        <TableCell className="hidden lg:table-cell">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Server className="h-3 w-3" />
            <span className="truncate max-w-[150px] font-mono">{finding.asset?.name || "N/A"}</span>
          </div>
        </TableCell>
        <TableCell className="hidden md:table-cell">
          <Badge
            variant="outline"
            className={cn(
              "font-mono text-xs",
              cvssScore >= 9.0 ? "border-red-500/50 text-red-500 bg-red-500/10"
                : cvssScore >= 7.0 ? "border-orange-500/50 text-orange-500 bg-orange-500/10"
                  : cvssScore >= 4.0 ? "border-yellow-500/50 text-yellow-500 bg-yellow-500/10"
                    : "border-green-500/50 text-green-500 bg-green-500/10"
            )}
          >
            {cvssScore.toFixed(1)}
          </Badge>
        </TableCell>
        <TableCell className="hidden xl:table-cell">
          <SLABadge dueDate={dueDate} status={finding.status} />
        </TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <FindingActions finding={finding} onRefetch={onRefetch} />
        </TableCell>
      </TableRow>

      <FindingDetailsDialog finding={finding} open={dialogOpen} onOpenChange={setDialogOpen} onRefetch={onRefetch} />
    </>
  );
}

// =============================================================================
// FINDING ACTIONS DROPDOWN
// =============================================================================

function FindingActions({ finding, onRefetch }: { finding: Finding; onRefetch: () => void }) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleStatusUpdate = async (newStatus: FindingStatus) => {
    try {
      await findingsApi.updateStatus(finding.id, newStatus);
      onRefetch();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await findingsApi.delete(finding.id);
      if (response.success) {
        setDeleteDialogOpen(false);
        onRefetch();
      }
    } catch {
      // silent — dialog stays open so user can retry
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-card border-border/50">
          <DropdownMenuItem className="cursor-pointer" onSelect={() => setDialogOpen(true)}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <Link href={`/findings/${finding.id}`}>
            <DropdownMenuItem className="cursor-pointer">Open Full Page</DropdownMenuItem>
          </Link>
          <DropdownMenuItem className="cursor-pointer">Add Evidence</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">Update Status</DropdownMenuLabel>
          <DropdownMenuItem className="cursor-pointer" onSelect={() => handleStatusUpdate("in_progress")}>
            Mark as In Progress
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onSelect={() => handleStatusUpdate("remediated")}>
            Mark as Remediated
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onSelect={() => handleStatusUpdate("accepted")}>
            Mark as Accepted
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-500 cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Finding</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{finding.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/50">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FindingDetailsDialog finding={finding} open={dialogOpen} onOpenChange={setDialogOpen} onRefetch={onRefetch} />
    </>
  );
}

// =============================================================================
// FINDING DETAILS DIALOG
// =============================================================================

function FindingDetailsDialog({
  finding,
  open,
  onOpenChange,
  onRefetch,
}: {
  finding: Finding;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefetch: () => void;
}) {
  const severity = severityConfig[finding.severity] || severityConfig.medium;
  const status = statusConfig[finding.status] || statusConfig.open;
  const StatusIcon = status.icon;

  const cvssScore = finding.cvssScore || 0;
  const cweId = finding.cweId;
  const dueDate = finding.slaDueDate;
  const createdAt = finding.createdAt;

  // Evidence upload state
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadingEvidence, setIsUploadingEvidence] = React.useState(false);
  const [evidenceError, setEvidenceError] = React.useState<string | null>(null);

  // Reassign state
  const [reassignOpen, setReassignOpen] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState<string>("");
  const [isReassigning, setIsReassigning] = React.useState(false);
  const { data: users } = useUsers();

  const handleMarkResolved = async () => {
    try {
      await findingsApi.updateStatus(finding.id, "remediated");
      onRefetch();
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingEvidence(true);
    setEvidenceError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await findingsApi.addEvidence(finding.id, formData);
      onRefetch();
    } catch (err: unknown) {
      setEvidenceError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploadingEvidence(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleReassign = async () => {
    if (!selectedUserId) return;
    setIsReassigning(true);
    try {
      await findingsApi.update(finding.id, { assigneeId: selectedUserId });
      setReassignOpen(false);
      setSelectedUserId("");
      onRefetch();
    } catch (err) {
      console.error("Failed to reassign:", err);
    } finally {
      setIsReassigning(false);
    }
  };

  const getAssigneeInitials = () => {
    if (finding.assignee?.initials) {
      return finding.assignee.initials;
    }
    if (finding.assignee?.name) {
      return finding.assignee.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return "??";
  };

  const getAssigneeName = () => {
    return finding.assignee?.name || "Unassigned";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border/50">
        <DialogHeader className="pr-8">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-xs font-mono text-muted-foreground">{finding.id}</span>
            <Badge variant="outline" className={cn("text-[10px] uppercase", severity.color, severity.bg, severity.border)}>
              {finding.severity}
            </Badge>
            <Badge variant="outline" className={cn("gap-1 text-[10px]", status.color, status.bg, status.border)}>
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
            <Badge variant="outline" className={cn(
              "font-mono text-[10px]",
              cvssScore >= 9.0 ? "border-red-500/50 text-red-500 bg-red-500/10"
                : cvssScore >= 7.0 ? "border-orange-500/50 text-orange-500 bg-orange-500/10"
                  : cvssScore >= 4.0 ? "border-yellow-500/50 text-yellow-500 bg-yellow-500/10"
                    : "border-green-500/50 text-green-500 bg-green-500/10"
            )}>
              CVSS {cvssScore.toFixed(1)}
            </Badge>
          </div>
          <DialogTitle className="text-xl">{finding.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-sm">
            <Server className="h-4 w-4" />
            <span className="font-mono">{finding.asset?.name || "N/A"}</span>
            {cweId && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="font-mono">{cweId}</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</h4>
            <p className="text-sm leading-relaxed">{finding.description || "No description provided"}</p>
          </div>

          {/* Remediation */}
          {(finding.remediation || finding.recommendation) && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Remediation</h4>
              <p className="text-sm leading-relaxed">{finding.remediation || finding.recommendation}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">CVSS Score</p>
              <p className="text-xl font-bold font-mono">{cvssScore.toFixed(1)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">CWE</p>
              <p className="text-sm font-mono">{cweId || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Created</p>
              <p className="text-sm font-mono">{createdAt ? new Date(createdAt).toLocaleDateString() : "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Due Date</p>
              <p className="text-sm font-mono">{dueDate ? new Date(dueDate).toLocaleDateString() : "N/A"}</p>
            </div>
          </div>

          {/* Assignee & Assessment */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-border/50">
                <AvatarFallback className="text-sm bg-primary/10 text-primary font-semibold">
                  {getAssigneeInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{getAssigneeName()}</p>
                <p className="text-xs text-muted-foreground">Assignee</p>
              </div>
            </div>
            {finding.assessment && (
              <div className="text-right">
                <Link href={`/assessments/${finding.assessment.id}`} className="text-sm font-medium flex items-center gap-1.5 justify-end text-primary hover:underline">
                  <Shield className="h-4 w-4" />
                  {finding.assessment.name || "View Assessment"}
                </Link>
                <p className="text-xs text-muted-foreground">Source Assessment</p>
              </div>
            )}
          </div>

          {/* Tags */}
          {finding.tags && finding.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tags</h4>
              <div className="flex flex-wrap gap-1.5">
                {finding.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs bg-muted/50 border-border/50">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Evidence */}
          {finding.evidence && finding.evidence.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Evidence ({finding.evidence.length})
              </h4>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50">
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-mono font-semibold">{finding.evidence.length}</p>
                    <p className="text-[10px] text-muted-foreground">Attachments</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4 border-t border-border/50">
            {/* Hidden file input for evidence upload */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf,.txt,.log,.json,.xml,.har"
              onChange={handleEvidenceUpload}
            />
            <Button
              variant="outline"
              size="sm"
              className="border-border/50"
              disabled={isUploadingEvidence}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploadingEvidence ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Paperclip className="mr-2 h-4 w-4" />
              )}
              {isUploadingEvidence ? "Uploading..." : "Add Evidence"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-border/50"
              onClick={() => setReassignOpen(true)}
            >
              <User className="mr-2 h-4 w-4" />
              Reassign
            </Button>
            <Button variant="outline" size="sm" className="border-border/50" asChild>
              <Link href={`/findings/${finding.id}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Full Details
              </Link>
            </Button>
            <div className="flex-1" />
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleMarkResolved}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark Resolved
            </Button>
          </div>
          {evidenceError && (
            <p className="text-xs text-red-500 mt-1">{evidenceError}</p>
          )}
        </div>
      </DialogContent>

      {/* Reassign Dialog */}
      <Dialog open={reassignOpen} onOpenChange={setReassignOpen}>
        <DialogContent className="max-w-sm bg-card border-border/50">
          <DialogHeader>
            <DialogTitle>Reassign Finding</DialogTitle>
            <DialogDescription>Select a team member to assign this finding to.</DialogDescription>
          </DialogHeader>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="bg-muted/30 border-border/50">
              <SelectValue placeholder="Select analyst..." />
            </SelectTrigger>
            <SelectContent>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} — <span className="text-muted-foreground capitalize">{u.role}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReassignOpen(false)} disabled={isReassigning} className="border-border/50">
              Cancel
            </Button>
            <Button onClick={handleReassign} disabled={!selectedUserId || isReassigning}>
              {isReassigning ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Reassigning...</>
              ) : (
                "Reassign"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}