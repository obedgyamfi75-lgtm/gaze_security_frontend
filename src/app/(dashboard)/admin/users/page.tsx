"use client";

import * as React from "react";
import {
  Plus,
  Search,
  Users,
  MoreHorizontal,
  Mail,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCog,
  Key,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useUsers } from "@/hooks/use-data";
import { usersApi } from "@/lib/api";
import { ListPageSkeleton } from "@/components/shared/skeletons";
import { ErrorState, EmptyState } from "@/components/shared/empty-state";
import type { User, UserRole } from "@/types";

// =============================================================================
// CONFIGURATION
// =============================================================================

const roleConfig: Record<UserRole, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  admin: { label: "Admin", icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  manager: { label: "Manager", icon: UserCog, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  analyst: { label: "Analyst", icon: ShieldCheck, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  developer: { label: "Developer", icon: Shield, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  viewer: { label: "Viewer", icon: Shield, color: "text-muted-foreground", bg: "bg-muted/50", border: "border-border/50" },
};

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false);

  // Fetch users from API
  const { data: users, isLoading, error, refetch } = useUsers({
    search: searchQuery || undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
  });

  // Calculate stats
  const stats = React.useMemo(() => ({
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    analysts: users.filter((u) => u.role === "analyst").length,
    mfaEnabled: users.filter((u) => u.mfaEnabled).length,
  }), [users]);

  // Loading state
  if (isLoading) {
    return <ListPageSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title="Failed to load users"
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
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={refetch} className="border-border/50">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            onClick={() => setInviteDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <QuickStat label="Total Users" value={stats.total} icon={Users} color="primary" />
        <QuickStat label="Admins" value={stats.admins} icon={ShieldAlert} color="red" />
        <QuickStat label="Analysts" value={stats.analysts} icon={ShieldCheck} color="blue" />
        <QuickStat label="MFA Enabled" value={stats.mfaEnabled} icon={Key} color="green" />
      </div>

      {/* Filters */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/30 border-border/50"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-36 bg-muted/30 border-border/50">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="analyst">Analyst</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-mono font-medium text-foreground">{users.length}</span> users
      </p>

      {/* Empty State */}
      {users.length === 0 && (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Try adjusting your search or filter criteria, or invite a new user."
          action={{
            label: "Invite User",
            onClick: () => setInviteDialogOpen(true),
            icon: UserPlus,
          }}
        />
      )}

      {/* Users Table */}
      {users.length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">MFA</TableHead>
                  <TableHead className="hidden lg:table-cell">Last Login</TableHead>
                  <TableHead className="hidden xl:table-cell">Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <UserRow key={user.id} user={user} onRefetch={refetch} />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Invite User Dialog */}
      <InviteUserDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
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
    red: { bg: "bg-red-500/10", text: "text-red-500" },
    blue: { bg: "bg-blue-500/10", text: "text-blue-500" },
    yellow: { bg: "bg-yellow-500/10", text: "text-yellow-500" },
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
// USER ROW COMPONENT
// =============================================================================

function UserRow({ user, onRefetch }: { user: User; onRefetch: () => void }) {
  const role = roleConfig[user.role] || roleConfig.viewer;
  const RoleIcon = role.icon;

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = React.useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = React.useState(false);
  const [newRole, setNewRole] = React.useState<UserRole>(user.role);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.email.slice(0, 2).toUpperCase();
  };

  const getDisplayName = () => {
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    return user.email;
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await usersApi.delete(user.id);
      setDeleteDialogOpen(false);
      onRefetch();
    } catch {
      // silent
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeactivate = async () => {
    setIsProcessing(true);
    try {
      await usersApi.deactivate(user.id);
      setDeactivateDialogOpen(false);
      onRefetch();
    } catch {
      // silent
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnlock = async () => {
    try {
      await usersApi.unlock(user.id);
      onRefetch();
    } catch {
      // silent
    }
  };

  const handleResetPassword = async () => {
    try {
      await usersApi.resetPassword(user.id);
    } catch {
      // silent
    }
  };

  const handleRoleChange = async () => {
    if (newRole === user.role) { setRoleDialogOpen(false); return; }
    setIsProcessing(true);
    try {
      await usersApi.updateRole(user.id, newRole);
      setRoleDialogOpen(false);
      onRefetch();
    } catch {
      // silent
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <TableRow className="hover:bg-muted/30">
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-border/50">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{getDisplayName()}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className={cn("gap-1 text-[10px]", role.color, role.bg, role.border)}>
            <RoleIcon className="h-3 w-3" />
            {role.label}
          </Badge>
        </TableCell>
        <TableCell className="hidden md:table-cell">
          {user.mfaEnabled ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-muted-foreground" />
          )}
        </TableCell>
        <TableCell className="hidden lg:table-cell">
          {user.lastLogin ? (
            <span className="text-xs text-muted-foreground font-mono">
              {new Date(user.lastLogin).toLocaleDateString()}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Never</span>
          )}
        </TableCell>
        <TableCell className="hidden xl:table-cell">
          <span className="text-xs text-muted-foreground font-mono">
            {new Date(user.createdAt).toLocaleDateString()}
          </span>
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border/50">
              <DropdownMenuItem className="cursor-pointer" onSelect={(e) => { e.preventDefault(); setRoleDialogOpen(true); }}>
                <UserCog className="mr-2 h-4 w-4" />
                Change Role
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onSelect={handleResetPassword}>
                <Key className="mr-2 h-4 w-4" />
                Reset Password
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onSelect={handleUnlock}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Unlock Account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-yellow-500"
                onSelect={(e) => { e.preventDefault(); setDeactivateDialogOpen(true); }}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Deactivate
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-red-500"
                onSelect={(e) => { e.preventDefault(); setDeleteDialogOpen(true); }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {/* Change Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="bg-card border-border/50 max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>Update role for {getDisplayName()}</DialogDescription>
          </DialogHeader>
          <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
            <SelectTrigger className="bg-muted/30 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin - Full access</SelectItem>
              <SelectItem value="manager">Manager - Team management</SelectItem>
              <SelectItem value="analyst">Analyst - Create & edit</SelectItem>
              <SelectItem value="developer">Developer - API access</SelectItem>
              <SelectItem value="viewer">Viewer - Read only</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange} disabled={isProcessing}>
              {isProcessing ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation */}
      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent className="bg-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate User</AlertDialogTitle>
            <AlertDialogDescription>
              Deactivate <span className="font-semibold text-foreground">{getDisplayName()}</span>?
              They will no longer be able to log in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              disabled={isProcessing}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {isProcessing ? "Deactivating..." : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete <span className="font-semibold text-foreground">{getDisplayName()}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isProcessing}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isProcessing ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// =============================================================================
// INVITE USER DIALOG
// =============================================================================

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function InviteUserDialog({ open, onOpenChange, onSuccess }: InviteUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("analyst");

  const handleSubmit = async () => {
    if (!email) return;

    setIsSubmitting(true);
    try {
      // Create user (backend will send invitation email)
      await usersApi.create({
        email,
        role,
        firstName: "",
        lastName: "",
      });
      onOpenChange(false);
      setEmail("");
      setRole("analyst");
      onSuccess?.();
    } catch (err) {
      console.error("Failed to invite user:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border/50">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
          <DialogDescription>
            Send an invitation email to add a new team member
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Email Address</Label>
            <Input
              type="email"
              placeholder="user@gazesecurity.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-muted/30 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger className="bg-muted/30 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin - Full access</SelectItem>
                <SelectItem value="manager">Manager - Team management</SelectItem>
                <SelectItem value="analyst">Analyst - Create & edit</SelectItem>
                <SelectItem value="developer">Developer - API access</SelectItem>
                <SelectItem value="viewer">Viewer - Read only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Permissions</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox id="perm-assessments" defaultChecked />
                <label htmlFor="perm-assessments" className="text-sm">Manage Assessments</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="perm-findings" defaultChecked />
                <label htmlFor="perm-findings" className="text-sm">Manage Findings</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="perm-reports" defaultChecked />
                <label htmlFor="perm-reports" className="text-sm">Generate Reports</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="perm-tools" />
                <label htmlFor="perm-tools" className="text-sm">Use Security Tools</label>
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
            disabled={isSubmitting || !email}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Invitation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}