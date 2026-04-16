"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { assessmentsApi } from "@/lib/api";
import { format } from "date-fns";
import {
  CalendarIcon,
  Shield,
  Bug,
  Code,
  Settings,
  FileCheck,
  Target,
  Loader2,
  Globe,
  Server,
  Smartphone,
  Database,
  Cloud,
  Users,
  Crosshair,
  Cpu,
  Network,
} from "lucide-react";
import type { AssessmentType, Asset, UserRef, CreateAssessmentInput } from "@/types";

// =============================================================================
// CONFIGURATION
// =============================================================================

const assessmentTypeConfig: Record<AssessmentType, { 
  label: string; 
  icon: React.ElementType; 
  description: string; 
  color: string; 
  bg: string 
}> = {
  vulnerability_assessment: {
    label: "Vulnerability Assessment",
    icon: Shield,
    description: "Identify security weaknesses",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  penetration_test: {
    label: "Penetration Test",
    icon: Bug,
    description: "Simulate real-world attacks",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  code_review: {
    label: "Code Review",
    icon: Code,
    description: "Analyze source code security",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  configuration_review: {
    label: "Configuration Review",
    icon: Settings,
    description: "Check system configurations",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  compliance_audit: {
    label: "Compliance Audit",
    icon: FileCheck,
    description: "Verify regulatory compliance",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  red_team: {
    label: "Red Team",
    icon: Target,
    description: "Full adversary simulation",
    color: "text-red-600",
    bg: "bg-red-600/10",
  },
  purple_team: {
    label: "Purple Team",
    icon: Users,
    description: "Collaborative red/blue exercise",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  web_application: {
    label: "Web Application",
    icon: Globe,
    description: "Web app security testing",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  mobile_application: {
    label: "Mobile Application",
    icon: Smartphone,
    description: "Mobile app security testing",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  api: {
    label: "API Security",
    icon: Server,
    description: "API endpoint testing",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  infrastructure: {
    label: "Infrastructure",
    icon: Cpu,
    description: "Network & server testing",
    color: "text-slate-500",
    bg: "bg-slate-500/10",
  },
  cloud: {
    label: "Cloud Security",
    icon: Cloud,
    description: "Cloud config & security",
    color: "text-sky-500",
    bg: "bg-sky-500/10",
  },
};

const assetTypeIcons: Record<string, React.ElementType> = {
  web: Globe,
  api: Server,
  mobile: Smartphone,
  database: Database,
  cloud: Cloud,
};

const methodologies = [
  { value: "owasp", label: "OWASP Testing Guide" },
  { value: "ptes", label: "PTES (Penetration Testing Execution Standard)" },
  { value: "nist", label: "NIST Cybersecurity Framework" },
  { value: "issaf", label: "ISSAF" },
  { value: "osstmm", label: "OSSTMM" },
  { value: "custom", label: "Custom Methodology" },
];

// =============================================================================
// TYPES
// =============================================================================

interface CreateAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: Asset[];
  users?: UserRef[];
  onSuccess?: () => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CreateAssessmentDialog({ 
  open, 
  onOpenChange, 
  assets,
  users = [],
  onSuccess 
}: CreateAssessmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState<{
    name: string;
    description: string | null;
    type: AssessmentType | "";
    assetId: string | null;
    assigneeId: string | null;
    startDate: Date | null;
    dueDate: Date | null;
    scope: string;
    methodology: string;
  }>({
    name: "",
    description: "",
    type: "",
    assetId: "",
    assigneeId: "",
    startDate: null,
    dueDate: null,
    scope: "",
    methodology: "",
  });

  const selectedAsset = assets.find(a => a.id === formData.assetId);
  const AssetIcon = selectedAsset ? assetTypeIcons[selectedAsset.type] || Globe : Globe;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.assetId || !formData.startDate || !formData.dueDate) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const payload: CreateAssessmentInput = {
        name: formData.name,
        description: formData.description || "",
        type: formData.type as AssessmentType,
        assetId: formData.assetId || null,
        assigneeId: formData.assigneeId || null,
        startDate: formData.startDate.toISOString().split('T')[0],
        dueDate: formData.dueDate.toISOString().split('T')[0],
        scope: formData.scope || undefined,
        methodology: formData.methodology || undefined,
      };

      // Create assessment API call
      const response = await assessmentsApi.create(payload);

      // console.log("Creating assessment:", payload);

      // Simulate API call
      // await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (response.success) {
        onOpenChange(false);
        resetForm();
        onSuccess?.();
      };
    } catch (err) {
      console.error("Failed to create assessment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "",
      assetId: "",
      assigneeId: "",
      startDate: undefined,
      dueDate: undefined,
      scope: "",
      methodology: "",
    });
  };

  // Auto-generate name when asset and type are selected
  React.useEffect(() => {
    if (selectedAsset && formData.type && !formData.name) {
      const typeLabel = assessmentTypeConfig[formData.type]?.label || formData.type;
      const date = new Date().toISOString().slice(0, 7); // YYYY-MM
      setFormData(prev => ({
        ...prev,
        name: `${typeLabel} - ${selectedAsset.name} (${date})`
      }));
    }
  }, [selectedAsset, formData.type, formData.name]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border/50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            New Security Assessment
          </DialogTitle>
          <DialogDescription>
            Create a new security assessment for an asset
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Assessment Type - First so name can auto-generate */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Assessment Type <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[240px] overflow-y-auto pr-1">
              {(Object.entries(assessmentTypeConfig) as [AssessmentType, typeof assessmentTypeConfig[AssessmentType]][]).map(([key, config]) => {
                const Icon = config.icon;
                const isSelected = formData.type === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: key }))}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all",
                      isSelected
                        ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                        : "border-border/50 hover:border-primary/30 hover:bg-muted/30"
                    )}
                  >
                    <div className={cn("p-1.5 rounded shrink-0", config.bg)}>
                      <Icon className={cn("h-3.5 w-3.5", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{config.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Asset */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Target Asset <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={formData.assetId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, assetId: value }))}
            >
              <SelectTrigger className="bg-muted/30 border-border/50">
                <div className="flex items-center gap-2">
                  {selectedAsset && <AssetIcon className="h-4 w-4 text-muted-foreground" />}
                  <SelectValue placeholder="Select target asset..." />
                </div>
              </SelectTrigger>
              <SelectContent>
                {assets.map((asset) => {
                  const TypeIcon = assetTypeIcons[asset.type] || Globe;
                  return (
                    <SelectItem key={asset.id} value={asset.id}>
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{asset.name}</span>
                        <span className="text-xs text-muted-foreground">({asset.type})</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Assessment Name */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Assessment Name <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g., Q1 2026 Payment Gateway Pentest"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-muted/30 border-border/50 focus:border-primary/50"
              required
            />
            <p className="text-[10px] text-muted-foreground">
              Auto-generated from type and asset. Feel free to customize.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Description
            </Label>
            <Textarea
              placeholder="Brief description of the assessment objectives..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-muted/30 border-border/50 focus:border-primary/50 min-h-[60px]"
            />
          </div>

          {/* Assignee */}
          {users.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Assignee
              </Label>
              <Select 
                value={formData.assigneeId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, assigneeId: value }))}
              >
                <SelectTrigger className="bg-muted/30 border-border/50">
                  <SelectValue placeholder="Assign to team member..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium">
                          {user.initials}
                        </div>
                        <span>{user.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-muted/30 border-border/50",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Due Date <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-muted/30 border-border/50",
                      !formData.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? format(formData.dueDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
                    disabled={(date) => formData.startDate ? date < formData.startDate : false}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Methodology */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Methodology
            </Label>
            <Select 
              value={formData.methodology} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, methodology: value }))}
            >
              <SelectTrigger className="bg-muted/30 border-border/50">
                <SelectValue placeholder="Select methodology..." />
              </SelectTrigger>
              <SelectContent>
                {methodologies.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Scope */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Scope
            </Label>
            <Textarea
              placeholder="Define what's in scope and out of scope..."
              value={formData.scope}
              onChange={(e) => setFormData(prev => ({ ...prev, scope: e.target.value }))}
              className="bg-muted/30 border-border/50 focus:border-primary/50 min-h-[80px] font-mono text-xs"
            />
          </div>

          <DialogFooter className="pt-4 border-t border-border/50">
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
              disabled={isSubmitting || !formData.name || !formData.type || !formData.assetId || !formData.startDate || !formData.dueDate}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Create Assessment
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}