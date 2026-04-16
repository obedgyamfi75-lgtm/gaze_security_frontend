"use client";

import * as React from "react";
import {
    Plus,
    Bug,
    Shield,
    Loader2,
} from "lucide-react";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAssessments } from "@/hooks/use-data";
import { findingsApi } from "@/lib/api";
import type { Severity } from "@/types";


interface CreateFindingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    defaultAssessmentId?: string;
}

interface FormState {
    title: string;
    description: string;
    severity: Severity;
    assessmentId: string;
    cvssScore: string;
    cweId: string;
    cveId: string;
    affectedComponent: string;
    affectedUrl: string;
    stepsToReproduce: string;
    impact: string;
    recommendation: string;
    tags: string;
}

const initialForm: FormState = {
    title: "",
    description: "",
    severity: "medium",
    assessmentId: "",
    cvssScore: "",
    cweId: "",
    cveId: "",
    affectedComponent: "",
    affectedUrl: "",
    stepsToReproduce: "",
    impact: "",
    recommendation: "",
    tags: "",
};

export function CreateFindingDialog({
    open,
    onOpenChange,
    onSuccess,
    defaultAssessmentId,
}: CreateFindingDialogProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [form, setForm] = React.useState<FormState>({
        ...initialForm,
        assessmentId: defaultAssessmentId ?? "",
    });

    const { data: assessments } = useAssessments();

    const update = (field: keyof FormState) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.title.trim()) {
            setError("Title is required");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                title: form.title,
                description: form.description,
                severity: form.severity,
                assessmentId: form.assessmentId || null,
                cvssScore: form.cvssScore ? parseFloat(form.cvssScore) : undefined,
                cweId: form.cweId || undefined,
                cveId: form.cveId || undefined,
                affectedComponent: form.affectedComponent || undefined,
                affectedUrl: form.affectedUrl || undefined,
                stepsToReproduce: form.stepsToReproduce || undefined,
                impact: form.impact || undefined,
                recommendation: form.recommendation || undefined,
                tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
            };

            const response = await findingsApi.create(payload);

            if (response.success) {
                onOpenChange(false);
                setForm({ ...initialForm, assessmentId: defaultAssessmentId ?? "" });
                onSuccess?.();
            } else {
                setError(response.error || "Failed to create finding");
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to create finding");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            onOpenChange(isOpen);
            if (!isOpen) setForm({ ...initialForm, assessmentId: defaultAssessmentId ?? "" });
        }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border/50">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Bug className="h-5 w-5 text-primary" />
                        Add New Finding
                    </DialogTitle>
                    <DialogDescription>
                        Record a new security vulnerability or finding
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-xs uppercase tracking-wider text-muted-foreground">
                                Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                placeholder="e.g., SQL Injection in Login Form"
                                className="bg-muted/30 border-border/50"
                                value={form.title}
                                onChange={update("title")}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-xs uppercase tracking-wider text-muted-foreground">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Detailed description of the vulnerability..."
                                className="bg-muted/30 border-border/50 min-h-[80px]"
                                value={form.description}
                                onChange={update("description")}
                            />
                        </div>
                    </div>

                    {/* Classification */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                                Severity <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={form.severity}
                                onValueChange={(v) => setForm(prev => ({ ...prev, severity: v as Severity }))}
                            >
                                <SelectTrigger className="bg-muted/30 border-border/50">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="critical">Critical</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="info">Info</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cvssScore" className="text-xs uppercase tracking-wider text-muted-foreground">
                                CVSS Score
                            </Label>
                            <Input
                                id="cvssScore"
                                type="number"
                                step="0.1"
                                min="0"
                                max="10"
                                placeholder="0.0 - 10.0"
                                className="bg-muted/30 border-border/50 font-mono"
                                value={form.cvssScore}
                                onChange={update("cvssScore")}
                            />
                        </div>
                    </div>

                    {/* Assessment */}
                    <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                            Assessment
                        </Label>
                        <Select
                            value={form.assessmentId || "none"}
                            onValueChange={(v) => setForm(prev => ({ ...prev, assessmentId: v === "none" ? "" : v }))}
                        >
                            <SelectTrigger className="bg-muted/30 border-border/50">
                                <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="Select assessment..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {assessments.map((assessment) => (
                                    <SelectItem key={assessment.id} value={assessment.id}>
                                        {assessment.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Technical Details */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium">Technical Details</h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cweId" className="text-xs uppercase tracking-wider text-muted-foreground">CWE ID</Label>
                                <Input
                                    id="cweId"
                                    placeholder="e.g., CWE-89"
                                    className="bg-muted/30 border-border/50 font-mono"
                                    value={form.cweId}
                                    onChange={update("cweId")}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cveId" className="text-xs uppercase tracking-wider text-muted-foreground">CVE ID</Label>
                                <Input
                                    id="cveId"
                                    placeholder="e.g., CVE-2024-1234"
                                    className="bg-muted/30 border-border/50 font-mono"
                                    value={form.cveId}
                                    onChange={update("cveId")}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="affectedComponent" className="text-xs uppercase tracking-wider text-muted-foreground">Affected Component</Label>
                                <Input
                                    id="affectedComponent"
                                    placeholder="e.g., /api/v1/users"
                                    className="bg-muted/30 border-border/50 font-mono"
                                    value={form.affectedComponent}
                                    onChange={update("affectedComponent")}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="affectedUrl" className="text-xs uppercase tracking-wider text-muted-foreground">Affected URL</Label>
                                <Input
                                    id="affectedUrl"
                                    placeholder="https://..."
                                    className="bg-muted/30 border-border/50 font-mono"
                                    value={form.affectedUrl}
                                    onChange={update("affectedUrl")}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stepsToReproduce" className="text-xs uppercase tracking-wider text-muted-foreground">Steps to Reproduce</Label>
                            <Textarea
                                id="stepsToReproduce"
                                placeholder="1. Navigate to...&#10;2. Enter payload..."
                                className="bg-muted/30 border-border/50 min-h-[80px] font-mono text-sm"
                                value={form.stepsToReproduce}
                                onChange={update("stepsToReproduce")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="impact" className="text-xs uppercase tracking-wider text-muted-foreground">Impact</Label>
                            <Textarea
                                id="impact"
                                placeholder="Describe the potential business/security impact..."
                                className="bg-muted/30 border-border/50 min-h-[60px]"
                                value={form.impact}
                                onChange={update("impact")}
                            />
                        </div>
                    </div>

                    {/* Recommendation */}
                    <div className="space-y-2">
                        <Label htmlFor="recommendation" className="text-xs uppercase tracking-wider text-muted-foreground">
                            Remediation / Recommendation
                        </Label>
                        <Textarea
                            id="recommendation"
                            placeholder="Steps to fix the vulnerability..."
                            className="bg-muted/30 border-border/50 min-h-[80px]"
                            value={form.recommendation}
                            onChange={update("recommendation")}
                        />
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label htmlFor="tags" className="text-xs uppercase tracking-wider text-muted-foreground">Tags</Label>
                        <Input
                            id="tags"
                            placeholder="injection, authentication, api"
                            className="bg-muted/30 border-border/50"
                            value={form.tags}
                            onChange={update("tags")}
                        />
                        <p className="text-[10px] text-muted-foreground">Comma-separated</p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border/50">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>
                            ) : (
                                <><Plus className="mr-2 h-4 w-4" />Create Finding</>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
