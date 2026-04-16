"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Globe,
  Server,
  Smartphone,
  Cloud,
  Database,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Bug,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  ExternalLink,
  FileText,
  Settings,
  Calendar,
  Flame,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useProduct, useAssets, useFindings } from "@/hooks/use-data";
import { productsApi, reportsApi } from "@/lib/api";
import { DetailPageSkeleton } from "@/components/shared/skeletons";
import { ErrorState, EmptyState } from "@/components/shared/empty-state";
import type { Product, Asset, Finding, AssetType, Criticality } from "@/types";

// =============================================================================
// CONFIGURATION
// =============================================================================

const typeConfig: Record<AssetType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  web: { icon: Globe, color: "text-blue-500", bg: "bg-blue-500/10", label: "Web" },
  api: { icon: Server, color: "text-purple-500", bg: "bg-purple-500/10", label: "API" },
  mobile: { icon: Smartphone, color: "text-green-500", bg: "bg-green-500/10", label: "Mobile" },
  cloud: { icon: Cloud, color: "text-cyan-500", bg: "bg-cyan-500/10", label: "Cloud" },
  database: { icon: Database, color: "text-orange-500", bg: "bg-orange-500/10", label: "Database" },
};

const criticalityConfig: Record<Criticality, { color: string; bg: string; border: string }> = {
  critical: { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  high: { color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  medium: { color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  low: { color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
};

const statusColors: Record<string, { color: string; bg: string }> = {
  active: { color: "text-green-500", bg: "bg-green-500/10" },
  development: { color: "text-blue-500", bg: "bg-blue-500/10" },
  deprecated: { color: "text-yellow-500", bg: "bg-yellow-500/10" },
  archived: { color: "text-muted-foreground", bg: "bg-muted/50" },
};

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [activeTab, setActiveTab] = React.useState("overview");
  const [assetTypeFilter, setAssetTypeFilter] = React.useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [reportDialogOpen, setReportDialogOpen] = React.useState(false);

  // Fetch data from API
  const { data: product, isLoading: productLoading, error: productError, refetch } = useProduct(productId);
  const { data: assets } = useAssets({ productId });
  const { data: findings } = useFindings({ productId });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await productsApi.delete(productId);
      if (response.success) {
        router.push("/products");
      }
    } catch { } finally {
      setIsDeleting(false);
    }
  };

  // Loading state
  if (productLoading) {
    return <DetailPageSkeleton />;
  }

  // Error state
  if (productError || !product) {
    return (
      <ErrorState
        title="Failed to load product"
        description={productError || "Product not found"}
        onRetry={refetch}
      />
    );
  }

  const scoreColor = product.securityScore >= 80 ? "text-green-500" : product.securityScore >= 60 ? "text-yellow-500" : "text-red-500";
  const statusStyle = statusColors[product.status] || statusColors.active;
  const critStyle = criticalityConfig[product.criticality] || criticalityConfig.medium;

  // Filter assets
  const filteredAssets = assetTypeFilter === "all" 
    ? assets 
    : assets.filter(a => a.type === assetTypeFilter);

  // Recent findings (top 5)
  const recentFindings = findings.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/products" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Products
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-mono text-foreground">{product.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={refetch} className="h-9 w-9 border-border/50">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="border-border/50" onClick={() => setReportDialogOpen(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Button variant="outline" size="sm" className="border-border/50" onClick={() => setEditDialogOpen(true)}>
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
              <DropdownMenuItem className="cursor-pointer" onSelect={() => setActiveTab("team")}>
                <Users className="mr-2 h-4 w-4" />
                Manage Team
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-500 focus:text-red-500"
                onSelect={(e) => { e.preventDefault(); setDeleteDialogOpen(true); }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
          <Package className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <Badge variant="outline" className={cn("text-[10px]", statusStyle.color, statusStyle.bg)}>
              {product.status}
            </Badge>
            <Badge variant="outline" className={cn("text-[10px]", critStyle.color, critStyle.bg, critStyle.border)}>
              {product.criticality}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{product.description || "No description"}</p>
          {product.compliance && product.compliance.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              {product.compliance.map((c) => (
                <Badge key={c} variant="outline" className="text-[10px] bg-muted/50 border-border/50">
                  <Shield className="h-3 w-3 mr-1" />
                  {c}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="text-center">
          <div className={cn("text-4xl font-bold font-mono", scoreColor)}>{product.securityScore}</div>
          <p className="text-xs text-muted-foreground">Security Score</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <QuickStat icon={Server} value={product.assetsCount || assets.length} label="Assets" color="primary" />
        <QuickStat icon={Flame} value={product.findingsCount?.critical || 0} label="Critical" color="red" />
        <QuickStat icon={AlertTriangle} value={product.findingsCount?.high || 0} label="High" color="orange" />
        <QuickStat icon={Bug} value={(product.findingsCount?.medium || 0) + (product.findingsCount?.low || 0)} label="Med/Low" color="yellow" />
        <QuickStat icon={Users} value={product.teamMembers?.length || 0} label="Team" color="blue" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/30 border border-border/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10">Overview</TabsTrigger>
          <TabsTrigger value="assets" className="data-[state=active]:bg-primary/10">Assets ({assets.length})</TabsTrigger>
          <TabsTrigger value="findings" className="data-[state=active]:bg-primary/10">Findings ({findings.length})</TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:bg-primary/10">Team</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Findings */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Recent Findings</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/findings?productId=${product.id}`}>View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentFindings.length > 0 ? (
                  <div className="space-y-3">
                    {recentFindings.map((finding) => (
                      <FindingRow key={finding.id} finding={finding} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No findings yet</p>
                )}
              </CardContent>
            </Card>

            {/* Product Info */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Owner</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 border border-border/50">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                        {/* {product.owner?.firstName?.[0]}{product.owner?.lastName?.[0]} */}
                        {product.owner?.name?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {/* {product.owner?.firstName} {product.owner?.lastName} */}
                      {product.owner?.name}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {product.owner?.email}
                    </span>
                  </div>
                </div>
                {product.lastAssessment && (
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Last Assessment</p>
                    <p className="text-sm font-mono">{new Date(product.lastAssessment).toLocaleDateString()}</p>
                  </div>
                )}
                {product.nextAssessment && (
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Next Assessment</p>
                    <p className="text-sm font-mono">{new Date(product.nextAssessment).toLocaleDateString()}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Created</p>
                  <p className="text-sm font-mono">{new Date(product.createdAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}>
              <SelectTrigger className="w-40 bg-muted/30 border-border/50">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="web">Web</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="cloud">Cloud</SelectItem>
                <SelectItem value="database">Database</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
              <Link href={`/assets?productId=${product.id}&create=true`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Asset
              </Link>
            </Button>
          </div>

          {filteredAssets.length > 0 ? (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Asset</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Environment</TableHead>
                      <TableHead>Findings</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.map((asset) => (
                      <AssetRow key={asset.id} asset={asset} />
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon={Server}
              title="No assets found"
              description="Add assets to this product to start tracking them."
              action={{ label: "Add Asset", href: `/assets?productId=${product.id}&create=true`, icon: Plus }}
            />
          )}
        </TabsContent>

        {/* Findings Tab */}
        <TabsContent value="findings" className="space-y-4 mt-6">
          {findings.length > 0 ? (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Finding</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Asset</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {findings.map((finding) => (
                      <FindingTableRow key={finding.id} finding={finding} />
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon={Bug}
              title="No findings"
              description="No security findings have been reported for this product yet."
            />
          )}
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{product.teamMembers?.length || 0} team members</p>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>
          {product.teamMembers && product.teamMembers.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {product.teamMembers.map((member) => (
                <Card key={member.id} className="bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border/50">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {member.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No team members"
              description="Add team members to collaborate on this product."
              action={{ label: "Add Member", onClick: () => {}, icon: Plus }}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{product.name}</strong>? This will permanently remove the product and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete Product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Product Dialog */}
      {editDialogOpen && (
        <EditProductDialog
          product={product}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={refetch}
        />
      )}

      {/* Generate Report Dialog */}
      {reportDialogOpen && (
        <GenerateReportDialog
          productId={product.id}
          productName={product.name}
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
        />
      )}
    </div>
  );
}

// =============================================================================
// EDIT PRODUCT DIALOG
// =============================================================================

function EditProductDialog({
  product,
  open,
  onOpenChange,
  onSuccess,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [name, setName] = React.useState(product.name);
  const [shortName, setShortName] = React.useState(product.shortName);
  const [description, setDescription] = React.useState(product.description ?? "");
  const [criticality, setCriticality] = React.useState<string>(product.criticality);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await productsApi.update(product.id, {
        name,
        shortName,
        description,
        criticality: criticality as Product["criticality"],
      });
      if (response.success) {
        onOpenChange(false);
        onSuccess();
      }
    } catch { } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/50 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update the product details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Product Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Product"
                className="bg-muted/30 border-border/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Short Name</Label>
              <Input
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="PROD"
                className="bg-muted/30 border-border/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Criticality</Label>
              <Select value={criticality} onValueChange={setCriticality}>
                <SelectTrigger className="bg-muted/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this product..."
                className="bg-muted/30 border-border/50 resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" className="border-border/50" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// GENERATE REPORT DIALOG
// =============================================================================

function GenerateReportDialog({
  productId,
  productName,
  open,
  onOpenChange,
}: {
  productId: string;
  productName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [reportType, setReportType] = React.useState("executive");
  const [format, setFormat] = React.useState("pdf");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await reportsApi.generate({
        productId,
        type: reportType,
        format,
      });
      if (response.success) {
        setDone(true);
      }
    } catch { } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Report</DialogTitle>
          <DialogDescription>Generate a security report for <strong>{productName}</strong>.</DialogDescription>
        </DialogHeader>
        {done ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
            <p className="text-sm font-medium">Report queued for generation</p>
            <p className="text-xs text-muted-foreground">You can track progress in the Reports section.</p>
            <Button className="mt-4 bg-primary hover:bg-primary/90" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="bg-muted/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="executive">Executive Summary</SelectItem>
                  <SelectItem value="technical">Technical Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="bg-muted/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="docx">Word (DOCX)</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" className="border-border/50" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating} className="bg-primary hover:bg-primary/90">
                {isGenerating ? "Queuing..." : "Generate Report"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function QuickStat({ icon: Icon, value, label, color }: { icon: React.ElementType; value: number; label: string; color: string }) {
  const colorClasses: Record<string, { bg: string; text: string }> = {
    primary: { bg: "bg-primary/10", text: "text-primary" },
    red: { bg: "bg-red-500/10", text: "text-red-500" },
    orange: { bg: "bg-orange-500/10", text: "text-orange-500" },
    yellow: { bg: "bg-yellow-500/10", text: "text-yellow-500" },
    blue: { bg: "bg-blue-500/10", text: "text-blue-500" },
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
            <p className={cn("text-xl font-bold font-mono", colors.text)}>{value}</p>
            <p className="text-[10px] text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FindingRow({ finding }: { finding: Finding }) {
  const severityColors: Record<string, string> = {
    critical: "text-red-500 bg-red-500/10",
    high: "text-orange-500 bg-orange-500/10",
    medium: "text-yellow-500 bg-yellow-500/10",
    low: "text-green-500 bg-green-500/10",
  };

  return (
    <Link href={`/findings/${finding.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
      <Badge variant="outline" className={cn("text-[10px] uppercase", severityColors[finding.severity])}>
        {finding.severity}
      </Badge>
      <span className="text-sm flex-1 truncate">{finding.title}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

function AssetRow({ asset }: { asset: Asset }) {
  const type = typeConfig[asset.type] || typeConfig.api;
  const TypeIcon = type.icon;
  const totalFindings = (asset.findingsCount?.critical || 0) + (asset.findingsCount?.high || 0) + 
                        (asset.findingsCount?.medium || 0) + (asset.findingsCount?.low || 0);

  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", type.bg)}>
            <TypeIcon className={cn("h-4 w-4", type.color)} />
          </div>
          <div>
            <p className="font-medium">{asset.name}</p>
            {asset.url && <p className="text-xs text-muted-foreground font-mono">{asset.url}</p>}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={cn("text-[10px]", type.color, type.bg)}>
          {type.label}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-[10px] capitalize">
          {asset.environment}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="text-sm font-mono">{totalFindings}</span>
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href={`/assets?id=${asset.id}`}>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}

function FindingTableRow({ finding }: { finding: Finding }) {
  const severityColors: Record<string, string> = {
    critical: "text-red-500 bg-red-500/10 border-red-500/20",
    high: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    medium: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    low: "text-green-500 bg-green-500/10 border-green-500/20",
  };

  const statusColors: Record<string, string> = {
    open: "text-red-500 bg-red-500/10",
    "in-progress": "text-yellow-500 bg-yellow-500/10",
    remediated: "text-blue-500 bg-blue-500/10",
    verified: "text-green-500 bg-green-500/10",
    resolved: "text-green-500 bg-green-500/10",
  };

  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell>
        <div>
          <p className="text-xs font-mono text-muted-foreground">{finding.id}</p>
          <p className="font-medium truncate max-w-[300px]">{finding.title}</p>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={cn("text-[10px] uppercase", severityColors[finding.severity])}>
          {finding.severity}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={cn("text-[10px]", statusColors[finding.status])}>
          {finding.status}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="text-sm font-mono">{finding.asset?.name || "—"}</span>
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
}