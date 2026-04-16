"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  Server,
  Calendar,
  User,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  Edit,
  Trash2,
  FileText,
  ExternalLink,
  Copy,
  MoreHorizontal,
  Plus,
  Bug,
  Activity,
  ChevronRight,
  Users,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useAssessment } from "@/hooks/use-data";
import { assessmentsApi } from "@/lib/api";
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
import type { Assessment, Finding, AssessmentStatus, AssessmentType } from "@/types";

// =============================================================================
// CONFIG
// =============================================================================

const typeConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pentest: { label: "Penetration Test", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  vulnerability_scan: { label: "Vulnerability Scan", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  code_review: { label: "Code Review", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  audit: { label: "Security Audit", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  red_team: { label: "Red Team", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  // Fallback for any type
  default: { label: "Assessment", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
};

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  planned: { label: "Planned", color: "text-muted-foreground", bg: "bg-muted/50", border: "border-border/50", icon: Calendar },
  in_progress: { label: "In Progress", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: Play },
  completed: { label: "Completed", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20", icon: CheckCircle2 },
  paused: { label: "Paused", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: Pause },
  cancelled: { label: "Cancelled", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", icon: XCircle },
  // Fallback
  default: { label: "Unknown", color: "text-muted-foreground", bg: "bg-muted/50", border: "border-border/50", icon: Clock },
};

const severityConfig: Record<string, { color: string; bg: string; border: string }> = {
  critical: { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  high: { color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  medium: { color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  low: { color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
  info: { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
};

const findingStatusConfig: Record<string, { color: string; bg: string }> = {
  open: { color: "text-red-500", bg: "bg-red-500/10" },
  in_progress: { color: "text-yellow-500", bg: "bg-yellow-500/10" },
  remediated: { color: "text-green-500", bg: "bg-green-500/10" },
  accepted: { color: "text-blue-500", bg: "bg-blue-500/10" },
  false_positive: { color: "text-muted-foreground", bg: "bg-muted/50" },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getTypeConfig(type: string) {
  return typeConfig[type] || typeConfig.default;
}

function getStatusConfig(status: string) {
  return statusConfig[status] || statusConfig.default;
}

function getFindingsCount(findings: Finding[] | undefined) {
  if (!findings || !Array.isArray(findings)) {
    return { total: 0, critical: 0, high: 0, medium: 0, low: 0, info: 0, open: 0, resolved: 0 };
  }
  
  return {
    total: findings.length,
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
    info: findings.filter(f => f.severity === 'info').length,
    open: findings.filter(f => f.status === 'open' || f.status === 'in_progress').length,
    resolved: findings.filter(f => f.status === 'remediated' || f.status === 'accepted').length,
  };
}

// =============================================================================
// LOADING COMPONENT
// =============================================================================

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading assessment...</p>
      </div>
    </div>
  );
}

// =============================================================================
// ERROR COMPONENT
// =============================================================================

function ErrorState({ error }: { error: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <XCircle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-red-500">{error}</p>
        <Button variant="outline" asChild>
          <Link href="/assessments">Back to Assessments</Link>
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;
  const [activeTab, setActiveTab] = React.useState("overview");
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const { data: assessment, isLoading, error } = useAssessment(assessmentId);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await assessmentsApi.delete(assessmentId);
      if (response.success) router.push("/assessments");
    } catch { } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !assessment) {
    return <ErrorState error={error || "Assessment not found"} />;
  }

  const type = getTypeConfig(assessment.type);
  const status = getStatusConfig(assessment.status);
  const StatusIcon = status.icon;
  const findingsCount = getFindingsCount(assessment.findings);

  // Calculate days remaining
  const dueDate = assessment.dueDate;
  const endDate = dueDate ? new Date(dueDate) : null;
  const today = new Date();
  const daysRemaining = endDate ? Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

  // Get dates
  const startDate = assessment.startDate ?? assessment.createdAt;
  const createdAt = assessment.createdAt;
  const updatedAt = assessment.updatedAt;

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/assessments" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Assessments
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-mono text-foreground">{assessment.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-border/50">
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Button variant="outline" size="sm" className="border-border/50">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 border-border/50">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border/50">
              <DropdownMenuItem
                className="cursor-pointer text-red-500 focus:text-red-500"
                onSelect={(e) => { e.preventDefault(); setDeleteDialogOpen(true); }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Assessment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className={cn("p-3 rounded-lg", type.bg, "border", type.border)}>
            <Shield className={cn("h-6 w-6", type.color)} />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={cn("text-[10px]", type.color, type.bg, type.border)}>
                {type.label}
              </Badge>
              <Badge variant="outline" className={cn("gap-1 text-[10px]", status.color, status.bg, status.border)}>
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </Badge>
              {daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 7 && (
                <Badge variant="outline" className="gap-1 text-[10px] bg-orange-500/10 text-orange-500 border-orange-500/20">
                  <Clock className="h-3 w-3" />
                  {daysRemaining}d remaining
                </Badge>
              )}
              {daysRemaining !== null && daysRemaining < 0 && (
                <Badge variant="outline" className="gap-1 text-[10px] bg-red-500/10 text-red-500 border-red-500/20">
                  <AlertTriangle className="h-3 w-3" />
                  {Math.abs(daysRemaining)}d overdue
                </Badge>
              )}
            </div>
            <h1 className="text-xl font-bold">{assessment.name}</h1>
            {assessment.description && (
              <p className="text-sm text-muted-foreground">{assessment.description}</p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-mono text-primary">{assessment.progress || 0}%</span>
            </div>
            <Progress value={assessment.progress || 0} className="h-2" />
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>Started {startDate ? new Date(startDate).toLocaleDateString() : 'N/A'}</span>
              <span>Due {endDate ? endDate.toLocaleDateString() : 'N/A'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Bug className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-primary">{findingsCount.total}</p>
                <p className="text-xs text-muted-foreground">Total Findings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-red-500">
                  {findingsCount.critical + findingsCount.high}
                </p>
                <p className="text-xs text-muted-foreground">Critical + High</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-yellow-500">{findingsCount.open}</p>
                <p className="text-xs text-muted-foreground">Open</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-green-500">{findingsCount.resolved}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/30 border border-border/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            Overview
          </TabsTrigger>
          <TabsTrigger value="findings" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            Findings ({findingsCount.total})
          </TabsTrigger>
          <TabsTrigger value="scope" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            Scope
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Findings Breakdown */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Findings by Severity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(['critical', 'high', 'medium', 'low', 'info'] as const).map((severity) => {
                      const count = findingsCount[severity];
                      const total = findingsCount.total || 1;
                      const config = severityConfig[severity];
                      return (
                        <div key={severity} className="flex items-center gap-3">
                          <span className={cn("text-xs uppercase w-16", config.color)}>{severity}</span>
                          <div className="flex-1 h-6 bg-muted/30 rounded-full overflow-hidden">
                            <div 
                              className={cn("h-full rounded-full", config.bg.replace('/10', ''))}
                              style={{ width: `${(count / total) * 100}%` }}
                            />
                          </div>
                          <span className="font-mono text-sm w-8 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Findings */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Recent Findings</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("findings")}>
                      View All
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {assessment.findings && assessment.findings.length > 0 ? (
                    <div className="space-y-2">
                      {assessment.findings.slice(0, 5).map((finding: Finding) => {
                        const severity = severityConfig[finding.severity] || severityConfig.medium;
                        const fStatus = findingStatusConfig[finding.status] || findingStatusConfig.open;
                        return (
                          <Link
                            key={finding.id}
                            href={`/findings/${finding.id}`}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors group"
                          >
                            <Badge variant="outline" className={cn("text-[10px] uppercase", severity.color, severity.bg, severity.border)}>
                              {finding.severity.slice(0, 1)}
                            </Badge>
                            <span className="flex-1 text-sm truncate group-hover:text-primary transition-colors">
                              {finding.title}
                            </span>
                            <Badge variant="outline" className={cn("text-[10px]", fStatus.color, fStatus.bg)}>
                              {finding.status.replace('_', ' ')}
                            </Badge>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No findings yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Assignee */}
              {assessment.assignee && (
                <Card className="bg-card/50 border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Assignee
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-border/50">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {assessment.assignee.name?.slice(0, 2).toUpperCase() || 'NA'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{assessment.assignee.name}</p>
                        <p className="text-xs text-muted-foreground">{assessment.assignee.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Asset */}
              {assessment.asset && (
                <Card className="bg-card/50 border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Server className="h-4 w-4" />
                      Target Asset
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link
                      href={`/assets/${assessment.asset.id}`}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30 transition-colors text-sm"
                    >
                      <Server className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono truncate">{assessment.asset.name}</span>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Details */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assessment.methodology && (
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Methodology</p>
                      <p className="text-sm">{assessment.methodology}</p>
                    </div>
                  )}
                  <Separator className="bg-border/50" />
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Created</p>
                    <p className="text-sm font-mono">{createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Last Updated</p>
                    <p className="text-sm font-mono">{updatedAt ? new Date(updatedAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="findings" className="mt-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">All Findings</CardTitle>
                <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
                  <Link href={`/findings?assessmentId=${assessmentId}&create=true`}>
                    <Plus className="mr-2 h-3.5 w-3.5" />
                    Add Finding
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {assessment.findings && assessment.findings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assessment.findings.map((finding: Finding) => {
                      const severity = severityConfig[finding.severity] || severityConfig.medium;
                      const fStatus = findingStatusConfig[finding.status] || findingStatusConfig.open;
                      return (
                        <TableRow key={finding.id} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-xs">{finding.id}</TableCell>
                          <TableCell>
                            <Link href={`/findings/${finding.id}`} className="hover:text-primary transition-colors">
                              {finding.title}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("text-[10px] uppercase", severity.color, severity.bg, severity.border)}>
                              {finding.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("text-[10px]", fStatus.color, fStatus.bg)}>
                              {finding.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <Link href={`/findings/${finding.id}`}>
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bug className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No findings recorded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scope" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  In Scope
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assessment.scope ? (
                  <p className="text-sm whitespace-pre-line">{assessment.scope}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No scope defined</p>
                )}
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Out of Scope
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No exclusions defined</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

      </Tabs>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{assessment?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete Assessment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}