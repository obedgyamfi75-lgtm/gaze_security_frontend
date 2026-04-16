"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Package,
  Globe,
  Server,
  Smartphone,
  Cloud,
  Database,
  Shield,
  AlertTriangle,
  ChevronRight,
  LayoutGrid,
  List,
  RefreshCw,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useProducts, useUsers } from "@/hooks/use-data";
import { productsApi } from "@/lib/api";
import { ListPageSkeleton } from "@/components/shared/skeletons";
import { ErrorState, EmptyState } from "@/components/shared/empty-state";
import type { Product, ProductStatus, Criticality } from "@/types";

// =============================================================================
// CONFIGURATION
// =============================================================================

const statusConfig: Record<ProductStatus, { label: string; color: string; bg: string; border: string }> = {
  active: { label: "Active", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
  development: { label: "In Development", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  deprecated: { label: "Deprecated", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  archived: { label: "Archived", color: "text-muted-foreground", bg: "bg-muted/50", border: "border-border/50" },
};

const criticalityConfig: Record<Criticality, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: "Critical", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  high: { label: "High", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  medium: { label: "Medium", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  low: { label: "Low", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
};

const assetIcons: Record<string, React.ElementType> = {
  web: Globe,
  api: Server,
  mobile: Smartphone,
  cloud: Cloud,
  database: Database,
};

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function ProductsPage() {
  // Filter states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [criticalityFilter, setCriticalityFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  // Fetch products from API
  const {
    data: products,
    isLoading,
    error,
    refetch
  } = useProducts({
    search: searchQuery || undefined,
    status: statusFilter !== "all" ? statusFilter as ProductStatus : undefined,
    criticality: criticalityFilter !== "all" ? criticalityFilter as Criticality : undefined,
  });

  // Fetch users for owner dropdown in create dialog
  const { data: users } = useUsers();

  // Calculate stats from data
  const stats = React.useMemo(() => {
    if (!products || products.length === 0) {
      return { total: 0, totalAssets: 0, criticalFindings: 0, avgScore: 0 };
    }
    return {
      total: products.length,
      totalAssets: products.reduce((sum, p) => sum + (p.assetsCount || 0), 0),
      criticalFindings: products.reduce((sum, p) => sum + (p.findingsCount?.critical || 0), 0),
      avgScore: Math.round(products.reduce((sum, p) => sum + (p.securityScore || 0), 0) / products.length),
    };
  }, [products]);

  // Loading state
  if (isLoading) {
    return <ListPageSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title="Failed to load products"
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
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage product portfolios and their associated assets
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
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={Package} value={stats.total} label="Products" color="primary" />
        <StatCard icon={Server} value={stats.totalAssets} label="Total Assets" color="blue" />
        <StatCard icon={AlertTriangle} value={stats.criticalFindings} label="Critical Findings" color="red" />
        <StatCard icon={Shield} value={`${stats.avgScore}%`} label="Avg Security Score" color="green" />
      </div>

      {/* Filters */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/30 border-border/50"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 bg-muted/30 border-border/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="development">In Development</SelectItem>
                  <SelectItem value="deprecated">Deprecated</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={criticalityFilter} onValueChange={setCriticalityFilter}>
                <SelectTrigger className="w-36 bg-muted/30 border-border/50">
                  <SelectValue placeholder="Criticality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Criticality</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
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
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-mono font-medium text-foreground">{products.length}</span> products
      </p>

      {/* Empty State */}
      {products.length === 0 && (
        <EmptyState
          icon={Package}
          title="No products found"
          description="Try adjusting your search or filter criteria, or create a new product."
          action={{
            label: "Add Product",
            onClick: () => setCreateDialogOpen(true),
            icon: Plus,
          }}
        />
      )}

      {/* Products Grid/List */}
      {viewMode === "grid" && products.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {viewMode === "list" && products.length > 0 && (
        <div className="space-y-3">
          {products.map((product) => (
            <ProductListItem key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Create Product Dialog */}
      <CreateProductDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        users={users}
        onSuccess={refetch}
      />
    </div>
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
  value: number | string;
  label: string;
  color: "primary" | "blue" | "red" | "green"
}) {
  const colors = {
    primary: { bg: "bg-primary/10", text: "text-primary" },
    blue: { bg: "bg-blue-500/10", text: "text-blue-500" },
    red: { bg: "bg-red-500/10", text: "text-red-500" },
    green: { bg: "bg-green-500/10", text: "text-green-500" },
  };
  const c = colors[color];

  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-lg", c.bg)}>
            <Icon className={cn("h-5 w-5", c.text)} />
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
// PRODUCT CARD COMPONENT
// =============================================================================

function ProductCard({ product }: { product: Product }) {
  const status = statusConfig[product.status] || statusConfig.active;
  const criticality = criticalityConfig[product.criticality] || criticalityConfig.medium;
  const totalFindings = (product.findingsCount?.critical || 0) +
    (product.findingsCount?.high || 0) +
    (product.findingsCount?.medium || 0) +
    (product.findingsCount?.low || 0);

  const scoreColor = (product.securityScore || 0) >= 80
    ? "text-green-500"
    : (product.securityScore || 0) >= 60
      ? "text-yellow-500"
      : "text-red-500";

  const getOwnerInitials = () => {
    if (product.owner?.name) {
      return product.owner.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return "??";
  };

  const getOwnerName = () => {
    return product.owner?.name || "Unassigned";
  };

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-200 cursor-pointer group h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("text-[10px]", status.color, status.bg, status.border)}>
                {status.label}
              </Badge>
            </div>
          </div>
          <div className="mt-3">
            <CardTitle className="text-base group-hover:text-primary transition-colors">
              {product.name}
            </CardTitle>
            <CardDescription className="text-xs mt-1 line-clamp-2">
              {product.description || "No description available"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Security Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Security Score</span>
              <span className={cn("font-mono font-bold", scoreColor)}>{product.securityScore || 0}%</span>
            </div>
            <Progress value={product.securityScore || 0} className="h-1.5" />
          </div>

          {/* Assets Count */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Assets ({product.assetsCount || 0})</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Server className="h-3 w-3" />
              <span className="font-mono">{product.assetsCount || 0} total</span>
            </div>
          </div>

          {/* Findings Summary */}
          {totalFindings > 0 ? (
            <div className="flex gap-1">
              {(product.findingsCount?.critical || 0) > 0 && (
                <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-500 border-red-500/20">
                  {product.findingsCount?.critical}C
                </Badge>
              )}
              {(product.findingsCount?.high || 0) > 0 && (
                <Badge variant="outline" className="text-[10px] bg-orange-500/10 text-orange-500 border-orange-500/20">
                  {product.findingsCount?.high}H
                </Badge>
              )}
              {(product.findingsCount?.medium || 0) > 0 && (
                <Badge variant="outline" className="text-[10px] bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                  {product.findingsCount?.medium}M
                </Badge>
              )}
              {(product.findingsCount?.low || 0) > 0 && (
                <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20">
                  {product.findingsCount?.low}L
                </Badge>
              )}
            </div>
          ) : (
            <div className="text-xs text-green-500">No findings</div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[8px] bg-muted">{getOwnerInitials()}</AvatarFallback>
              </Avatar>
              <span>{getOwnerName()}</span>
            </div>
            <Badge variant="outline" className={cn("text-[10px]", criticality.color, criticality.bg, criticality.border)}>
              {criticality.label}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// =============================================================================
// PRODUCT LIST ITEM COMPONENT
// =============================================================================

function ProductListItem({ product }: { product: Product }) {
  const status = statusConfig[product.status] || statusConfig.active;
  const criticality = criticalityConfig[product.criticality] || criticalityConfig.medium;
  const totalFindings = (product.findingsCount?.critical || 0) +
    (product.findingsCount?.high || 0) +
    (product.findingsCount?.medium || 0) +
    (product.findingsCount?.low || 0);
  const scoreColor = (product.securityScore || 0) >= 80
    ? "text-green-500"
    : (product.securityScore || 0) >= 60
      ? "text-yellow-500"
      : "text-red-500";

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-200 cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shrink-0">
              <Package className="h-6 w-6 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium group-hover:text-primary transition-colors">{product.name}</h3>
                <Badge variant="outline" className={cn("text-[10px]", status.color, status.bg, status.border)}>
                  {status.label}
                </Badge>
                <Badge variant="outline" className={cn("text-[10px]", criticality.color, criticality.bg, criticality.border)}>
                  {criticality.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {product.description || "No description"}
              </p>
            </div>

            <div className="hidden md:flex items-center gap-6">
              {/* Assets */}
              <div className="text-center">
                <p className="text-lg font-bold font-mono">{product.assetsCount || 0}</p>
                <p className="text-[10px] text-muted-foreground">Assets</p>
              </div>

              {/* Findings */}
              <div className="text-center">
                <p className="text-lg font-bold font-mono">{totalFindings}</p>
                <p className="text-[10px] text-muted-foreground">Findings</p>
              </div>

              {/* Score */}
              <div className="text-center w-16">
                <p className={cn("text-lg font-bold font-mono", scoreColor)}>{product.securityScore || 0}%</p>
                <p className="text-[10px] text-muted-foreground">Score</p>
              </div>
            </div>

            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// =============================================================================
// CREATE PRODUCT DIALOG
// =============================================================================

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: { id: string; firstName: string; lastName: string }[];
  onSuccess?: () => void;
}

function CreateProductDialog({ open, onOpenChange, users, onSuccess }: CreateProductDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    shortName: "",
    description: "",
    criticality: "medium" as Criticality,
    ownerId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await productsApi.create(formData);
      if (response.success) {
        onOpenChange(false);
        setFormData({ name: "", shortName: "", description: "", criticality: "medium", ownerId: "" });
        onSuccess?.();
      }
    } catch (err) {
      console.error("Failed to create product:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border/50">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Create a new product to organize your assets
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Product Name</Label>
            <Input
              placeholder="e.g., GAZE Consumer"
              className="bg-muted/30 border-border/50"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Short Name</Label>
            <Input
              placeholder="e.g., Consumer"
              className="bg-muted/30 border-border/50"
              value={formData.shortName}
              onChange={(e) => setFormData(prev => ({ ...prev, shortName: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Description</Label>
            <Textarea
              placeholder="Brief description of the product..."
              className="bg-muted/30 border-border/50 min-h-[80px]"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Criticality</Label>
              <Select
                value={formData.criticality}
                onValueChange={(value) => setFormData(prev => ({ ...prev, criticality: value as Criticality }))}
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
              <Select
                value={formData.ownerId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, ownerId: value }))}
              >
                <SelectTrigger className="bg-muted/30 border-border/50">
                  <SelectValue placeholder="Select owner..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border/50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Product
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}