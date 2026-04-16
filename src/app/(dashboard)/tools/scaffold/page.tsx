"use client";

import * as React from "react";
import {
  Wrench,
  Copy,
  Download,
  Play,
  FileCode,
  Settings,
  ChevronRight,
  CheckCircle2,
  Code,
  Terminal,
  FileText,
  Braces,
  Hash,
  Shield,
  Bug,
  Key,
  Lock,
  Users,
  Database,
  Globe,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFindings } from "@/hooks/use-data";
import { findingsApi } from "@/lib/api";
import { cn } from "@/lib/utils";

// Vulnerability Templates
const vulnTemplates = [
  { id: "idor", name: "IDOR", icon: Users, description: "Insecure Direct Object Reference", category: "access-control" },
  { id: "sqli", name: "SQL Injection", icon: Database, description: "SQL injection testing", category: "injection" },
  { id: "xss", name: "XSS", icon: Code, description: "Cross-Site Scripting", category: "injection" },
  { id: "auth-bypass", name: "Auth Bypass", icon: Key, description: "Authentication bypass", category: "authentication" },
  { id: "broken-auth", name: "Broken Auth", icon: Lock, description: "Broken authentication checks", category: "authentication" },
  { id: "rate-limit", name: "Rate Limiting", icon: Zap, description: "Rate limit bypass testing", category: "business-logic" },
  { id: "ssrf", name: "SSRF", icon: Globe, description: "Server-Side Request Forgery", category: "injection" },
  { id: "api-abuse", name: "API Abuse", icon: Bug, description: "API endpoint abuse testing", category: "business-logic" },
];

const languageOptions = [
  { id: "python", name: "Python", extension: ".py" },
  { id: "bash", name: "Bash", extension: ".sh" },
  { id: "javascript", name: "JavaScript", extension: ".js" },
  { id: "go", name: "Go", extension: ".go" },
];

