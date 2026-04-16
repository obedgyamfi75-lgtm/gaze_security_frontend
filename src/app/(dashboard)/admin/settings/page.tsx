"use client";

import * as React from "react";
import {
  Settings,
  Shield,
  Key,
  Bell,
  Mail,
  Globe,
  Database,
  Lock,
  Clock,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Palette,
  FileText,
  Webhook,
  Zap,
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { settingsApi } from "@/lib/api";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState("general");
  const [saved, setSaved] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [settings, setSettings] = React.useState<Record<string, unknown>>({});
  const settingsRef = React.useRef<Record<string, unknown>>({});

  React.useEffect(() => {
    settingsApi.get().then((r) => {
      if (r.success && r.data) {
        setSettings(r.data);
        settingsRef.current = r.data;
      }
    }).catch(() => { });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsApi.update(settingsRef.current);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // silent
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: string, value: unknown) => {
    settingsRef.current = { ...settingsRef.current, [key]: value };
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure platform settings and preferences
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
        >
          {saved ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Saved!
            </>
          ) : isSaving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <Card className="bg-card/50 border-border/50 lg:w-64 shrink-0">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {[
                { id: "general", label: "General", icon: Settings },
                { id: "security", label: "Security", icon: Shield },
                { id: "notifications", label: "Notifications", icon: Bell },
                { id: "integrations", label: "Integrations", icon: Webhook },
                { id: "reports", label: "Reports", icon: FileText },
                { id: "advanced", label: "Advanced", icon: Zap },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      activeTab === item.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="flex-1 space-y-6">
          {activeTab === "general" && <GeneralSettings settings={settings} onUpdate={updateSetting} />}
          {activeTab === "security" && <SecuritySettings settings={settings} onUpdate={updateSetting} />}
          {activeTab === "notifications" && <NotificationSettings settings={settings} onUpdate={updateSetting} />}
          {activeTab === "integrations" && <IntegrationSettings settings={settings} onUpdate={updateSetting} />}
          {activeTab === "reports" && <ReportSettings settings={settings} onUpdate={updateSetting} />}
          {activeTab === "advanced" && <AdvancedSettings settings={settings} onUpdate={updateSetting} />}
        </div>
      </div>
    </div>
  );
}

// General Settings
function GeneralSettings({ settings, onUpdate }: { settings: Record<string, unknown>; onUpdate: (key: string, value: unknown) => void }) {
  return (
    <div className="space-y-6">
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Organization</CardTitle>
          <CardDescription>Basic organization settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Organization Name</Label>
              <Input
                value={(settings.organizationName as string) ?? ""}
                onChange={(e) => onUpdate("organizationName", e.target.value)}
                className="bg-muted/30 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Domain</Label>
              <Input
                value={(settings.domain as string) ?? ""}
                onChange={(e) => onUpdate("domain", e.target.value)}
                className="bg-muted/30 border-border/50"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Timezone</Label>
            <Select
              value={(settings.timezone as string) || "gmt"}
              onValueChange={(v) => onUpdate("timezone", v)}
            >
              <SelectTrigger className="bg-muted/30 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gmt">GMT (UTC+0)</SelectItem>
                <SelectItem value="est">EST (UTC-5)</SelectItem>
                <SelectItem value="pst">PST (UTC-8)</SelectItem>
                <SelectItem value="cet">CET (UTC+1)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>Customize the platform appearance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dark Mode</Label>
              <p className="text-xs text-muted-foreground">Use dark theme across the platform</p>
            </div>
            <Switch
              checked={(settings.darkMode as boolean) ?? true}
              onCheckedChange={(v) => onUpdate("darkMode", v)}
            />
          </div>
          <Separator className="bg-border/50" />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Compact Mode</Label>
              <p className="text-xs text-muted-foreground">Reduce spacing for denser layouts</p>
            </div>
            <Switch
              checked={(settings.compactMode as boolean) ?? false}
              onCheckedChange={(v) => onUpdate("compactMode", v)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Security Settings
function SecuritySettings({ settings, onUpdate }: { settings: Record<string, unknown>; onUpdate: (key: string, value: unknown) => void }) {
  const ipAllowlistEnabled = (settings.ipAllowlistEnabled as boolean) ?? false;
  return (
    <div className="space-y-6">
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Authentication</CardTitle>
          <CardDescription>Configure authentication requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enforce MFA</Label>
              <p className="text-xs text-muted-foreground">Require MFA for all users</p>
            </div>
            <Switch
              checked={(settings.enforceMfa as boolean) ?? true}
              onCheckedChange={(v) => onUpdate("enforceMfa", v)}
            />
          </div>
          <Separator className="bg-border/50" />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SSO Only</Label>
              <p className="text-xs text-muted-foreground">Disable password-based authentication</p>
            </div>
            <Switch
              checked={(settings.ssoOnly as boolean) ?? false}
              onCheckedChange={(v) => onUpdate("ssoOnly", v)}
            />
          </div>
          <Separator className="bg-border/50" />
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Session Timeout</Label>
            <Select
              value={String(settings.sessionTimeout ?? "60")}
              onValueChange={(v) => onUpdate("sessionTimeout", Number(v))}
            >
              <SelectTrigger className="bg-muted/30 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="480">8 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Password Policy</CardTitle>
          <CardDescription>Set password requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Minimum Length</Label>
            <Select
              value={String(settings.passwordMinLength ?? "12")}
              onValueChange={(v) => onUpdate("passwordMinLength", Number(v))}
            >
              <SelectTrigger className="bg-muted/30 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8">8 characters</SelectItem>
                <SelectItem value="10">10 characters</SelectItem>
                <SelectItem value="12">12 characters</SelectItem>
                <SelectItem value="16">16 characters</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Requirements</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="req-upper"
                  checked={(settings.pwRequireUppercase as boolean) ?? true}
                  onCheckedChange={(v) => onUpdate("pwRequireUppercase", v)}
                />
                <label htmlFor="req-upper" className="text-sm">Uppercase letters</label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="req-lower"
                  checked={(settings.pwRequireLowercase as boolean) ?? true}
                  onCheckedChange={(v) => onUpdate("pwRequireLowercase", v)}
                />
                <label htmlFor="req-lower" className="text-sm">Lowercase letters</label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="req-number"
                  checked={(settings.pwRequireNumbers as boolean) ?? true}
                  onCheckedChange={(v) => onUpdate("pwRequireNumbers", v)}
                />
                <label htmlFor="req-number" className="text-sm">Numbers</label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="req-special"
                  checked={(settings.pwRequireSpecial as boolean) ?? true}
                  onCheckedChange={(v) => onUpdate("pwRequireSpecial", v)}
                />
                <label htmlFor="req-special" className="text-sm">Special characters</label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base">IP Restrictions</CardTitle>
          <CardDescription>Limit access by IP address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable IP Allowlist</Label>
              <p className="text-xs text-muted-foreground">Only allow access from specific IPs</p>
            </div>
            <Switch
              checked={ipAllowlistEnabled}
              onCheckedChange={(v) => onUpdate("ipAllowlistEnabled", v)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Allowed IPs</Label>
            <Input
              placeholder="192.168.1.0/24, 10.0.0.0/8"
              className="font-mono bg-muted/30 border-border/50"
              disabled={!ipAllowlistEnabled}
              value={(settings.allowedIps as string) ?? ""}
              onChange={(e) => onUpdate("allowedIps", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Notification Settings
function NotificationSettings({ settings, onUpdate }: { settings: Record<string, unknown>; onUpdate: (key: string, value: unknown) => void }) {
  const slackEnabled = (settings.slackEnabled as boolean) ?? false;
  return (
    <div className="space-y-6">
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Email Notifications</CardTitle>
          <CardDescription>Configure email notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Critical Findings</Label>
              <p className="text-xs text-muted-foreground">Notify on new critical findings</p>
            </div>
            <Switch
              checked={(settings.notifyCriticalFindings as boolean) ?? true}
              onCheckedChange={(v) => onUpdate("notifyCriticalFindings", v)}
            />
          </div>
          <Separator className="bg-border/50" />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Assessment Complete</Label>
              <p className="text-xs text-muted-foreground">Notify when assessments finish</p>
            </div>
            <Switch
              checked={(settings.notifyAssessmentComplete as boolean) ?? true}
              onCheckedChange={(v) => onUpdate("notifyAssessmentComplete", v)}
            />
          </div>
          <Separator className="bg-border/50" />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SLA Warnings</Label>
              <p className="text-xs text-muted-foreground">Notify before SLA breaches</p>
            </div>
            <Switch
              checked={(settings.notifySlaWarnings as boolean) ?? true}
              onCheckedChange={(v) => onUpdate("notifySlaWarnings", v)}
            />
          </div>
          <Separator className="bg-border/50" />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Summary</Label>
              <p className="text-xs text-muted-foreground">Send weekly security digest</p>
            </div>
            <Switch
              checked={(settings.notifyWeeklySummary as boolean) ?? true}
              onCheckedChange={(v) => onUpdate("notifyWeeklySummary", v)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Slack Integration</CardTitle>
          <CardDescription>Send notifications to Slack</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Slack Notifications</Label>
              <p className="text-xs text-muted-foreground">Post updates to Slack channel</p>
            </div>
            <Switch
              checked={slackEnabled}
              onCheckedChange={(v) => onUpdate("slackEnabled", v)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Webhook URL</Label>
            <Input
              placeholder="https://hooks.slack.com/services/..."
              className="font-mono bg-muted/30 border-border/50"
              disabled={!slackEnabled}
              value={(settings.slackWebhookUrl as string) ?? ""}
              onChange={(e) => onUpdate("slackWebhookUrl", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Channel</Label>
            <Input
              placeholder="#security-alerts"
              className="bg-muted/30 border-border/50"
              disabled={!slackEnabled}
              value={(settings.slackChannel as string) ?? ""}
              onChange={(e) => onUpdate("slackChannel", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Integration Settings
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function IntegrationSettings({ settings, onUpdate }: { settings: Record<string, unknown>; onUpdate: (key: string, value: unknown) => void }) {
  const integrations = [
    { name: "Jira", description: "Sync findings with Jira issues", connected: true, icon: "🎫" },
    { name: "GitHub", description: "Create issues from findings", connected: false, icon: "🐙" },
    { name: "Slack", description: "Real-time notifications", connected: true, icon: "💬" },
    { name: "PagerDuty", description: "Alert on-call engineers", connected: false, icon: "📟" },
    { name: "Splunk", description: "Send logs to SIEM", connected: false, icon: "📊" },
    { name: "ServiceNow", description: "Create incidents", connected: false, icon: "🎟️" },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Connected Services</CardTitle>
          <CardDescription>Manage third-party integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {integrations.map((integration) => (
              <div key={integration.name} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50 text-xl">
                    {integration.icon}
                  </div>
                  <div>
                    <p className="font-medium">{integration.name}</p>
                    <p className="text-xs text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {integration.connected ? (
                    <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20">
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] bg-muted/50 text-muted-foreground border-border/50">
                      Not Connected
                    </Badge>
                  )}
                  <Button variant="outline" size="sm" className="border-border/50">
                    {integration.connected ? "Configure" : "Connect"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base">API Access</CardTitle>
          <CardDescription>Manage API keys and access tokens</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
            <div>
              <p className="font-medium font-mono text-sm">sk_live_****************************</p>
              <p className="text-xs text-muted-foreground">Created Dec 15, 2024 • Last used today</p>
            </div>
            <Button variant="outline" size="sm" className="border-border/50 text-red-500 hover:text-red-500">
              Revoke
            </Button>
          </div>
          <Button variant="outline" className="border-border/50">
            <Key className="mr-2 h-4 w-4" />
            Generate New API Key
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Report Settings
function ReportSettings({ settings, onUpdate }: { settings: Record<string, unknown>; onUpdate: (key: string, value: unknown) => void }) {
  return (
    <div className="space-y-6">
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Report Defaults</CardTitle>
          <CardDescription>Default settings for generated reports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Default Format</Label>
            <Select
              value={(settings.reportDefaultFormat as string) ?? "pdf"}
              onValueChange={(v) => onUpdate("reportDefaultFormat", v)}
            >
              <SelectTrigger className="bg-muted/30 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="docx">Word (DOCX)</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Default Template</Label>
            <Select
              value={(settings.reportDefaultTemplate as string) ?? "executive"}
              onValueChange={(v) => onUpdate("reportDefaultTemplate", v)}
            >
              <SelectTrigger className="bg-muted/30 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="executive">Executive Summary</SelectItem>
                <SelectItem value="technical">Technical Report</SelectItem>
                <SelectItem value="compliance">Compliance Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Branding</CardTitle>
          <CardDescription>Customize report branding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Company Logo</Label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-32 rounded-lg border border-dashed border-border/50 flex items-center justify-center bg-muted/30">
                <span className="text-xs text-muted-foreground">No logo</span>
              </div>
              <Button variant="outline" size="sm" className="border-border/50">
                Upload Logo
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Report Footer</Label>
            <Input
              value={(settings.reportFooter as string) ?? "Confidential - GAZE Security Team"}
              onChange={(e) => onUpdate("reportFooter", e.target.value)}
              className="bg-muted/30 border-border/50"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base">SLA Configuration</CardTitle>
          <CardDescription>Set remediation SLA targets by severity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-red-500">Critical SLA</Label>
              <Select
                value={String(settings.slaCriticalDays ?? "7")}
                onValueChange={(v) => onUpdate("slaCriticalDays", Number(v))}
              >
                <SelectTrigger className="bg-muted/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-orange-500">High SLA</Label>
              <Select
                value={String(settings.slaHighDays ?? "14")}
                onValueChange={(v) => onUpdate("slaHighDays", Number(v))}
              >
                <SelectTrigger className="bg-muted/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-yellow-500">Medium SLA</Label>
              <Select
                value={String(settings.slaMediumDays ?? "30")}
                onValueChange={(v) => onUpdate("slaMediumDays", Number(v))}
              >
                <SelectTrigger className="bg-muted/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-green-500">Low SLA</Label>
              <Select
                value={String(settings.slaLowDays ?? "90")}
                onValueChange={(v) => onUpdate("slaLowDays", Number(v))}
              >
                <SelectTrigger className="bg-muted/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Advanced Settings
function AdvancedSettings({ settings, onUpdate }: { settings: Record<string, unknown>; onUpdate: (key: string, value: unknown) => void }) {
  return (
    <div className="space-y-6">
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Data Management</CardTitle>
          <CardDescription>Configure data retention and cleanup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Audit Log Retention</Label>
            <Select
              value={String(settings.auditLogRetentionDays ?? "365")}
              onValueChange={(v) => onUpdate("auditLogRetentionDays", Number(v))}
            >
              <SelectTrigger className="bg-muted/30 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
                <SelectItem value="730">2 years</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Evidence Retention</Label>
            <Select
              value={String(settings.evidenceRetentionDays ?? "180")}
              onValueChange={(v) => onUpdate("evidenceRetentionDays", Number(v))}
            >
              <SelectTrigger className="bg-muted/30 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base">System</CardTitle>
          <CardDescription>System maintenance options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
            <div>
              <p className="font-medium">Database Status</p>
              <p className="text-xs text-muted-foreground">PostgreSQL 15.2 • 2.4 GB used</p>
            </div>
            <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20">
              Healthy
            </Badge>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
            <div>
              <p className="font-medium">Last Backup</p>
              <p className="text-xs text-muted-foreground">December 30, 2024 at 03:00 AM</p>
            </div>
            <Button variant="outline" size="sm" className="border-border/50">
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Backup Now
            </Button>
          </div>
          <Separator className="bg-border/50" />
          <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-500">Danger Zone</p>
                <p className="text-xs text-muted-foreground mt-1">
                  These actions are irreversible. Please proceed with caution.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="border-red-500/50 text-red-500 hover:bg-red-500/10">
                    Clear All Data
                  </Button>
                  <Button variant="outline" size="sm" className="border-red-500/50 text-red-500 hover:bg-red-500/10">
                    Reset Platform
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}