// "use client";

// // import { useState } from "react";
// import * as React from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { cn } from "@/lib/utils";
// import { findingsApi } from "@/lib/api";
// import type { Severity, FindingStatus } from "@/types";
// import { Plus } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";

// // You can later replace with react-hook-form + zod for proper validation
// type FormData = {
//   title: string;
//   description: string;
//   remediation?: string;
//   severity: Severity;
//   cvssScore?: number;
//   cweId?: string;
//   assetId?: string;     // you'll probably want a product/asset select
//   dueDate?: string;
//   status?: FindingStatus;
// };

// const defaultForm: FormData = {
//   title: "",
//   description: "",
//   severity: "medium",
//   assetId: "",
//   status: "open",
// };


// interface CreateAssessmentDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   assets: Asset[];
//   users?: UserRef[];
//   onSuccess?: () => void;
// }

// export function CreateFindingDialog({open, onOpenChange, findings, users = [], onSuccess}: { onFindingCreated: () => void }) {
//   const [open, setOpen] = React.useState(false);
// //   const [form, setForm] = useState<FormData>(defaultForm);

// const [form, setForm] = React.useState<{
//     title: string, 
//     description: string,
//     severity: Severity,
//     assestId: string,
//     assessmentId?: string;
//     cweId?: string;
//     cvssScore?: number;
//     remediation?: string;
//     tags?: string[];
//     status?: FindingStatus;
// }>({
//     title: "", 
//     description: "",
//     severity: "low",
//     assestId: "",
// });
//   const [loading, setLoading] = React.useState(false);
//   const { toast } = useToast();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!form.title.trim() || !form.description.trim()) {
//       toast({ title: "Missing fields", description: "Title and description are required.", variant: "destructive" });
//       return;
//     }

//     setLoading(true);

//     try {
//       // adapt to your actual API shape
//       await findingsApi.create({
//         ...form,
//       });

//       toast({ title: "Finding created", description: "New security finding has been added." });
//       setForm(defaultForm);
//       setOpen(false);
//       onFindingCreated();
//     } catch (err: any) {
//       toast({
//         title: "Failed to create finding",
//         description: err.message || "Something went wrong.",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
//           <Plus className="mr-2 h-4 w-4" />
//           Add Finding
//         </Button>
//       </DialogTrigger>

//       <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto bg-card border-border/50">
//         <DialogHeader>
//           <DialogTitle className="text-xl">Create New Security Finding</DialogTitle>
//           <DialogDescription>
//             Add a new vulnerability or security issue to the tracking system.
//           </DialogDescription>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-6 py-4">
//           {/* Title */}
//           <div className="space-y-2">
//             <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
//             <Input
//               id="title"
//               value={form.title}
//               onChange={(e) => setForm({ ...form, title: e.target.value })}
//               placeholder="e.g. Unauthenticated SSRF in payment gateway"
//               required
//             />
//           </div>

//           {/* Severity & CVSS */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="space-y-2">
//               <Label>Severity <span className="text-red-500">*</span></Label>
//               <Select
//                 value={form.severity}
//                 onValueChange={(v) => setForm({ ...form, severity: v as Severity })}
//               >
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="critical">Critical</SelectItem>
//                   <SelectItem value="high">High</SelectItem>
//                   <SelectItem value="medium">Medium</SelectItem>
//                   <SelectItem value="low">Low</SelectItem>
//                   <SelectItem value="info">Info</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="cvss">CVSS Score</Label>
//               <Input
//                 id="cvss"
//                 type="number"
//                 step="0.1"
//                 min="0"
//                 max="10"
//                 value={form.cvssScore ?? ""}
//                 onChange={(e) => setForm({ ...form, cvssScore: e.target.value ? Number(e.target.value) : undefined })}
//                 placeholder="7.5"
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="cwe">CWE ID</Label>
//               <Input
//                 id="cwe"
//                 value={form.cweId ?? ""}
//                 onChange={(e) => setForm({ ...form, cweId: e.target.value })}
//                 placeholder="CWE-918"
//               />
//             </div>
//           </div>

//           {/* Description */}
//           <div className="space-y-2">
//             <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
//             <Textarea
//               id="description"
//               value={form.description}
//               onChange={(e) => setForm({ ...form, description: e.target.value })}
//               placeholder="Detailed explanation of the vulnerability..."
//               rows={5}
//               required
//             />
//           </div>

//           {/* Remediation */}
//           <div className="space-y-2">
//             <Label htmlFor="remediation">Recommended Remediation</Label>
//             <Textarea
//               id="remediation"
//               value={form.remediation ?? ""}
//               onChange={(e) => setForm({ ...form, remediation: e.target.value })}
//               placeholder="How to fix this issue..."
//               rows={3}
//             />
//           </div>

//           {/* Due Date & Status */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="dueDate">Due Date</Label>
//               <Input
//                 id="dueDate"
//                 type="date"
//                 value={form.dueDate ?? ""}
//                 onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label>Initial Status</Label>
//               <Select
//                 value={form.status}
//                 onValueChange={(v) => setForm({ ...form, status: v as FindingStatus })}
//               >
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="open">Open</SelectItem>
//                   <SelectItem value="in_progress">In Progress</SelectItem>
//                   <SelectItem value="accepted">Accepted</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <DialogFooter className="pt-4 border-t border-border/50">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => setOpen(false)}
//               disabled={loading}
//               className="border-border/50"
//             >
//               Cancel
//             </Button>
//             <Button type="submit" disabled={loading}>
//               {loading ? "Creating..." : "Create Finding"}
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }