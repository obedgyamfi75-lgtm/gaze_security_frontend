"use client";

import * as React from "react";
import {
  Play,
  Square,
  Target,
  Globe,
  Server,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Download,
  Trash2,
  Plus,
  Settings,
  History,
  Terminal,
  Activity,
  Zap,
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Types
interface ScanResult {
  id: string;
  url: string;
  status: number;
  contentLength: number;
  contentType: string;
  responseTime: number;
  timestamp: string;
  flags: string[];
}

interface ScanJob {
  id: string;
  target: string;
  status: "running" | "completed" | "failed" | "stopped";
  startedAt: string;
  completedAt?: string;
  totalRequests: number;
  successCount: number;
  errorCount: number;
  findings: number;
}

// Mock scan history
const scanHistory: ScanJob[] = [
  {
    id: "SCAN-001",
    target: "api.gazesecurity.com",
    status: "completed",
    startedAt: "2024-12-30T10:30:00",
    completedAt: "2024-12-30T10:35:22",
    totalRequests: 1250,
    successCount: 1180,
    errorCount: 70,
    findings: 12,
  },
  {
    id: "SCAN-002",
    target: "merchant.gazesecurity.com",
    status: "completed",
    startedAt: "2024-12-29T14:15:00",
    completedAt: "2024-12-29T14:22:45",
    totalRequests: 890,
    successCount: 845,
    errorCount: 45,
    findings: 8,
  },
  {
    id: "SCAN-003",
    target: "payment-api.gazesecurity.com",
    status: "failed",
    startedAt: "2024-12-28T09:00:00",
    totalRequests: 234,
    successCount: 120,
    errorCount: 114,
    findings: 2,
  },
];

// Mock live results
const mockResults: ScanResult[] = [
  { id: "1", url: "/api/v1/users", status: 200, contentLength: 1250, contentType: "application/json", responseTime: 45, timestamp: "10:30:01", flags: [] },
  { id: "2", url: "/api/v1/users/1", status: 200, contentLength: 890, contentType: "application/json", responseTime: 32, timestamp: "10:30:02", flags: ["IDOR_CANDIDATE"] },
  { id: "3", url: "/api/v1/admin", status: 403, contentLength: 120, contentType: "application/json", responseTime: 28, timestamp: "10:30:03", flags: [] },
  { id: "4", url: "/api/v1/users/2", status: 200, contentLength: 892, contentType: "application/json", responseTime: 35, timestamp: "10:30:04", flags: ["IDOR_CANDIDATE"] },
  { id: "5", url: "/api/v1/config", status: 401, contentLength: 85, contentType: "application/json", responseTime: 22, timestamp: "10:30:05", flags: [] },
  { id: "6", url: "/api/v1/debug", status: 200, contentLength: 2450, contentType: "application/json", responseTime: 120, timestamp: "10:30:06", flags: ["SENSITIVE_ENDPOINT"] },
  { id: "7", url: "/api/v1/users/3", status: 200, contentLength: 888, contentType: "application/json", responseTime: 38, timestamp: "10:30:07", flags: ["IDOR_CANDIDATE"] },
  { id: "8", url: "/api/v1/health", status: 200, contentLength: 45, contentType: "application/json", responseTime: 12, timestamp: "10:30:08", flags: [] },
  { id: "9", url: "/.env", status: 200, contentLength: 1200, contentType: "text/plain", responseTime: 18, timestamp: "10:30:09", flags: ["SENSITIVE_FILE"] },
  { id: "10", url: "/api/v1/transactions", status: 200, contentLength: 5600, contentType: "application/json", responseTime: 89, timestamp: "10:30:10", flags: [] },
];

export default function ReconPage() {
  const [target, setTarget] = React.useState("");
  const [isScanning, setIsScanning] = React.useState(false);
  const [scanProgress, setScanProgress] = React.useState(0);
  const [results, setResults] = React.useState<ScanResult[]>([]);
  const [activeTab, setActiveTab] = React.useState("scan");
  const [wordlist, setWordlist] = React.useState("common");
  const [threads, setThreads] = React.useState("10");
  const [timeout, setTimeout] = React.useState("5");
  const [history, setHistory] = React.useState<ScanJob[]>(scanHistory);

  // Simulate scan
  const startScan = () => {
    if (!target) return;
    setIsScanning(true);
    setResults([]);
    setScanProgress(0);

    // Simulate progressive results
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setScanProgress(progress);

      const newResults = mockResults.slice(0, Math.floor(progress / 10));
      setResults(newResults);

      if (progress >= 100) {
        clearInterval(interval);
        setIsScanning(false);
      }
    }, 500);
  };

  const stopScan = () => {
    setIsScanning(false);
  };

  const handleCopyResults = () => {
    navigator.clipboard.writeText(JSON.stringify(results, null, 2));
  };

  const handleExportResults = () => {
    const headers = ["URL", "Status", "Content-Length", "Content-Type", "Response-Time-ms", "Flags"];
    const rows = results.map((r) => [
      r.url,
      String(r.status),
      String(r.contentLength),
      r.contentType,
      String(r.responseTime),
      r.flags.join("|"),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `recon-results-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleViewHistoryJob = (job: ScanJob) => {
    setActiveTab("scan");
    setTarget(job.target);
    setResults(mockResults.slice(0, Math.min(job.findings + 3, mockResults.length)));
    setScanProgress(100);
  };

  const handleDeleteHistoryJob = (jobId: string) => {
    setHistory((prev) => prev.filter((j) => j.id !== jobId));
  };

  const stats = {
    total: results.length,
    success: results.filter(r => r.status >= 200 && r.status < 300).length,
    errors: results.filter(r => r.status >= 400).length,
    findings: results.filter(r => r.flags.length > 0).length,
  };

  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      <div className="flex items-center gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-600 dark:text-yellow-400">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>
          <strong>Demo Mode</strong> — This tool simulates HTTP reconnaissance. No actual requests are sent to any target. Results shown are mock data for demonstration purposes only.
        </span>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">HTTP Reconnaissance</h1>
          <p className="text-sm text-muted-foreground">
            Enumerate endpoints and discover hidden resources
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-border/50">
            <History className="mr-2 h-4 w-4" />
            History
          </Button>
          <Button variant="outline" className="border-border/50">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/30 border border-border/50">
          <TabsTrigger value="scan" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Target className="mr-2 h-4 w-4" />
            New Scan
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <History className="mr-2 h-4 w-4" />
            Scan History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="space-y-6 mt-6">
          {/* Scan Configuration */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Target Configuration</CardTitle>
              <CardDescription>Configure your reconnaissance scan parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Target Input */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Target URL</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="https://api.example.com"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      className="pl-10 font-mono bg-muted/30 border-border/50"
                    />
                  </div>
                  {!isScanning ? (
                    <Button
                      onClick={startScan}
                      disabled={!target}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Start Scan
                    </Button>
                  ) : (
                    <Button
                      onClick={stopScan}
                      variant="destructive"
                    >
                      <Square className="mr-2 h-4 w-4" />
                      Stop
                    </Button>
                  )}
                </div>
              </div>

              {/* Scan Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Wordlist</Label>
                  <Select value={wordlist} onValueChange={setWordlist}>
                    <SelectTrigger className="bg-muted/30 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="common">Common (1k)</SelectItem>
                      <SelectItem value="medium">Medium (10k)</SelectItem>
                      <SelectItem value="large">Large (100k)</SelectItem>
                      <SelectItem value="api">API Endpoints</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Threads</Label>
                  <Select value={threads} onValueChange={setThreads}>
                    <SelectTrigger className="bg-muted/30 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 threads</SelectItem>
                      <SelectItem value="10">10 threads</SelectItem>
                      <SelectItem value="20">20 threads</SelectItem>
                      <SelectItem value="50">50 threads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Timeout</Label>
                  <Select value={timeout} onValueChange={setTimeout}>
                    <SelectTrigger className="bg-muted/30 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 seconds</SelectItem>
                      <SelectItem value="5">5 seconds</SelectItem>
                      <SelectItem value="10">10 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Additional Options */}
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="follow-redirects" defaultChecked />
                  <label htmlFor="follow-redirects" className="text-sm">Follow Redirects</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="detect-rate-limit" defaultChecked />
                  <label htmlFor="detect-rate-limit" className="text-sm">Detect Rate Limiting</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="recursive" />
                  <label htmlFor="recursive" className="text-sm">Recursive Scan</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="extensions" />
                  <label htmlFor="extensions" className="text-sm">Add Extensions (.php, .js, .json)</label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scan Progress & Stats */}
          {(isScanning || results.length > 0) && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-primary/10">
                      <Activity className={cn("h-5 w-5 text-primary", isScanning && "animate-pulse")} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold font-mono text-primary">{stats.total}</p>
                      <p className="text-xs text-muted-foreground">Requests</p>
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
                      <p className="text-2xl font-bold font-mono text-green-500">{stats.success}</p>
                      <p className="text-xs text-muted-foreground">Success (2xx)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-red-500/10">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold font-mono text-red-500">{stats.errors}</p>
                      <p className="text-xs text-muted-foreground">Errors (4xx/5xx)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-yellow-500/10">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold font-mono text-yellow-500">{stats.findings}</p>
                      <p className="text-xs text-muted-foreground">Findings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Progress Bar */}
          {isScanning && (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm font-medium">Scanning {target}...</span>
                  </div>
                  <span className="text-sm font-mono text-muted-foreground">{scanProgress}%</span>
                </div>
                <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Table */}
          {results.length > 0 && (
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Scan Results</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="border-border/50" onClick={handleCopyResults}>
                      <Copy className="mr-2 h-3.5 w-3.5" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" className="border-border/50" onClick={handleExportResults}>
                      <Download className="mr-2 h-3.5 w-3.5" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-1">
                    {results.map((result) => (
                      <ResultRow key={result.id} result={result} />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6 mt-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Scan History</CardTitle>
              <CardDescription>Previous reconnaissance scans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No scan history</p>
                )}
                {history.map((job) => (
                  <ScanJobRow
                    key={job.id}
                    job={job}
                    onViewResults={() => handleViewHistoryJob(job)}
                    onDelete={() => handleDeleteHistoryJob(job.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Result Row Component
function ResultRow({ result }: { result: ScanResult }) {
  const statusColor =
    result.status >= 200 && result.status < 300 ? "text-green-500" :
      result.status >= 300 && result.status < 400 ? "text-blue-500" :
        result.status >= 400 && result.status < 500 ? "text-yellow-500" :
          "text-red-500";

  return (
    <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/30 transition-colors group">
      <span className={cn("font-mono text-sm font-bold w-12", statusColor)}>
        {result.status}
      </span>
      <span className="font-mono text-sm flex-1 truncate">{result.url}</span>
      <span className="text-xs text-muted-foreground font-mono w-20 text-right">
        {result.contentLength} B
      </span>
      <span className="text-xs text-muted-foreground font-mono w-16 text-right">
        {result.responseTime}ms
      </span>
      <div className="flex gap-1 w-32 justify-end">
        {result.flags.map((flag) => (
          <Badge
            key={flag}
            variant="outline"
            className={cn(
              "text-[9px]",
              flag === "IDOR_CANDIDATE" && "bg-orange-500/10 text-orange-500 border-orange-500/20",
              flag === "SENSITIVE_ENDPOINT" && "bg-red-500/10 text-red-500 border-red-500/20",
              flag === "SENSITIVE_FILE" && "bg-red-500/10 text-red-500 border-red-500/20",
            )}
          >
            {flag.replace(/_/g, " ")}
          </Badge>
        ))}
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
        <ExternalLink className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

// Scan Job Row Component
function ScanJobRow({ job, onViewResults, onDelete }: { job: ScanJob; onViewResults?: () => void; onDelete?: () => void }) {
  const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
    running: { color: "text-yellow-500", bg: "bg-yellow-500/10", icon: Loader2 },
    completed: { color: "text-green-500", bg: "bg-green-500/10", icon: CheckCircle2 },
    failed: { color: "text-red-500", bg: "bg-red-500/10", icon: AlertCircle },
    stopped: { color: "text-muted-foreground", bg: "bg-muted/50", icon: Square },
  };

  const status = statusConfig[job.status];
  const StatusIcon = status.icon;

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
      <div className={cn("p-2 rounded-lg", status.bg)}>
        <StatusIcon className={cn("h-4 w-4", status.color, job.status === "running" && "animate-spin")} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">{job.target}</span>
          <Badge variant="outline" className="text-[10px] bg-muted/50 border-border/50">
            {job.id}
          </Badge>
        </div>
        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
          <span>{new Date(job.startedAt).toLocaleString()}</span>
          <span>{job.totalRequests} requests</span>
          {job.findings > 0 && (
            <span className="text-yellow-500">{job.findings} findings</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="border-border/50" onClick={onViewResults}>
          View Results
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}