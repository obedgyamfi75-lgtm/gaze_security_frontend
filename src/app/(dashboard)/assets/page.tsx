"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus, Search, Server, Globe, Smartphone, Database, Cloud,
  Shield, AlertTriangle, CheckCircle2, ExternalLink, Calendar,
  User, Package, LayoutGrid, List, ChevronRight, Eye, RefreshCw, MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAssets, useProducts } from "@/hooks/use-data";
import { assetsApi } from "@/lib/api";
import { ListPageSkeleton } from "@/components/shared/skeletons";
import { ErrorState, EmptyState } from "@/components/shared/empty-state";
import type { Asset, AssetType, AssetStatus, Environment, Criticality } from "@/types";

// =============================================================================
// CONFIGURATION
// =============================================================================

const assetTypeConfig: Record<AssetType, { label: string; icon: typeof Globe; color: string; bg: string; border: string }> = {
  web: { label: "Web", icon: Globe, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  api: { label: "API", icon: Server, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  mobile: { label: "Mobile", icon: Smartphone, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
  database: { label: "Database", icon: Database, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  cloud: { label: "Cloud", icon: Cloud, color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
};

const statusConfig: Record<AssetStatus, { label: string; color: string; bg: string; border: string }> = {
  "at-risk": { label: "At Risk", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  moderate: { label: "Moderate", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  secure: { label: "Secure", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
  unknown: { label: "Unknown", color: "text-muted-foreground", bg: "bg-muted/50", border: "border-border/50" },
};

const criticalityConfig: Record<Criticality, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: "Critical", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  high: { label: "High", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  medium: { label: "Medium", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  low: { label: "Low", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
};

const envConfig: Record<Environment, { color: string; bg: string }> = {
  production: { color: "text-red-500", bg: "bg-red-500/10" },
  staging: { color: "text-yellow-500", bg: "bg-yellow-500/10" },
  development: { color: "text-blue-500", bg: "bg-blue-500/10" },
};

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function AssetsPage() {
  // Filter states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [productFilter, setProductFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [selectedAsset, setSelectedAsset] = React.useState<Asset | null>(null);
  const [editAsset, setEditAsset] = React.useState<Asset | null>(null);
  const [deleteAsset, setDeleteAsset] = React.useState<Asset | null>(null);
  const [isDeletingAsset, setIsDeletingAsset] = React.useState(false);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  // Fetch data from API
  const { data: assets, isLoading, error, refetch } = useAssets({
    search: searchQuery || undefined,
    type: typeFilter !== "all" ? typeFilter as AssetType : undefined,
    productId: productFilter !== "all" ? productFilter : undefined,
    status: statusFilter !== "all" ? statusFilter as AssetStatus : undefined,
  });

  const handleDeleteAsset = async () => {
    if (!deleteAsset) return;
    setIsDeletingAsset(true);
    try {
      const response = await assetsApi.delete(deleteAsset.id);
      if (response.success) { setDeleteAsset(null); refetch(); }
    } catch { } finally {
      setIsDeletingAsset(false);
    }
  };

  // Fetch products for filter dropdown
  const { data: products } = useProducts();

  // Calculate stats from data
  const stats = React.useMemo(() => ({
    total: assets.length,
    atRisk: assets.filter((a) => a.status === "at-risk").length,
    moderate: assets.filter((a) => a.status === "moderate").length,
    secure: assets.filter((a) => a.status === "secure").length,
  }), [assets]);

  // Loading state
  if (isLoading) {
    return <ListPageSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title="Failed to load assets"
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
          <h1 className="text-2xl font-bold tracking-tight">Assets</h1>
          <p className="text-sm text-muted-foreground">
            Manage and monitor all organizational assets across products
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={refetch} className="border-border/50">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={Server} value={stats.total} label="Total Assets" color="primary" />
        <StatCard icon={AlertTriangle} value={stats.atRisk} label="At Risk" color="red" />
        <StatCard icon={Shield} value={stats.moderate} label="Moderate" color="yellow" />
        <StatCard icon={CheckCircle2} value={stats.secure} label="Secure" color="green" />
      </div>

      {/* Filters */}

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/30 border-border/50"
          />
        </div>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Select value={productFilter} onValueChange={setProductFilter}>
                <SelectTrigger className="w-40 bg-muted/30 border-border/50">
                  <Package className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.shortName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32 bg-muted/30 border-border/50">
                  <SelectValue placeholder="Type" />
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 bg-muted/30 border-border/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="at-risk">At Risk</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="secure">Secure</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex rounded-lg border border-border/50 p-1 bg-muted/30">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-7 px-2", viewMode === "grid" && "bg-primary/10 text-primary")}
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-7 px-2", viewMode === "list" && "bg-primary/10 text-primary")}
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-mono font-medium text-foreground">{assets.length}</span> assets
      </p>

      {/* Empty State */}
      {
        assets.length === 0 && (
          <EmptyState
            icon={Server}
            title="No assets found"
            description="Try adjusting your search or filter criteria, or add a new asset."
            action={{
              label: "Add Asset",
              onClick: () => setCreateDialogOpen(true),
              icon: Plus,
            }}
          />
        )
      }

      {/* Grid View */}
      {
        viewMode === "grid" && assets.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onClick={() => setSelectedAsset(asset)}
                onEdit={() => setEditAsset(asset)}
                onDelete={() => setDeleteAsset(asset)}
              />
            ))}
          </div>
        )
      }

      {/* List View */}
      {
        viewMode === "list" && assets.length > 0 && (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Asset</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Env</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Findings</TableHead>
                    <TableHead>Last Assessment</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <AssetListRow key={asset.id} asset={asset} onClick={() => setSelectedAsset(asset)} />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      }

      {/* Dialogs */}
      <AssetDetailsDialog asset={selectedAsset} onClose={() => setSelectedAsset(null)} onRefetch={refetch} />

      {/* Edit asset from card dropdown */}
      {editAsset && (
        <EditAssetDialog
          asset={editAsset}
          open={!!editAsset}
          onOpenChange={(open) => { if (!open) setEditAsset(null); }}
          onSuccess={() => { setEditAsset(null); refetch(); }}
        />
      )}

      {/* Delete asset from card dropdown */}
      <AlertDialog open={!!deleteAsset} onOpenChange={(open) => { if (!open) setDeleteAsset(null); }}>
        <AlertDialogContent className="bg-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete <strong>{deleteAsset?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingAsset}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAsset} disabled={isDeletingAsset} className="bg-red-500 hover:bg-red-600 text-white">
              {isDeletingAsset ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <CreateAssetDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        products={products}
        onSuccess={refetch}
      />
    </div >
  );
}

// =============================================================================
// STAT CARD COMPONENT
// =============================================================================

function StatCard({
  icon: Icon,
  value,
  label,
  color
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  color: "primary" | "red" | "yellow" | "green"
}) {
  const colors = {
    primary: { bg: "bg-primary/10", text: "text-primary" },
    red: { bg: "bg-red-500/10", text: "text-red-500" },
    yellow: { bg: "bg-yellow-500/10", text: "text-yellow-500" },
    green: { bg: "bg-green-500/10", text: "text-green-500" },
  };
  const c = colors[color];

  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-lg", c.bg)}>
            <Icon className={cn("h-8 w-8", c.text)} />
          </div>
          <div>
            <p className={cn("text-2xl font-bold font-mono", c.text)}>{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// ASSET CARD COMPONENT
// =============================================================================

function AssetCard({ asset, onClick, onEdit, onDelete }: { asset: Asset; onClick: () => void; onEdit?: () => void; onDelete?: () => void }) {
  const type = assetTypeConfig[asset.type] || assetTypeConfig.web;
  const status = statusConfig[asset.status] || statusConfig.unknown;
  const env = envConfig[asset.environment] || envConfig.production;
  const Icon = type.icon || Server;
  // const fc = asset.findingsCount || { critical: 0, high: 0, medium: 0, low: 0 };
  const fc = asset.findingsCount || { critical: 0, high: 0, medium: 0, low: 0, info: 0, total: 0 };
  const totalFindings = fc.total || 0;

  return (
    <Card
      className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={cn("p-2 rounded-lg bg-muted", type.bg, "border", type.border)}>
            <Icon className={cn("h-5 w-5", type.color)} />
          </div>
          <div className="flex items-center gap-1.5">
            {/* <Badge variant="outline" className={cn("text-[10px]", env.color, env.bg)}>
              {asset.environment}
            </Badge>
            <Badge variant="outline" className={cn("text-[10px]", status.color, status.bg, status.border)}>
              {status.label}
            </Badge> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border/50">
                <DropdownMenuItem className="cursor-pointer" onSelect={(e) => { e.preventDefault(); onClick(); }}>View Details</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onSelect={(e) => { e.preventDefault(); onEdit?.(); }}>Edit Asset</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link href={`/assessments?create=true&assetId=${asset.id}`}>Start Assessment</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500" onSelect={(e) => { e.preventDefault(); onDelete?.(); }}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-[10px] font-mono text-muted-foreground">{asset.id}</p>
          {/* <CardTitle className="text-sm mt-0.5 group-hover:text-primary transition-colors truncate">
            {asset.name}
          </CardTitle>
          <CardDescription className="text-xs mt-1 line-clamp-2">
            {asset.description || "No description"}
          </CardDescription> */}
          <CardTitle className="text-base mt-3">{asset.name}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {type.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {asset.environment}
            </Badge>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Link */}
        <Link
          href={`/products/${asset.product?.id || asset.productId}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <Package className="h-3 w-3" />
          {asset.product?.name || "Unknown Product"}
        </Link>

        { /*Security Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Security Status</span>
          <div className="flex items-center gap-2">
            <div className={cn("h-2 w-2 rounded-full", status?.color)} />
            <span className={cn("text-sm font-medium", status?.color)}>
              {status?.label}
            </span>
          </div>
        </div>

        {/* Criticality */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Criticality</span>
          <Badge
            variant={
              asset.criticality === "critical"
                ? "critical"
                : asset.criticality === "high"
                  ? "high"
                  : "medium"
            }
          >
            {asset.criticality}
          </Badge>
        </div>


        {/* Findings Summary */}
        {totalFindings >= 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Open Findings</span>
              <span className="text-sm font-medium">{totalFindings}</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {fc.critical >= 0 && (
                <Badge variant="critical" className="text-[10px] bg-red-500/10 text-red-500 border-red-500/20">
                  {fc.critical}C
                </Badge>
              )}
              {fc.high >= 0 && (
                <Badge variant="high" className="text-[10px] bg-orange-500/10 text-orange-500 border-orange-500/20">
                  {fc.high}H
                </Badge>
              )}
              {fc.medium >= 0 && (
                <Badge variant="medium" className="text-[10px] bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                  {fc.medium}M
                </Badge>
              )}
              {fc.low >= 0 && (
                <Badge variant="low" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20">
                  {fc.low}L
                </Badge>
              )}
              {fc.info >= 0 && (
                <Badge variant="info" className="text-[10px] bg-blue-500/10" >
                  {fc.info}I
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-green-500">
            <CheckCircle2 className="h-3.5 w-3.5" />
            No findings
          </div>
        )}

        {/* Technologies */}
        {asset.technologies && asset.technologies.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {asset.technologies.slice(0, 3).map((tech) => (
              <Badge key={tech} variant="outline" className="text-[10px] bg-muted/50 border-border/50">
                {tech}
              </Badge>
            ))}
            {asset.technologies.length > 3 && (
              <Badge variant="outline" className="text-[10px] bg-muted/50 border-border/50">
                +{asset.technologies.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {asset.owner || "Unassigned"}
          </span>
          <span className="flex items-center gap-1 font-mono">
            <Calendar className="h-3 w-3" />
            {asset.lastAssessment ? new Date(asset.lastAssessment).toLocaleDateString() : "Never"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// ASSET LIST ROW COMPONENT
// =============================================================================

function AssetListRow({ asset, onClick }: { asset: Asset; onClick: () => void }) {
  const type = assetTypeConfig[asset.type] || assetTypeConfig.web;
  const status = statusConfig[asset.status] || statusConfig.unknown;
  const env = envConfig[asset.environment] || envConfig.production;
  const Icon = type.icon;
  const fc = asset.findingsCount || { critical: 0, high: 0, medium: 0, low: 0, info: 0, total: 0 };
  const totalFindings = fc.total;

  return (
    <TableRow className="hover:bg-muted/30 cursor-pointer" onClick={onClick}>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className={cn("p-1.5 rounded", type.bg)}>
            <Icon className={cn("h-4 w-4", type.color)} />
          </div>
          <div>
            <p className="font-medium text-sm">{asset.name}</p>
            <p className="text-[10px] font-mono text-muted-foreground">{asset.id}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Link
          href={`/products/${asset.product?.id || asset.productId}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Package className="h-3 w-3" />
          {asset.product?.shortName || "Unknown"}
        </Link>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={cn("text-[10px]", type.color, type.bg, type.border)}>
          {type.label}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={cn("text-[10px]", env.color, env.bg)}>
          {asset.environment}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={cn("text-[10px]", status.color, status.bg, status.border)}>
          {status.label}
        </Badge>
      </TableCell>
      <TableCell>
        {totalFindings >= 0 ? (
          <div className="flex gap-1">
            {fc.critical >= 0 && <span className="text-[10px] font-mono text-red-500">{fc.critical}C</span>}
            {fc.high >= 0 && <span className="text-[10px] font-mono text-orange-500">{fc.high}H</span>}
            {fc.medium >= 0 && <span className="text-[10px] font-mono text-yellow-500">{fc.medium}M</span>}
            {fc.low >= 0 && <span className="text-[10px] font-mono text-green-500">{fc.low}L</span>}
            {fc.info > 0 && <span className="text-[10px] font-mono text-blue-500">{fc.info}I</span>}
          </div>
        ) : (
          <span className="text-[10px] text-green-500">Clean</span>
        )}
      </TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">
        {asset.lastAssessment ? new Date(asset.lastAssessment).toLocaleDateString() : "Never"}
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClick}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}



// =============================================================================
// ASSET DETAILS DIALOG - REFACTORED
// =============================================================================

function AssetDetailsDialog({ asset, onClose, onRefetch }: { asset: Asset | null; onClose: () => void; onRefetch?: () => void }) {
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!asset) return null;

  const type = assetTypeConfig[asset.type] || assetTypeConfig.web;
  const status = statusConfig[asset.status] || statusConfig.unknown;
  const criticality = criticalityConfig[asset.criticality] || criticalityConfig.medium;
  const env = envConfig[asset.environment] || envConfig.production;
  const Icon = type.icon;
  const fc = asset.findingsCount || { critical: 0, high: 0, medium: 0, low: 0, info: 0, total: 0 };
  const totalFindings = fc.total;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await assetsApi.delete(asset.id);
      if (response.success) {
        setShowDeleteConfirm(false);
        onClose();
        onRefetch?.();
      }
    } catch {
      // silent — dialog stays open so user can retry
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={!!asset && !showEditDialog && !showDeleteConfirm} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-3xl bg-card border-border/50">
          {/* Header with Actions */}
          <DialogHeader className="pr-8">
            <div className="flex items-start gap-4">
              <div className={cn("p-3 rounded-lg", type.bg, "border", type.border)}>
                <Icon className={cn("h-7 w-7", type.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge variant="outline" className={cn("text-xs", type.color, type.bg, type.border)}>
                    {type.label}
                  </Badge>
                  <Badge variant="outline" className={cn("text-xs", env.color, env.bg)}>
                    {asset.environment}
                  </Badge>
                  <Badge variant="outline" className={cn("text-xs", criticality.color, criticality.bg, criticality.border)}>
                    {criticality.label}
                  </Badge>
                </div>
                <DialogTitle className="text-xl">{asset.name}</DialogTitle>
                <DialogDescription className="mt-1.5 text-sm">
                  {asset.description || "No description provided"}
                </DialogDescription>
                <p className="text-xs font-mono text-muted-foreground mt-2">{asset.id}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditDialog(true)}
                  className="border-border/50"
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="border-red-500/20 text-red-500 hover:bg-red-500/10"
                >
                  Delete
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Content Grid */}
          <div className="grid gap-6 md:grid-cols-2 py-6">
            {/* Left Column - Asset Info */}
            <div className="space-y-5">
              <InfoField label="Product">
                <Link
                  href={`/products/${asset.product?.id || asset.productId}`}
                  className="flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                >
                  <Package className="h-4 w-4" />
                  {asset.product?.name || "Unknown Product"}
                </Link>
              </InfoField>

              <InfoField label="Owner">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{asset.owner || "Unassigned"}</span>
                </div>
              </InfoField>

              {asset.url && (
                <InfoField label="URL">
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono text-primary hover:underline flex items-center gap-1 break-all"
                  >
                    {asset.url}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </InfoField>
              )}

              {asset.technologies && asset.technologies.length > 0 && (
                <InfoField label="Technologies">
                  <div className="flex gap-1.5 flex-wrap">
                    {asset.technologies.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs bg-muted/50 border-border/50">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </InfoField>
              )}

              <InfoField label="Security Status">
                <div className="flex items-center gap-2">
                  <div className={cn("h-2.5 w-2.5 rounded-full", status.color)} />
                  <span className={cn("text-sm font-medium", status.color)}>
                    {status.label}
                  </span>
                </div>
              </InfoField>
            </div>

            {/* Right Column - Security Info */}
            <div className="space-y-5">
              <InfoField label={`Findings (${totalFindings} total)`}>
                <div className="grid grid-cols-5 gap-2">
                  <FindingStatCard count={fc.critical} label="Critical" color="red" />
                  <FindingStatCard count={fc.high} label="High" color="orange" />
                  <FindingStatCard count={fc.medium} label="Medium" color="yellow" />
                  <FindingStatCard count={fc.low} label="Low" color="green" />
                  <FindingStatCard count={fc.info} label="Info" color="blue" />
                </div>
              </InfoField>

              <InfoField label="Last Assessment">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-mono">
                    {asset.lastAssessment
                      ? new Date(asset.lastAssessment).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                      : "Never assessed"}
                  </span>
                </div>
              </InfoField>

              <InfoField label="Next Assessment">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-mono">
                    {asset.nextAssessment
                      ? new Date(asset.nextAssessment).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                      : "Not scheduled"}
                  </span>
                </div>
              </InfoField>

              {totalFindings === 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500 font-medium">No security findings</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onClose} className="border-border/50">
              Close
            </Button>
            {totalFindings > 0 && (
              <Link href={`/findings?assetId=${asset.id}`}>
                <Button variant="outline" className="border-border/50">
                  <Eye className="mr-2 h-4 w-4" />
                  View Findings
                </Button>
              </Link>
            )}
            <Link href={`/assessments/new?assetId=${asset.id}`}>
              <Button className="bg-primary hover:bg-primary/90">
                <Shield className="mr-2 h-4 w-4" />
                Start Assessment
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {showEditDialog && (
        <EditAssetDialog
          asset={asset}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSuccess={() => {
            setShowEditDialog(false);
            onClose();
            onRefetch?.();
          }}
        />
      )}

      {/* Delete Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              Delete Asset
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">{asset.name}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <p className="text-sm text-muted-foreground">This will permanently remove:</p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-2">
              <li>Asset record and metadata</li>
              <li>Associated assessment history</li>
              <li>All linked findings ({totalFindings} total)</li>
            </ul>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="border-border/50"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Delete Asset
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function InfoField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
      {children}
    </div>
  );
}

function FindingStatCard({
  count,
  label,
  color
}: {
  count: number;
  label: string;
  color: 'red' | 'orange' | 'yellow' | 'green' | 'blue'
}) {
  const colorMap = {
    red: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20' },
    yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20' },
    green: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
  };
  const c = colorMap[color];

  return (
    <div className={cn("p-2 rounded-lg border text-center", c.bg, c.border)}>
      <p className={cn("text-lg font-bold font-mono", c.text)}>{count}</p>
      <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  );
}

// =============================================================================
// EDIT ASSET DIALOG
// =============================================================================

interface EditAssetDialogProps {
  asset: Asset;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function EditAssetDialog({ asset, open, onOpenChange, onSuccess }: EditAssetDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { data: products } = useProducts();
  const [formData, setFormData] = React.useState({
    name: asset.name,
    description: asset.description || "",
    productId: asset.productId,
    type: asset.type,
    environment: asset.environment,
    criticality: asset.criticality,
    owner: asset.owner || "",
    url: asset.url || "",
    technologies: asset.technologies?.join(", ") || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await assetsApi.update(asset.id, {
        ...formData,
        technologies: formData.technologies.split(",").map(t => t.trim()).filter(Boolean),
      });
      if (response.success) {
        onSuccess?.();
      }
    } catch {
      // silent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border/50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Asset</DialogTitle>
          <DialogDescription>Update asset information and configuration</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Product</Label>
            <Select
              value={formData.productId}
              onValueChange={(v) => setFormData(prev => ({ ...prev, productId: v }))}
            >
              <SelectTrigger className="bg-muted/30 border-border/50">
                <SelectValue placeholder="Select product..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Asset Name</Label>
            <Input
              placeholder="e.g., api.gazesecurity.com"
              className="font-mono bg-muted/30 border-border/50"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Description</Label>
            <Textarea
              placeholder="Brief description..."
              className="bg-muted/30 border-border/50 min-h-[60px]"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData(prev => ({ ...prev, type: v as AssetType }))}
              >
                <SelectTrigger className="bg-muted/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Web</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="cloud">Cloud</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Environment</Label>
              <Select
                value={formData.environment}
                onValueChange={(v) => setFormData(prev => ({ ...prev, environment: v as Environment }))}
              >
                <SelectTrigger className="bg-muted/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Criticality</Label>
              <Select
                value={formData.criticality}
                onValueChange={(v) => setFormData(prev => ({ ...prev, criticality: v as Criticality }))}
              >
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
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Owner</Label>
              <Input
                placeholder="Team or person"
                className="bg-muted/30 border-border/50"
                value={formData.owner}
                onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">URL (Optional)</Label>
            <Input
              placeholder="https://..."
              className="font-mono bg-muted/30 border-border/50"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Technologies</Label>
            <Input
              placeholder="React, Node.js, PostgreSQL"
              className="bg-muted/30 border-border/50"
              value={formData.technologies}
              onChange={(e) => setFormData(prev => ({ ...prev, technologies: e.target.value }))}
            />
            <p className="text-[10px] text-muted-foreground">Comma-separated</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border/50">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>Save Changes</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// CREATE ASSET DIALOG
// =============================================================================

interface CreateAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: { id: string; name: string; shortName: string }[];
  onSuccess?: () => void;
}

function CreateAssetDialog({ open, onOpenChange, products, onSuccess }: CreateAssetDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    productId: "",
    type: "web" as AssetType,
    environment: "production" as Environment,
    criticality: "medium" as Criticality,
    owner: "",
    url: "",
    technologies: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await assetsApi.create({
        ...formData,
        technologies: formData.technologies.split(",").map(t => t.trim()).filter(Boolean),
      });
      if (response.success) {
        onOpenChange(false);
        setFormData({
          name: "", description: "", productId: "", type: "web",
          environment: "production", criticality: "medium", owner: "", url: "", technologies: "",
        });
        onSuccess?.();
      }
    } catch {
      // silent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border/50">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
          <DialogDescription>Register a new asset in the platform</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Product</Label>
            <Select
              value={formData.productId}
              onValueChange={(v) => setFormData(prev => ({ ...prev, productId: v }))}
            >
              <SelectTrigger className="bg-muted/30 border-border/50">
                <SelectValue placeholder="Select product..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Asset Name</Label>
            <Input
              placeholder="e.g., api.gazesecurity.com"
              className="font-mono bg-muted/30 border-border/50"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Description</Label>
            <Textarea
              placeholder="Brief description..."
              className="bg-muted/30 border-border/50 min-h-[60px]"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData(prev => ({ ...prev, type: v as AssetType }))}
              >
                <SelectTrigger className="bg-muted/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Web</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="cloud">Cloud</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Environment</Label>
              <Select
                value={formData.environment}
                onValueChange={(v) => setFormData(prev => ({ ...prev, environment: v as Environment }))}
              >
                <SelectTrigger className="bg-muted/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Criticality</Label>
              <Select
                value={formData.criticality}
                onValueChange={(v) => setFormData(prev => ({ ...prev, criticality: v as Criticality }))}
              >
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
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Owner</Label>
              <Input
                placeholder="Team or person"
                className="bg-muted/30 border-border/50"
                value={formData.owner}
                onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">URL (Optional)</Label>
            <Input
              placeholder="https://..."
              className="font-mono bg-muted/30 border-border/50"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Technologies</Label>
            <Input
              placeholder="React, Node.js, PostgreSQL"
              className="bg-muted/30 border-border/50"
              value={formData.technologies}
              onChange={(e) => setFormData(prev => ({ ...prev, technologies: e.target.value }))}
            />
            <p className="text-[10px] text-muted-foreground">Comma-separated</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border/50">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Asset
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}