// Dynamic POC code generator
function buildPocCode(template: string, lang: string, target: string, date: string, vulnName: string): string {
  const targetHost = (() => { try { return new URL(target).hostname; } catch { return target || "example.com"; } })();
  const descriptions: Record<string, string> = {
    idor: "Tests for Insecure Direct Object Reference by iterating object IDs",
    sqli: "Tests for SQL Injection vulnerabilities in input parameters",
    xss: "Tests for Cross-Site Scripting vulnerabilities",
    "auth-bypass": "Tests for authentication bypass vulnerabilities",
    "broken-auth": "Tests for broken authentication and session management",
    "rate-limit": "Tests for rate limiting bypass",
    ssrf: "Tests for Server-Side Request Forgery",
    "api-abuse": "Tests for API endpoint abuse and business logic flaws",
  };
  const description = descriptions[template] ?? `Tests for ${vulnName} vulnerabilities`;

  if (lang === "python") {
    return `#!/usr/bin/env python3
"""
POC: ${vulnName} Test
Target: ${targetHost}
Generated: ${date}

Description:
  ${description}
"""

import requests
import argparse
from colorama import Fore, Style, init

init(autoreset=True)

BASE_URL = "${target}"


def run_test(session: requests.Session, base_url: str):
    """Run ${vulnName} test against ${targetHost}."""
    print(f"{Fore.CYAN}[*] Starting ${vulnName} test on {base_url}")

    # TODO: Add ${vulnName} test logic here
    response = session.get(base_url, timeout=10)
    print(f"{Fore.GREEN}[+] Status: {response.status_code}")

    print(f"\\n{Fore.YELLOW}[*] Test complete")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="${vulnName} Tester")
    parser.add_argument("-u", "--url", default=BASE_URL, help="Target base URL")
    parser.add_argument("-t", "--token", default="", help="Auth token")
    args = parser.parse_args()

    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    if args.token:
        s.headers.update({"Authorization": f"Bearer {args.token}"})

    run_test(s, args.url)
`;
  }

  if (lang === "bash") {
    return `#!/usr/bin/env bash
# POC: ${vulnName} Test
# Target: ${targetHost}
# Generated: ${date}
#
# Description: ${description}

TARGET="${target}"
TOKEN=""

run_test() {
    echo "[*] Starting ${vulnName} test on $TARGET"

    # TODO: Add ${vulnName} test logic here
    AUTH_HEADER=""
    if [ -n "$TOKEN" ]; then
        AUTH_HEADER="-H \\"Authorization: Bearer $TOKEN\\""
    fi
    curl -s -H "Content-Type: application/json" $AUTH_HEADER \\
         "$TARGET" | jq '.' 2>/dev/null || echo "Response received"

    echo "[+] Test complete"
}

while getopts "u:t:" opt; do
    case $opt in
        u) TARGET="$OPTARG" ;;
        t) TOKEN="$OPTARG" ;;
    esac
done

run_test
`;
  }

  if (lang === "javascript") {
    return `#!/usr/bin/env node
/**
 * POC: ${vulnName} Test
 * Target: ${targetHost}
 * Generated: ${date}
 *
 * Description: ${description}
 */

const BASE_URL = "${target}";

async function runTest(token = "") {
  console.log(\`[*] Starting ${vulnName} test on ${targetHost}\`);

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: \`Bearer \${token}\` }),
  };

  // TODO: Add ${vulnName} test logic here
  const response = await fetch(BASE_URL, { headers });
  const data = await response.json().catch(() => response.text());
  console.log(\`[+] Status: \${response.status}\`, data);

  console.log("[+] Test complete");
}

const token = process.argv[2] ?? "";
runTest(token).catch(console.error);
`;
  }

  if (lang === "go") {
    return `package main

// POC: ${vulnName} Test
// Target: ${targetHost}
// Generated: ${date}
//
// Description: ${description}

import (
	"fmt"
	"io"
	"net/http"
	"os"
)

const baseURL = "${target}"

func runTest(token string) {
	fmt.Printf("[*] Starting ${vulnName} test on ${targetHost}\\n")

	client := &http.Client{}
	req, err := http.NewRequest("GET", baseURL, nil)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[-] Error: %v\\n", err)
		return
	}
	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	// TODO: Add ${vulnName} test logic here
	resp, err := client.Do(req)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[-] Request error: %v\\n", err)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	fmt.Printf("[+] Status: %d\\n%s\\n", resp.StatusCode, string(body))
	fmt.Println("[+] Test complete")
}

func main() {
	token := ""
	if len(os.Args) > 1 {
		token = os.Args[1]
	}
	runTest(token)
}
`;
  }

  return sampleCode;
}

// Sample generated code (default / fallback)
const sampleCode = `#!/usr/bin/env python3
"""
POC: IDOR Vulnerability Test
Target: api.gazesecurity.com
Generated: 2024-12-30

Description:
  Tests for Insecure Direct Object Reference vulnerability
  by iterating through user IDs and checking access controls.
"""

import requests
import argparse
from colorama import Fore, Style, init

init(autoreset=True)

class IDORTester:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        })
    
    def test_user_endpoint(self, user_id: int) -> dict:
        """Test access to user endpoint with given ID."""
        url = f"{self.base_url}/api/v1/users/{user_id}"
        try:
            response = self.session.get(url, timeout=10)
            return {
                'user_id': user_id,
                'status': response.status_code,
                'accessible': response.status_code == 200,
                'response_length': len(response.content)
            }
        except requests.RequestException as e:
            return {
                'user_id': user_id,
                'status': 0,
                'accessible': False,
                'error': str(e)
            }
    
    def run_test(self, start_id: int = 1, end_id: int = 100):
        """Run IDOR test across range of user IDs."""
        print(f"{Fore.CYAN}[*] Starting IDOR test on {self.base_url}")
        print(f"{Fore.CYAN}[*] Testing user IDs {start_id} to {end_id}\\n")
        
        vulnerable_ids = []
        
        for user_id in range(start_id, end_id + 1):
            result = self.test_user_endpoint(user_id)
            
            if result['accessible']:
                print(f"{Fore.RED}[!] VULNERABLE: User ID {user_id} accessible")
                vulnerable_ids.append(user_id)
            else:
                print(f"{Fore.GREEN}[+] SECURE: User ID {user_id} - Status {result['status']}")
        
        print(f"\\n{Fore.YELLOW}[*] Test Complete")
        print(f"{Fore.YELLOW}[*] Vulnerable IDs found: {len(vulnerable_ids)}")
        
        return vulnerable_ids


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="IDOR Vulnerability Tester")
    parser.add_argument("-u", "--url", required=True, help="Base URL of target")
    parser.add_argument("-t", "--token", required=True, help="Auth token")
    parser.add_argument("-s", "--start", type=int, default=1, help="Start ID")
    parser.add_argument("-e", "--end", type=int, default=100, help="End ID")
    
    args = parser.parse_args()
    
    tester = IDORTester(args.url, args.token)
    tester.run_test(args.start, args.end)
`;

