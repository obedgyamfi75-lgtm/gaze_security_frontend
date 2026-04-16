"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  FileText,
  Download,
  MoreHorizontal,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileDown,
  Trash2,
  BarChart3,
  Shield,
  Bug,
  Server,
  FileSpreadsheet,
  FileIcon,
  File,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useReports, useAssessments } from "@/hooks/use-data";
import { reportsApi } from "@/lib/api";
import { ListPageSkeleton } from "@/components/shared/skeletons";
import { ErrorState, EmptyState } from "@/components/shared/empty-state";
import type { Report, ReportType, ReportStatus, ReportFormat } from "@/types";

// =============================================================================
// CONFIGURATION
// =============================================================================

const typeConfig: Record<ReportType, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  executive: { label: "Executive", icon: BarChart3, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  technical: { label: "Technical", icon: Bug, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  compliance: { label: "Compliance", icon: Shield, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
  full: { label: "Full Report", icon: Server, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  custom: { label: "Custom", icon: FileText, color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
};

const statusConfig: Record<ReportStatus, { label: string; icon: React.ElementType; color: string; bg: string; border: string; animate?: boolean }> = {
  pending: { label: "Pending", icon: Loader2, color: "text-muted-foreground", bg: "bg-muted/50", border: "border-border/50", animate: false },
  generating: { label: "Generating", icon: Loader2, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20", animate: true },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
  failed: { label: "Failed", icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
};

const formatConfig: Record<ReportFormat, { icon: React.ElementType; color: string }> = {
  pdf: { icon: File, color: "text-red-500" },
  docx: { icon: FileIcon, color: "text-blue-500" },
  xlsx: { icon: FileSpreadsheet, color: "text-green-500" },
  html: { icon: FileText, color: "text-orange-500" },
};

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  // Fetch reports from API
  const { data: reports, isLoading, error, refetch } = useReports();

  // Fetch assessments for create dialog
  const { data: assessments } = useAssessments();

  // Filter reports client-side
  const filteredReports = React.useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || report.type === typeFilter;
      const matchesStatus = statusFilter === "all" || report.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [reports, searchQuery, typeFilter, statusFilter]);

  // Calculate stats
  const stats = React.useMemo(() => ({
    total: reports.length,
    completed: reports.filter((r) => r.status === "completed").length,
    generating: reports.filter((r) => r.status === "generating").length,
    failed: reports.filter((r) => r.status === "failed").length,
  }), [reports]);

  // Auto-refresh every 5s while any report is generating
  React.useEffect(() => {
    const hasGenerating = reports.some((r) => r.status === "generating");
    if (!hasGenerating) return;
    const id = setInterval(refetch, 5000);
    return () => clearInterval(id);
  }, [reports, refetch]);

  // Loading state
  if (isLoading) {
    return <ListPageSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title="Failed to load reports"
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
          <h1 className="text-2xl font-bold tracking-tight">Security Reports</h1>
          <p className="text-sm text-muted-foreground">
            Generate and manage security assessment reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={refetch} className="border-border/50">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <QuickStat label="Total Reports" value={stats.total} icon={FileText} color="primary" />
        <QuickStat label="Completed" value={stats.completed} icon={CheckCircle2} color="green" />
        <QuickStat label="Generating" value={stats.generating} icon={Loader2} color="yellow" />
        <QuickStat label="Failed" value={stats.failed} icon={AlertCircle} color="red" />
      </div>

      {/* Filters */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/30 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-36 bg-muted/30 border-border/50">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="full">Full Report</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 bg-muted/30 border-border/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="generating">Generating</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-mono font-medium text-foreground">{filteredReports.length}</span> reports
      </p>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <EmptyState
          icon={FileText}
          title="No reports found"
          description="Try adjusting your search or filter criteria, or generate a new report."
          action={{
            label: "Generate Report",
            onClick: () => setCreateDialogOpen(true),
            icon: Plus,
          }}
        />
      )}

      {/* Reports Grid */}
      {filteredReports.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => (
            <ReportCard key={report.id} report={report} onRefetch={refetch} />
          ))}
        </div>
      )}

      {/* Create Report Dialog */}
      <CreateReportDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        assessments={assessments}
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
    green: { bg: "bg-green-500/10", text: "text-green-500" },
    yellow: { bg: "bg-yellow-500/10", text: "text-yellow-500" },
    red: { bg: "bg-red-500/10", text: "text-red-500" },
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
// REPORT CARD COMPONENT
// =============================================================================

function ReportCard({ report, onRefetch }: { report: Report; onRefetch: () => void }) {
  const type = typeConfig[report.type] || typeConfig.custom;
  const status = statusConfig[report.status] || statusConfig.generating;
  const format = formatConfig[report.format] || formatConfig.pdf;
  const TypeIcon = type.icon;
  const StatusIcon = status.icon;
  const FormatIcon = format.icon;

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDownload = async () => {
    try {
      await reportsApi.download(report.id);
    } catch {
      // silent
    }
  };

  // const handleDownload = () => {
  //   window.open(`/api/reports/${report.id}/download`, "_blank");
  // };

  const handleRetry = async () => {
    try {
      await reportsApi.generate({
        type: report.type,
        format: report.format,
        assessmentId: report.assessmentId,
      });
      onRefetch();
    } catch {
      // silent
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await reportsApi.delete(report.id);
      setDeleteDialogOpen(false);
      onRefetch();
    } catch {
      // silent — dialog stays open so user can retry
    } finally {
      setIsDeleting(false);
    }
  };

  const getCreatorName = () => report.generatedBy?.name || "Unknown";
  const getCreatorInitials = () => {
    if (report.generatedBy?.initials) return report.generatedBy.initials;
    if (report.generatedBy?.name) {
      return report.generatedBy.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return "??";
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={cn("p-2 rounded-lg", type.bg, "border", type.border)}>
            <TypeIcon className={cn("h-4 w-4", type.color)} />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("gap-1 text-[10px]", status.color, status.bg, status.border)}>
              <StatusIcon className={cn("h-3 w-3", status.animate && "animate-spin")} />
              {status.label}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border/50">
                {report.status === "completed" && (
                  <>
                    <DropdownMenuItem className="cursor-pointer" onClick={handleDownload}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {report.status === "failed" && (
                  <DropdownMenuItem className="cursor-pointer" onClick={handleRetry}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry Generation
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="cursor-pointer text-red-500"
                  onSelect={(e) => { e.preventDefault(); setDeleteDialogOpen(true); }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-[10px] font-mono text-muted-foreground">{report.id}</p>
          <CardTitle className="text-sm mt-1 line-clamp-2 group-hover:text-primary transition-colors">
            {report.name}
          </CardTitle>
        </div>
        <CardDescription className="flex items-center gap-2 flex-wrap mt-2">
          <Badge variant="outline" className={cn("text-[10px]", type.color, type.bg, type.border)}>
            {type.label}
          </Badge>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <FormatIcon className={cn("h-3 w-3", format.color)} />
            <span className="uppercase">{report.format}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Meta Info */}
        {report.status === "completed" && report.fileSize && (
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>{formatFileSize(report.fileSize)}</span>
          </div>
        )}

        {/* Assessment Link */}
        {report.assessment && (
          <div className="text-[10px] text-muted-foreground truncate">
            <span className="text-muted-foreground/70">Source: </span>
            <Link href={`/assessments/${report.assessment.id}`} className="text-primary hover:underline">
              {report.assessment.name || "View Assessment"}
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-border/50 text-[10px] text-muted-foreground">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {getCreatorName()}
            </span>
            <span className="flex items-center gap-1 font-mono">
              <Calendar className="h-3 w-3" />
              {new Date(report.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Download Button for Completed Reports */}
        {report.status === "completed" && (
          <Button
            variant="outline"
            size="sm"
            className="w-full border-border/50 hover:border-primary/50 hover:bg-primary/5"
            onClick={handleDownload}
          >
            <Download className="mr-2 h-3.5 w-3.5" />
            Download Report
          </Button>
        )}
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">{report.name}</span>?
              This action cannot be undone.
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
    </Card>
  );
}

// =============================================================================
// CREATE REPORT DIALOG
// =============================================================================

interface CreateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessments: { id: string; name: string }[];
  onSuccess?: () => void;
}

function CreateReportDialog({ open, onOpenChange, assessments, onSuccess }: CreateReportDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [reportType, setReportType] = React.useState<ReportType>("executive");
  const [reportFormat, setReportFormat] = React.useState<ReportFormat>("pdf");
  const [selectedAssessment, setSelectedAssessment] = React.useState("");
  const [includeOptions, setIncludeOptions] = React.useState({
    evidence: true,
    remediation: true,
    metrics: true,
    timeline: false,
  });

  const handleSubmit = async () => {
    if (!selectedAssessment || selectedAssessment == "all"){
      // show toast/error 
      return ;
    }
    setIsSubmitting(true);
    try {
      await reportsApi.generate({
        type: reportType,
        format: reportFormat,
        assessmentId: selectedAssessment,
        options: {
          include_evidence: includeOptions.evidence,
          include_remediation: includeOptions.remediation,
          include_metrics: includeOptions.metrics,
          include_timeline: includeOptions.timeline,
        },
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Failed to generate report:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border/50">
        <DialogHeader>
          <DialogTitle>Generate New Report</DialogTitle>
          <DialogDescription>
            Create a security report from your assessments and findings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Report Type */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Report Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["executive", "technical", "compliance", "full"] as ReportType[]).map((key) => {
                const config = typeConfig[key];
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setReportType(key)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border text-left transition-all",
                      reportType === key
                        ? "border-primary/50 bg-primary/5"
                        : "border-border/50 hover:border-primary/30 hover:bg-muted/30"
                    )}
                  >
                    <div className={cn("p-1.5 rounded", config.bg)}>
                      <Icon className={cn("h-4 w-4", config.color)} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{config.label}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {key === "executive" && "High-level summary"}
                        {key === "technical" && "Detailed findings"}
                        {key === "compliance" && "Regulatory focus"}
                        {key === "full" && "Complete assessment"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Source Assessment */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Source Assessment</Label>
            <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
              <SelectTrigger className="bg-muted/30 border-border/50">
                <SelectValue placeholder="Select an assessment..." />
              </SelectTrigger>
              <SelectContent>
                {assessments.map((assessment) => (
                  <SelectItem key={assessment.id} value={assessment.id}>{assessment.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Output Format */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Output Format</Label>
            <div className="flex gap-2">
              {(["pdf", "docx", "xlsx"] as ReportFormat[]).map((key) => {
                const config = formatConfig[key];
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setReportFormat(key)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
                      reportFormat === key
                        ? "border-primary/50 bg-primary/5"
                        : "border-border/50 hover:border-primary/30"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", config.color)} />
                    <span className="text-sm uppercase">{key}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Include Options */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Include in Report</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="include-evidence" 
                  checked={includeOptions.evidence}
                  onCheckedChange={(c) => setIncludeOptions(prev => ({ ...prev, evidence: !!c }))}
                />
                <label htmlFor="include-evidence" className="text-sm">Evidence & Screenshots</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="include-remediation" 
                  checked={includeOptions.remediation}
                  onCheckedChange={(c) => setIncludeOptions(prev => ({ ...prev, remediation: !!c }))}
                />
                <label htmlFor="include-remediation" className="text-sm">Remediation Steps</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="include-metrics" 
                  checked={includeOptions.metrics}
                  onCheckedChange={(c) => setIncludeOptions(prev => ({ ...prev, metrics: !!c }))}
                />
                <label htmlFor="include-metrics" className="text-sm">Risk Metrics & Charts</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="include-timeline" 
                  checked={includeOptions.timeline}
                  onCheckedChange={(c) => setIncludeOptions(prev => ({ ...prev, timeline: !!c }))}
                />
                <label htmlFor="include-timeline" className="text-sm">Remediation Timeline</label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border/50">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}