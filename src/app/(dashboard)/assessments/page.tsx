"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Calendar,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  MoreHorizontal,
  FileText,
  ExternalLink,
  Package,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
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
import { CreateAssessmentDialog } from "@/components/assessments/create-assessment-dialog";
import { useAssets } from "@/hooks/use-data";
import { useAssessments, useProducts } from "@/hooks/use-data";
import { assessmentsApi } from "@/lib/api";
import { ListPageSkeleton } from "@/components/shared/skeletons";
import { ErrorState, EmptyState } from "@/components/shared/empty-state";
import type { Assessment, AssessmentStatus, Criticality } from "@/types";

// =============================================================================
// CONFIGURATION
// =============================================================================

const statusConfig: Record<AssessmentStatus, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  planned: {
    label: "Planned",
    icon: Calendar,
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
  },
  "in_progress": {
    label: "In Progress",
    icon: PlayCircle,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  "pending_review": {
    label: "Pending Review",
    icon: AlertCircle,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
  cancelled: {
    label: "Cancelled",
    icon: AlertCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
};

const priorityConfig: Record<Criticality, { color: string; bg: string; border: string }> = {
  critical: { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  high: { color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  medium: { color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  low: { color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
};

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function AssessmentsPage() {
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [productFilter, setProductFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  //fetch assets for the dialog dropdown
  const { data: assets } = useAssets();

  // Fetch data from API
  const { data: assessments, isLoading, error, refetch } = useAssessments({
    search: searchQuery || undefined,
    status: statusFilter !== "all" ? statusFilter as AssessmentStatus : undefined,
    productId: productFilter !== "all" ? productFilter : undefined,
  });

  // Fetch products for filter dropdown
  const { data: products } = useProducts();

  // Calculate stats from data
  const stats = React.useMemo(() => ({
    total: assessments.length,
    inProgress: assessments.filter((a) => a.status === "in_progress").length,
    completed: assessments.filter((a) => a.status === "completed").length,
    planned: assessments.filter((a) => a.status === "planned").length,
  }), [assessments]);

  if (isLoading) {
    return <ListPageSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title="Failed to load assessments"
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
          <h1 className="text-2xl font-bold tracking-tight">Assessments</h1>
          <p className="text-sm text-muted-foreground">
            Manage and track security assessments across your organization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={refetch} className="border-border/50">
            <RefreshCw className="h-4 w-4" />
          </Button>
          {/* <Link href="/assessments/new"> */}
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Assessment
            </Button>
          {/* </Link> */}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard title="Total Assessments" value={stats.total} icon={Shield} color="primary" />
        <StatsCard title="In Progress" value={stats.inProgress} icon={PlayCircle} color="blue" />
        <StatsCard title="Completed" value={stats.completed} icon={CheckCircle2} color="green" />
        <StatsCard title="Planned" value={stats.planned} icon={Calendar} color="slate" />
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-3 w-full sm:w-auto flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search assessments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/30 border-border/50 focus:border-primary/50"
            />
          </div>

          {/* Product Filter */}
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

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-muted/30 border-border/50">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending_review">Pending Review</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Toggle */}
        <Tabs value={view} onValueChange={(v) => setView(v as "grid" | "list")}>
          <TabsList className="bg-muted/30 border border-border/50">
            <TabsTrigger value="grid" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Grid</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-mono font-medium text-foreground">{assessments.length}</span> assessments
      </p>

      {/* Empty State */}
      {assessments.length === 0 && (
        <EmptyState
          icon={Shield}
          title="No assessments found"
          description="Try adjusting your search or filter criteria, or create a new assessment."
          action={{
            label: "New Assessment",
            onClick: () => setCreateDialogOpen(true),
            icon: Plus,
          }}
        />
      )}

      {/* Assessments Grid */}
      {view === "grid" && assessments.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assessments.map((assessment) => (
            <AssessmentCard key={assessment.id} assessment={assessment} onDelete={refetch} />
          ))}
        </div>
      )}

      {/* Assessments List */}
      {view === "list" && assessments.length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {assessments.map((assessment) => (
                <AssessmentRow key={assessment.id} assessment={assessment} onDelete={refetch} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <CreateAssessmentDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        assets={assets}
        onSuccess={refetch}
      />
    </div>
  );
}

// =============================================================================
// STATS CARD COMPONENT
// =============================================================================

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: "primary" | "blue" | "green" | "slate";
}

function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
  const colorClasses = {
    primary: { bg: "bg-primary/10", text: "text-primary" },
    blue: { bg: "bg-blue-500/10", text: "text-blue-500" },
    green: { bg: "bg-green-500/10", text: "text-green-500" },
    slate: { bg: "bg-slate-500/10", text: "text-slate-400" },
  };

  const colors = colorClasses[color];

  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", colors.bg)}>
            <Icon className={cn("h-4 w-4", colors.text)} />
          </div>
          <div>
            <p className={cn("text-2xl font-bold font-mono", colors.text)}>{value}</p>
            <p className="text-xs text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// ASSESSMENT CARD COMPONENT (Grid View)
// =============================================================================

function AssessmentCard({ assessment, onDelete }: { assessment: Assessment; onDelete?: () => void }) {
  const router = useRouter();
  const status = statusConfig[assessment.status] || statusConfig.planned;
  const priority = priorityConfig[assessment.priority || "medium"];
  const StatusIcon = status.icon;
  const fc = assessment.findingsCount || { critical: 0, high: 0, medium: 0, low: 0 };
  const totalFindings = fc.critical + fc.high + fc.medium + fc.low;

  const handleGenerateReport = async () => {
    try { await assessmentsApi.generateReport(assessment.id, "executive"); } catch { }
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const getAssigneeInitials = () => {
    if (assessment.assignee?.initials) return assessment.assignee.initials;
    if (assessment.assignee?.name) {
      return assessment.assignee.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return "??";
  };

  const getAssigneeName = () => assessment.assignee?.name || "Unassigned";

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await assessmentsApi.delete(assessment.id);
      if (response.success) {
        setDeleteDialogOpen(false);
        onDelete?.();
      }
    } catch {
      // silent — dialog stays open so user can retry
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Link href={`/assessments/${assessment.id}`}>
        <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-200 group h-full">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground">{assessment.id}</span>
                  {assessment.priority && (
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] uppercase", priority.color, priority.bg, priority.border)}
                    >
                      {assessment.priority}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-base font-semibold truncate group-hover:text-primary transition-colors">
                  {assessment.name}
                </CardTitle>
                <CardDescription className="text-xs truncate">
                  {assessment.type} • {assessment.asset?.name || "No asset"}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border/50">
                  <DropdownMenuItem className="cursor-pointer" onSelect={() => router.push(`/assessments/${assessment.id}`)}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onSelect={handleGenerateReport}>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-500 cursor-pointer"
                    onSelect={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status & Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={cn("gap-1", status.color, status.bg, status.border)}>
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>
                <span className="text-xs font-mono text-muted-foreground">{assessment.progress || 0}%</span>
              </div>
              <Progress value={assessment.progress || 0} className="h-1.5 bg-muted/30" />
            </div>

            {/* Findings Summary */}
            {totalFindings > 0 ? (
              <div className="flex items-center gap-1.5">
                {fc.critical > 0 && (
                  <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-500 border-red-500/20">
                    {fc.critical}C
                  </Badge>
                )}
                {fc.high > 0 && (
                  <Badge variant="outline" className="text-[10px] bg-orange-500/10 text-orange-500 border-orange-500/20">
                    {fc.high}H
                  </Badge>
                )}
                {fc.medium > 0 && (
                  <Badge variant="outline" className="text-[10px] bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                    {fc.medium}M
                  </Badge>
                )}
                {fc.low > 0 && (
                  <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20">
                    {fc.low}L
                  </Badge>
                )}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">No findings yet</div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 border border-border/50">
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                    {getAssigneeInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{getAssigneeName()}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {assessment.dueDate ? new Date(assessment.dueDate).toLocaleDateString() : "No due date"}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">{assessment.name}</span>?
              This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// =============================================================================
// ASSESSMENT ROW COMPONENT (List View)
// =============================================================================

function AssessmentRow({ assessment, onDelete }: { assessment: Assessment; onDelete?: () => void }) {
  const router = useRouter();
  const status = statusConfig[assessment.status] || statusConfig.planned;
  const priority = priorityConfig[assessment.priority || "medium"];
  const StatusIcon = status.icon;
  const fc = assessment.findingsCount || { critical: 0, high: 0, medium: 0, low: 0 };

  const handleGenerateReport = async () => {
    try { await assessmentsApi.generateReport(assessment.id, "executive"); } catch { }
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const getAssigneeInitials = () => {
    if (assessment.assignee?.initials) return assessment.assignee.initials;
    if (assessment.assignee?.name) {
      return assessment.assignee.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return "??";
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await assessmentsApi.delete(assessment.id);
      if (response.success) {
        setDeleteDialogOpen(false);
        onDelete?.();
      }
    } catch {
      // silent — dialog stays open so user can retry
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Link href={`/assessments/${assessment.id}`}>
        <div className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer group">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={cn("gap-1 shrink-0", status.color, status.bg, status.border)}
              >
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </Badge>
              <span className="text-[10px] font-mono text-muted-foreground">{assessment.id}</span>
              <p className="font-medium truncate group-hover:text-primary transition-colors">
                {assessment.name}
              </p>
            </div>
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                <span className="font-mono">{assessment.asset?.name || "No asset"}</span>
              </span>
              <span>{assessment.type}</span>
              {assessment.priority && (
                <Badge
                  variant="outline"
                  className={cn("text-[10px] uppercase", priority.color, priority.bg, priority.border)}
                >
                  {assessment.priority}
                </Badge>
              )}
            </div>
          </div>

          {/* Findings Badges */}
          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            {fc.critical > 0 && (
              <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-500 border-red-500/20">
                {fc.critical}C
              </Badge>
            )}
            {fc.high > 0 && (
              <Badge variant="outline" className="text-[10px] bg-orange-500/10 text-orange-500 border-orange-500/20">
                {fc.high}H
              </Badge>
            )}
            {fc.medium > 0 && (
              <Badge variant="outline" className="text-[10px] bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                {fc.medium}M
              </Badge>
            )}
          </div>

          {/* Progress */}
          <div className="hidden lg:block w-28 shrink-0">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-mono">{assessment.progress || 0}%</span>
            </div>
            <Progress value={assessment.progress || 0} className="h-1.5 bg-muted/30" />
          </div>

          {/* Assignee */}
          <div className="flex items-center gap-2 shrink-0">
            <Avatar className="h-6 w-6 border border-border/50">
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                {getAssigneeInitials()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Due Date */}
          <div className="text-xs text-muted-foreground font-mono shrink-0 hidden sm:block">
            {assessment.dueDate ? new Date(assessment.dueDate).toLocaleDateString() : "N/A"}
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border/50">
              <DropdownMenuItem className="cursor-pointer" onSelect={() => router.push(`/assessments/${assessment.id}`)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onSelect={handleGenerateReport}>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500 cursor-pointer"
                onSelect={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Link>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">{assessment.name}</span>?
              This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
