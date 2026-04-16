"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Bug,
  Shield,
  Server,
  User,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Trash2,
  Paperclip,
  Image,
  FileText,
  Code,
  ExternalLink,
  Copy,
  MoreHorizontal,
  Plus,
  Tag,
  ChevronRight,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useFinding, useUsers } from "@/hooks/use-data";
import { findingsApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import type { Finding, FindingStatus, Evidence } from "@/types";

// =============================================================================
// CONFIGURATION
// =============================================================================

const severityConfig: Record<string, { color: string; bg: string; border: string }> = {
  critical: { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  high: { color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  medium: { color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  low: { color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
  info: { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
};

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  open: { label: "Open", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", icon: AlertTriangle },
  in_progress: { label: "In Progress", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: Clock },
  remediated: { label: "Remediated", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: CheckCircle2 },
  verified: { label: "Verified", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20", icon: CheckCircle2 },
  false_positive: { label: "False Positive", color: "text-muted-foreground", bg: "bg-muted/50", border: "border-border/50", icon: XCircle },
  accepted: { label: "Accepted", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", icon: Shield },
  duplicate: { label: "Duplicate", color: "text-muted-foreground", bg: "bg-muted/50", border: "border-border/50", icon: XCircle },
};

// =============================================================================
// LOADING COMPONENT
// =============================================================================

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading finding...</p>
      </div>
    </div>
  );
}

// =============================================================================
// ERROR COMPONENT
// =============================================================================

function ErrorState({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <XCircle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-red-500">{error}</p>
        <div className="flex gap-2">
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/findings">Back to Findings</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function FindingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const findingId = params.id as string;

  const [activeTab, setActiveTab] = React.useState("details");
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isUploadingEvidence, setIsUploadingEvidence] = React.useState(false);
  const [reassignDialogOpen, setReassignDialogOpen] = React.useState(false);
  const [selectedAssigneeId, setSelectedAssigneeId] = React.useState("");
  const [isReassigning, setIsReassigning] = React.useState(false);
  const [addingTag, setAddingTag] = React.useState(false);
  const [newTag, setNewTag] = React.useState("");
  const evidenceInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch finding from API
  const { data: finding, isLoading, error, refetch } = useFinding(findingId);
  const { data: users } = useUsers();

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (error || !finding) {
    return <ErrorState error={error || "Finding not found"} onRetry={refetch} />;
  }

  const severity = severityConfig[finding.severity] || severityConfig.medium;
  const status = statusConfig[finding.status] || statusConfig.open;
  const StatusIcon = status.icon;

  // Calculate SLA status
  const dueDate = finding.slaDueDate;
  const dueDateObj = dueDate ? new Date(dueDate) : null;
  const today = new Date();
  const daysUntilDue = dueDateObj ? Math.ceil((dueDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
  const isUrgent = daysUntilDue !== null && daysUntilDue <= 3 && daysUntilDue >= 0;

  // Get CVSS score
  const cvssScore = finding.cvssScore;

  const handleStatusChange = async (newStatus: string) => {
    try {
      await findingsApi.updateStatus(finding.id, newStatus as FindingStatus);
      refetch();
    } catch {
      // silent
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await findingsApi.delete(finding.id);
      if (response.success) {
        router.push("/findings");
      }
    } catch {
      // silent — dialog stays open so user can retry
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingEvidence(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("description", file.name);
      await findingsApi.addEvidence(finding.id, formData);
      refetch();
      setActiveTab("evidence");
    } catch {
      // silent
    } finally {
      setIsUploadingEvidence(false);
      if (evidenceInputRef.current) evidenceInputRef.current.value = "";
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
  };

  const handleReassign = async () => {
    if (!selectedAssigneeId) return;
    setIsReassigning(true);
    try {
      const response = await findingsApi.update(findingId, { assigneeId: selectedAssigneeId });
      if (response.success) { setReassignDialogOpen(false); refetch(); }
    } catch { } finally {
      setIsReassigning(false);
    }
  };

  const handleAddTag = async () => {
    const tag = newTag.trim();
    if (!tag) return;
    const existing = finding?.tags ?? [];
    if (existing.includes(tag)) { setNewTag(""); setAddingTag(false); return; }
    try {
      const response = await findingsApi.update(findingId, { tags: [...existing, tag] });
      if (response.success) { setNewTag(""); setAddingTag(false); refetch(); }
    } catch { }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/findings" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Findings
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-mono text-foreground">{finding.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={refetch} className="h-9 w-9 border-border/50">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 border-border/50">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border/50">
              <DropdownMenuItem className="cursor-pointer" onSelect={handleCopyLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-500"
                onSelect={(e) => { e.preventDefault(); setDeleteDialogOpen(true); }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Finding
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className={cn("p-3 rounded-lg", severity.bg, "border", severity.border)}>
            <Bug className={cn("h-6 w-6", severity.color)} />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={cn("uppercase text-[10px]", severity.color, severity.bg, severity.border)}>
                {finding.severity}
              </Badge>
              <Badge variant="outline" className={cn("gap-1 text-[10px]", status.color, status.bg, status.border)}>
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </Badge>
              {cvssScore && (
                <Badge variant="outline" className={cn(
                  "font-mono text-[10px]",
                  cvssScore >= 9.0 ? "border-red-500/50 text-red-500 bg-red-500/10"
                    : cvssScore >= 7.0 ? "border-orange-500/50 text-orange-500 bg-orange-500/10"
                    : cvssScore >= 4.0 ? "border-yellow-500/50 text-yellow-500 bg-yellow-500/10"
                    : "border-green-500/50 text-green-500 bg-green-500/10"
                )}>
                  CVSS {cvssScore.toFixed(1)}
                </Badge>
              )}
              {isOverdue && (
                <Badge variant="outline" className="gap-1 text-[10px] bg-red-500/10 text-red-500 border-red-500/20">
                  <AlertTriangle className="h-3 w-3" />
                  {Math.abs(daysUntilDue!)}d overdue
                </Badge>
              )}
              {isUrgent && (
                <Badge variant="outline" className="gap-1 text-[10px] bg-orange-500/10 text-orange-500 border-orange-500/20">
                  <Clock className="h-3 w-3" />
                  {daysUntilDue}d left
                </Badge>
              )}
            </div>
            <h1 className="text-xl font-bold">{finding.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Server className="h-4 w-4" />
                <span className="font-mono">{finding.asset?.name || "Unknown Asset"}</span>
              </span>
              {finding.cweId && (
                <span className="font-mono">{finding.cweId}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted/30 border border-border/50">
              <TabsTrigger value="details" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                Details
              </TabsTrigger>
              <TabsTrigger value="evidence" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                Evidence ({finding.evidence?.length || finding.evidenceCount || 0})
              </TabsTrigger>
              <TabsTrigger value="remediation" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                Remediation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-6">
              {/* Description */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm prose-invert max-w-none">
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {finding.description || "No description provided"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Details */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Technical Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {finding.affectedComponent && (
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Affected Component</p>
                        <p className="text-sm font-mono bg-muted/30 px-2 py-1 rounded">
                          {finding.affectedComponent}
                        </p>
                      </div>
                    )}
                    {finding.affectedUrl && (
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Affected URL</p>
                        <p className="text-sm font-mono bg-muted/30 px-2 py-1 rounded truncate">
                          {finding.affectedUrl}
                        </p>
                      </div>
                    )}
                    {finding.cweId && (
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">CWE</p>
                        <p className="text-sm font-mono text-primary">{finding.cweId}</p>
                      </div>
                    )}
                    {finding.cveId && (
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">CVE ID</p>
                        <Badge variant="outline" className="font-mono text-xs">
                          {finding.cveId}
                        </Badge>
                      </div>
                    )}
                    {finding.owaspCategory && (
                      <div className="space-y-1 col-span-2">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">OWASP Category</p>
                        <p className="text-sm">{finding.owaspCategory}</p>
                      </div>
                    )}
                  </div>
                  {finding.stepsToReproduce && (
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Steps to Reproduce</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {finding.stepsToReproduce}
                      </p>
                    </div>
                  )}
                  {finding.impact && (
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Impact</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{finding.impact}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evidence" className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {finding.evidence?.length || finding.evidenceCount || 0} pieces of evidence
                </p>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                  disabled={isUploadingEvidence}
                  onClick={() => evidenceInputRef.current?.click()}
                >
                  {isUploadingEvidence ? (
                    <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Uploading...</>
                  ) : (
                    <><Plus className="mr-2 h-3.5 w-3.5" />Add Evidence</>
                  )}
                </Button>
              </div>
              {finding.evidence && finding.evidence.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {finding.evidence.map((item: Evidence) => (
                    <EvidenceCard key={item.id} evidence={item} findingId={finding.id} onDelete={refetch} />
                  ))}
                </div>
              ) : (
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="p-8 text-center">
                    <Paperclip className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground">No evidence attached yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="remediation" className="mt-6">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Remediation Steps</CardTitle>
                  <CardDescription>Recommended actions to fix this vulnerability</CardDescription>
                </CardHeader>
                <CardContent>
                  {(finding.remediation || finding.recommendation) ? (
                    <ScrollArea className="h-[400px]">
                      <pre className="text-sm whitespace-pre-wrap font-mono text-muted-foreground">
                        {finding.remediation || finding.recommendation}
                      </pre>
                    </ScrollArea>
                  ) : (
                    <p className="text-sm text-muted-foreground">No remediation steps provided yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Select value={finding.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="bg-muted/30 border-border/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="remediated">Remediated</SelectItem>
                  <SelectItem value="false_positive">False Positive</SelectItem>
                  <SelectItem value="accepted">Risk Accepted</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full border-border/50" onClick={() => setReassignDialogOpen(true)}>
                <User className="mr-2 h-4 w-4" />
                Reassign
              </Button>
              <Button
                variant="outline"
                className="w-full border-border/50"
                disabled={isUploadingEvidence}
                onClick={() => evidenceInputRef.current?.click()}
              >
                <Paperclip className="mr-2 h-4 w-4" />
                {isUploadingEvidence ? "Uploading..." : "Add Evidence"}
              </Button>
            </CardContent>
          </Card>

          {/* Details */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {finding.assignee && (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Assignee</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 border border-border/50">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                        {finding.assignee.name?.slice(0, 2).toUpperCase() || 'NA'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{finding.assignee.name}</span>
                  </div>
                </div>
              )}
              {finding.createdBy && (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Created By</p>
                  <span className="text-sm">{finding.createdBy}</span>
                </div>
              )}
              <Separator className="bg-border/50" />
              {finding.assessment && (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Assessment</p>
                  <Link href={`/assessments/${finding.assessment.id}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5" />
                    {finding.assessment.name}
                  </Link>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Asset</p>
                {finding.asset ? (
                  <Link href={`/assets/${finding.asset.id}`} className="text-sm font-mono text-primary hover:underline">
                    {finding.asset.name}
                  </Link>
                ) : (
                  <p className="text-sm font-mono text-muted-foreground">Unknown</p>
                )}
              </div>
              <Separator className="bg-border/50" />
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Created</p>
                <p className="text-sm font-mono">
                  {new Date(finding.createdAt ?? "").toLocaleDateString()}
                </p>
              </div>
              {dueDate && (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Due Date</p>
                  <p className={cn("text-sm font-mono", isOverdue && "text-red-500")}>
                    {dueDateObj?.toLocaleDateString()}
                  </p>
                </div>
              )}
              {finding.slaStatus && (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">SLA Status</p>
                  <p className="text-sm">{finding.slaStatus}</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Last Updated</p>
                <p className="text-sm font-mono">
                  {new Date(finding.updatedAt ?? "").toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {finding.tags && finding.tags.length > 0 ? (
                  finding.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs bg-muted/50 border-border/50">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  !addingTag && <span className="text-xs text-muted-foreground">No tags</span>
                )}
                {addingTag ? (
                  <Input
                    autoFocus
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddTag();
                      if (e.key === "Escape") { setAddingTag(false); setNewTag(""); }
                    }}
                    onBlur={() => { if (!newTag.trim()) { setAddingTag(false); } }}
                    placeholder="Tag name..."
                    className="h-6 text-xs px-2 bg-muted/30 border-border/50 w-24"
                  />
                ) : (
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground" onClick={() => setAddingTag(true)}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden evidence file input */}
      <input
        ref={evidenceInputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf,.txt,.log,.json,.xml,.zip"
        onChange={handleEvidenceUpload}
      />

      {/* Reassign Dialog */}
      <Dialog open={reassignDialogOpen} onOpenChange={setReassignDialogOpen}>
        <DialogContent className="bg-card border-border/50 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reassign Finding</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Select value={selectedAssigneeId} onValueChange={setSelectedAssigneeId}>
              <SelectTrigger className="bg-muted/30 border-border/50">
                <SelectValue placeholder="Select assignee..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.firstName} {u.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-border/50" onClick={() => setReassignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleReassign} disabled={isReassigning || !selectedAssigneeId} className="bg-primary hover:bg-primary/90">
              {isReassigning ? "Reassigning..." : "Reassign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Finding Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Finding</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete <span className="font-semibold text-foreground">{finding.title}</span>?
              This will remove all associated evidence. This action cannot be undone.
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
    </div>
  );
}

// =============================================================================
// EVIDENCE CARD COMPONENT
// =============================================================================

function EvidenceCard({ evidence, findingId, onDelete }: { evidence: Evidence; findingId?: string; onDelete?: () => void }) {
  const getIcon = () => {
    switch (evidence.type) {
      case "screenshot": return <Image className="h-4 w-4 text-purple-500" />;
      case "request": return <Code className="h-4 w-4 text-blue-500" />;
      case "response": return <Code className="h-4 w-4 text-green-500" />;
      case "code": return <Code className="h-4 w-4 text-orange-500" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getBgColor = () => {
    switch (evidence.type) {
      case "screenshot": return "bg-purple-500/10";
      case "request": return "bg-blue-500/10";
      case "response": return "bg-green-500/10";
      case "code": return "bg-orange-500/10";
      default: return "bg-muted/50";
    }
  };

  const createdAt = evidence.createdAt;

  const handleDeleteEvidence = async () => {
    if (!findingId) return;
    try {
      await findingsApi.deleteEvidence(findingId, evidence.id);
      onDelete?.();
    } catch {
      // silent
    }
  };

  return (
    <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg", getBgColor())}>
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {evidence.filename || evidence.description || "Evidence"}
            </p>
            {createdAt && (
              <p className="text-xs text-muted-foreground font-mono">
                {new Date(createdAt).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {evidence.url && (
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <a href={evidence.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
            {findingId && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={handleDeleteEvidence}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}