export default function ScaffoldPage() {
  const [selectedTemplate, setSelectedTemplate] = React.useState("idor");
  const [language, setLanguage] = React.useState("python");
  const [targetUrl, setTargetUrl] = React.useState("");
  const [generatedCode, setGeneratedCode] = React.useState(sampleCode);
  const [copied, setCopied] = React.useState(false);

  // Link to Finding state
  const [linkDialogOpen, setLinkDialogOpen] = React.useState(false);
  const [selectedFindingId, setSelectedFindingId] = React.useState("");
  const [isLinking, setIsLinking] = React.useState(false);
  const [linkSuccess, setLinkSuccess] = React.useState(false);
  const { data: findings } = useFindings();

  const handleLinkToFinding = async () => {
    if (!selectedFindingId) return;
    setIsLinking(true);
    try {
      const note = `[POC Scaffold]\nTemplate: ${selectedTemplate}\nLanguage: ${language}\nTarget: ${targetUrl || "N/A"}\n\n\`\`\`\n${generatedCode.slice(0, 500)}\n\`\`\``;
      await findingsApi.update(selectedFindingId, { pocCode: note });
      setLinkSuccess(true);
      setTimeout(() => {
        setLinkDialogOpen(false);
        setLinkSuccess(false);
        setSelectedFindingId("");
      }, 1500);
    } catch (err) {
      console.error("Failed to link finding:", err);
    } finally {
      setIsLinking(false);
    }
  };

  const selectedVuln = vulnTemplates.find(v => v.id === selectedTemplate);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = languageOptions.find((l) => l.id === language)?.extension ?? ".txt";
    const blob = new Blob([generatedCode], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `poc_${selectedTemplate}${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGenerate = () => {
    const vuln = vulnTemplates.find((v) => v.id === selectedTemplate);
    const date = new Date().toISOString().split("T")[0];
    setGeneratedCode(
      buildPocCode(selectedTemplate, language, targetUrl || "https://api.example.com", date, vuln?.name ?? "")
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">POC Scaffold</h1>
          <p className="text-sm text-muted-foreground">
            Generate proof-of-concept scripts from vulnerability templates
          </p>
        </div>
        <Button variant="outline" className="border-border/50">
          <FileCode className="mr-2 h-4 w-4" />
          My Templates
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Configuration */}
        <div className="lg:col-span-1 space-y-6">
          {/* Template Selection */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Vulnerability Template</CardTitle>
              <CardDescription>Select a vulnerability type to scaffold</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[280px] pr-4">
                <div className="space-y-2">
                  {vulnTemplates.map((template) => {
                    const Icon = template.icon;
                    return (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                          selectedTemplate === template.id
                            ? "border-primary/50 bg-primary/5"
                            : "border-border/50 hover:border-primary/30 hover:bg-muted/30"
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-lg",
                          selectedTemplate === template.id ? "bg-primary/10" : "bg-muted/50"
                        )}>
                          <Icon className={cn(
                            "h-4 w-4",
                            selectedTemplate === template.id ? "text-primary" : "text-muted-foreground"
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{template.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{template.description}</p>
                        </div>
                        {selectedTemplate === template.id && (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Configuration Options */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Configuration</CardTitle>
              <CardDescription>Customize the generated script</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Target URL</Label>
                <Input
                  placeholder="https://api.example.com"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="font-mono bg-muted/30 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="bg-muted/30 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((lang) => (
                      <SelectItem key={lang.id} value={lang.id}>
                        {lang.name} ({lang.extension})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="include-logging" defaultChecked />
                    <label htmlFor="include-logging" className="text-sm">Include logging</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="include-colors" defaultChecked />
                    <label htmlFor="include-colors" className="text-sm">Colorized output</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="include-argparse" defaultChecked />
                    <label htmlFor="include-argparse" className="text-sm">CLI arguments</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="include-proxy" />
                    <label htmlFor="include-proxy" className="text-sm">Proxy support</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="include-export" />
                    <label htmlFor="include-export" className="text-sm">Export results (JSON/CSV)</label>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              >
                <Wrench className="mr-2 h-4 w-4" />
                Generate POC Script
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Code Output */}
        <div className="lg:col-span-2">
          <Card className="bg-card/50 border-border/50 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    Generated Code
                  </CardTitle>
                  <CardDescription>
                    {selectedVuln?.name} POC in {languageOptions.find(l => l.id === language)?.name}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border/50"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" className="border-border/50" onClick={handleDownload}>
                    <Download className="mr-2 h-3.5 w-3.5" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Code Header */}
                <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border border-border/50 rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/70" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                      <div className="w-3 h-3 rounded-full bg-green-500/70" />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono ml-2">
                      poc_{selectedTemplate}{languageOptions.find(l => l.id === language)?.extension}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-muted/50 border-border/50">
                    {languageOptions.find(l => l.id === language)?.name}
                  </Badge>
                </div>

                {/* Code Content */}
                <ScrollArea className="h-[500px] border border-t-0 border-border/50 rounded-b-lg">
                  <pre className="p-4 text-sm font-mono leading-relaxed">
                    <code className="text-foreground">
                      {generatedCode.split('\n').map((line, i) => (
                        <div key={i} className="flex">
                          <span className="w-12 text-muted-foreground/50 select-none text-right pr-4">
                            {i + 1}
                          </span>
                          <span className={cn(
                            line.startsWith('#') || line.startsWith('"""') || line.startsWith('//')
                              ? "text-muted-foreground"
                              : line.includes('def ') || line.includes('class ') || line.includes('function ')
                                ? "text-primary"
                                : line.includes('import ') || line.includes('from ')
                                  ? "text-yellow-500"
                                  : line.includes("'") || line.includes('"')
                                    ? "text-green-500"
                                    : ""
                          )}>
                            {line || ' '}
                          </span>
                        </div>
                      ))}
                    </code>
                  </pre>
                </ScrollArea>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 mt-4">
                <Button variant="outline" size="sm" className="border-border/50" disabled title="Coming soon">
                  <Play className="mr-2 h-3.5 w-3.5" />
                  Test in Sandbox
                </Button>
                <Button variant="outline" size="sm" className="border-border/50" disabled title="Coming soon">
                  <FileText className="mr-2 h-3.5 w-3.5" />
                  Save as Template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border/50 hover:border-primary/50 hover:bg-primary/5"
                  onClick={() => setLinkDialogOpen(true)}
                >
                  <Shield className="mr-2 h-3.5 w-3.5" />
                  Link to Finding
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Link to Finding Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="max-w-sm bg-card border-border/50">
          <DialogHeader>
            <DialogTitle>Link to Finding</DialogTitle>
            <DialogDescription>
              Attach this POC scaffold to an existing finding. The generated code snippet will be saved as a note on the finding.
            </DialogDescription>
          </DialogHeader>
          {linkSuccess ? (
            <div className="flex items-center gap-2 text-green-500 py-4">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">Successfully linked to finding!</span>
            </div>
          ) : (
            <Select value={selectedFindingId} onValueChange={setSelectedFindingId}>
              <SelectTrigger className="bg-muted/30 border-border/50">
                <SelectValue placeholder="Select a finding..." />
              </SelectTrigger>
              <SelectContent>
                {findings.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    <span className="font-mono text-xs text-muted-foreground mr-2">{f.id}</span>
                    <span className="truncate">{f.title}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {!linkSuccess && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setLinkDialogOpen(false)} disabled={isLinking} className="border-border/50">
                Cancel
              </Button>
              <Button onClick={handleLinkToFinding} disabled={!selectedFindingId || isLinking}>
                {isLinking ? (
                  <><Bug className="mr-2 h-4 w-4 animate-pulse" />Linking...</>
                ) : (
                  <><Shield className="mr-2 h-4 w-4" />Link Finding</>
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}