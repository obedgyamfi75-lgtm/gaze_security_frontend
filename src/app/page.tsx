// import { redirect } from "next/navigation";

// export default function Home() {
//   redirect("/");
// }


"use client";

import * as React from "react";
import Link from "next/link";
import {
  Download,
  Eye,
  Shield,
  Zap,
  BarChart3,
  FileText,
  Clock,
  Layers,
  Table2,
  GitBranch,
  Terminal,
  ChevronDown,
  ArrowRight,
  Check,
  Star,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

type PricingTab = "platform" | "extension" | "bundle";

// =============================================================================
// LANDING PAGE
// =============================================================================

export default function LandingPage() {
  const [pricingTab, setPricingTab] = React.useState<PricingTab>("platform");
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#0a0c0f] text-white font-sans antialiased overflow-x-hidden">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(29,158,117,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(29,158,117,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      {/* Top radial glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(29,158,117,0.12) 0%, transparent 70%)",
        }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* NAVBAR                                                               */}
      {/* ------------------------------------------------------------------ */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0c0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#1D9E75] flex items-center justify-center flex-shrink-0">
              <GazeIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold tracking-widest text-white font-mono">
                GAZE SECURITY
              </span>
              {/* <span className="hidden sm:inline text-xs text-white/30 font-mono ml-1">
                / SecOps
              </span> */}
            </div>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {["Extension", "Platform", "Pricing", "Docs"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-xs font-mono text-white/50 hover:text-white/90 transition-colors tracking-wider uppercase"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Auth actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center px-4 py-1.5 text-xs font-mono text-white/60 hover:text-white border border-white/10 hover:border-white/20 rounded-md transition-all"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center px-4 py-1.5 text-xs font-mono bg-[#1D9E75] hover:bg-[#178a65] text-white rounded-md transition-colors font-semibold tracking-wide"
            >
              Sign up free
            </Link>
          </div>
        </div>
      </nav>

      {/* ------------------------------------------------------------------ */}
      {/* HERO                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative pt-24 pb-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          {/* Early access pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#1D9E75]/30 bg-[#1D9E75]/10 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse" />
            <span className="text-[11px] font-mono text-[#1D9E75] tracking-widest uppercase">
              Early access — GAZE v0.1
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[60px] font-bold leading-[1.08] tracking-tight mb-6">
            Agentic AI pentesting
            <br />
            <span className="text-[#1D9E75]">built for real</span> security
            teams
          </h1>

          <p className="text-base sm:text-lg text-white/50 leading-relaxed max-w-xl mx-auto mb-10">
            GAZE is a browser extension powered by agentic AI that autonomously
            discovers web application vulnerabilities — and feeds every finding
            into a full vulnerability management platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#extension"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-[#1D9E75] hover:bg-[#178a65] text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-[#1D9E75]/20"
            >
              <Download className="w-4 h-4" />
              Download extension
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 hover:border-white/20 text-white/70 hover:text-white rounded-lg text-sm font-mono transition-all"
            >
              View platform demo
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div className="max-w-3xl mx-auto mt-16 grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.06] rounded-xl overflow-hidden border border-white/[0.06]">
          {[
            { num: "12k+", label: "Vulnerabilities found" },
            { num: "340+", label: "Assets monitored" },
            { num: "98%", label: "SLA compliance" },
            { num: "<2min", label: "Mean time to detect" },
          ].map(({ num, label }) => (
            <div
              key={label}
              className="bg-white/[0.02] px-6 py-4 text-center"
            >
              <p className="text-2xl font-bold font-mono text-[#1D9E75]">
                {num}
              </p>
              <p className="text-xs text-white/40 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* GAZE EXTENSION                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section id="extension" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionLabel>GAZE browser extension</SectionLabel>
          <div className="mt-10 grid lg:grid-cols-2 gap-8 items-center">
            {/* Left: feature copy */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-blue-500/30 bg-blue-500/10 mb-4">
                <Zap className="w-3 h-3 text-blue-400" />
                <span className="text-[11px] font-mono text-blue-400 tracking-widest uppercase">
                  Powered by agentic AI
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-4">
                Pentest the web
                <br />
                <span className="text-[#1D9E75]">at AI speed</span>
              </h2>
              <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-md">
                GAZE sits in your browser and autonomously explores, probes, and
                reports on web application security — acting like a senior
                pentester without the billable hours.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Autonomous crawling & attack surface mapping",
                  "IDOR, auth bypass, rate limiting, injection detection",
                  "One-click POC generation with reproducible steps",
                  "Auto-syncs findings to your SecOps platform",
                  "MCP tool integration for custom AI workflows",
                ].map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-[#1D9E75] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-white/60">{feat}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-3 flex-wrap">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1D9E75] hover:bg-[#178a65] text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Add to Chrome
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-lg text-sm font-mono transition-all"
                >
                  View changelog
                </a>
              </div>
            </div>

            {/* Right: browser mockup */}
            <div className="relative">
              <div className="absolute -inset-px rounded-xl bg-gradient-to-b from-[#1D9E75]/20 to-transparent" />
              <div className="relative bg-[#111418] rounded-xl border border-white/[0.08] overflow-hidden">
                {/* Browser chrome */}
                <div className="bg-[#0d1014] px-4 py-3 flex items-center gap-3 border-b border-white/[0.06]">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E24B4A]/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF9F27]/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#639922]/70" />
                  </div>
                  <div className="flex-1 bg-white/[0.04] rounded px-3 py-1 text-[11px] font-mono text-white/30">
                    app.example.com/checkout
                  </div>
                  <div className="w-6 h-5 rounded bg-[#1D9E75]/20 border border-[#1D9E75]/30 flex items-center justify-center">
                    <GazeIcon className="w-3 h-3 text-[#1D9E75]" />
                  </div>
                </div>
                {/* Scan status */}
                <div className="px-4 py-2.5 bg-[#1D9E75]/10 border-b border-[#1D9E75]/20 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse" />
                  <span className="text-[11px] font-mono text-[#1D9E75]">
                    GAZE scanning… 14 endpoints found
                  </span>
                </div>
                {/* Findings */}
                <div className="p-4 space-y-2.5">
                  {[
                    {
                      sev: "CRITICAL",
                      sevColor: "text-red-400 bg-red-500/10 border-red-500/20",
                      title: "IDOR on /api/v2/orders/{id}",
                      detail: "GET /api/v2/orders/38921 → 200 (other user data)",
                    },
                    {
                      sev: "HIGH",
                      sevColor:
                        "text-orange-400 bg-orange-500/10 border-orange-500/20",
                      title: "Missing rate limiting on /auth/otp",
                      detail: "POST /auth/otp → 429 not triggered at 1000 req",
                    },
                    {
                      sev: "MEDIUM",
                      sevColor:
                        "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
                      title: "Reflected parameter in search",
                      detail: "GET /search?q=<script> → unescaped output",
                    },
                  ].map((f) => (
                    <div
                      key={f.title}
                      className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3"
                    >
                      <span
                        className={cn(
                          "inline-block text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border mb-1.5",
                          f.sevColor
                        )}
                      >
                        {f.sev}
                      </span>
                      <p className="text-xs font-medium text-white/80">
                        {f.title}
                      </p>
                      <p className="text-[10px] font-mono text-white/30 mt-0.5">
                        {f.detail}
                      </p>
                    </div>
                  ))}
                  <p className="text-[10px] font-mono text-white/30 text-center pt-1">
                    3 findings synced to platform ↗
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* PLATFORM                                                             */}
      {/* ------------------------------------------------------------------ */}
      <section id="platform" className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <SectionLabel>Vulnerability management platform</SectionLabel>
          <div className="mt-3 flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                All your findings,
                <br />
                one command centre
              </h2>
            </div>
            <p className="text-sm text-white/40 max-w-xs leading-relaxed">
              Whether findings come from GAZE or manual assessments, every
              vulnerability is tracked through its full lifecycle.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLATFORM_FEATURES.map((feat) => (
              <FeatureCard key={feat.title} {...feat} />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* DOWNLOADS                                                            */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="downloads"
        className="py-20 px-6 border-t border-white/[0.06]"
      >
        <div className="max-w-6xl mx-auto">
          <SectionLabel>Downloads</SectionLabel>
          <div className="mt-3 mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Get GAZE on your machine
            </h2>
            <p className="text-sm text-white/40 mt-2 max-w-md leading-relaxed">
              The browser extension and MCP tool work together — the extension
              finds vulnerabilities, the MCP tool lets you build custom
              AI-powered security workflows.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {/* Chrome Extension */}
            <DownloadCard
              iconBg="bg-[#1D9E75]/15 border-[#1D9E75]/20"
              icon={<GazeIcon className="w-6 h-6 text-[#1D9E75]" />}
              name="GAZE for Chrome"
              desc="Agentic AI pentesting directly in your browser. Supports Chrome and all Chromium-based browsers."
              version="v0.1.0 · Chrome Web Store"
              ctaLabel="Download extension"
              ctaPrimary
              href="#"
            />
            {/* MCP Tool */}
            <DownloadCard
              iconBg="bg-purple-500/10 border-purple-500/20"
              icon={<Layers className="w-6 h-6 text-purple-400" />}
              name="GAZE MCP tool"
              desc="Integrate GAZE into your AI workflows via Model Context Protocol. Works with Claude, Cursor, and more."
              version="npm i gaze-mcp · MIT license"
              ctaLabel="Download MCP tool"
              href="#"
            />
            {/* CLI */}
            <DownloadCard
              iconBg="bg-blue-500/10 border-blue-500/20"
              icon={<Terminal className="w-6 h-6 text-blue-400" />}
              name="Open-source CLI"
              desc="The GAZE reconnaissance and scanning CLI. Run automated security assessments from your terminal."
              version="MIT · Star us on GitHub"
              ctaLabel="View on GitHub"
              href="https://github.com"
            />
          </div>

          {/* MCP integration note */}
          <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
              <GitBranch className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white/80">
                MCP tool — connect GAZE to any AI agent
              </p>
              <p className="text-xs text-white/40 mt-1 font-mono">
                npm install gaze-mcp &nbsp;·&nbsp; Works with Claude, Cursor,
                Continue, and any MCP-compatible client
              </p>
            </div>
            <a
              href="#"
              className="text-xs font-mono text-[#1D9E75] hover:text-[#17ba8a] flex items-center gap-1 flex-shrink-0 transition-colors"
            >
              Read the docs <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* PRICING                                                              */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="pricing"
        className="py-20 px-6 border-t border-white/[0.06]"
      >
        <div className="max-w-6xl mx-auto">
          <SectionLabel>Pricing</SectionLabel>
          <div className="mt-3 mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-sm text-white/40 max-w-xs leading-relaxed">
              Start free with the extension. Scale when your team needs the full
              platform.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white/[0.04] p-1 rounded-lg w-fit mb-8 border border-white/[0.06]">
            {(
              [
                ["platform", "Platform"],
                ["extension", "Extension"],
                ["bundle", "Bundle"],
              ] as [PricingTab, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setPricingTab(id)}
                className={cn(
                  "px-4 py-1.5 rounded-md text-xs font-mono font-medium transition-all",
                  pricingTab === id
                    ? "bg-[#1D9E75] text-white"
                    : "text-white/40 hover:text-white/70"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Platform pricing */}
          {pricingTab === "platform" && (
            <div className="grid sm:grid-cols-3 gap-4">
              <PriceCard
                tier="Free"
                price="$0"
                period="forever"
                desc="Perfect for solo researchers and small teams getting started."
                features={[
                  "Up to 3 assets",
                  "100 findings per month",
                  "Basic dashboards",
                  "PDF report export",
                ]}
                ctaLabel="Get started free"
                ctaHref="/register"
              />
              <PriceCard
                tier="Pro"
                price="$49"
                period="per seat / month"
                desc="For security teams running regular assessments across multiple products."
                features={[
                  "Unlimited assets",
                  "Unlimited findings",
                  "SLA tracking & escalation",
                  "Executive + technical reports",
                  "Excel sync",
                  "RBAC & audit logs",
                ]}
                ctaLabel="Start 14-day trial"
                ctaHref="/register?plan=pro"
                featured
              />
              <PriceCard
                tier="Enterprise"
                price="Custom"
                period="contact sales"
                desc="For large organizations needing SSO, custom integrations, and dedicated support."
                features={[
                  "Everything in Pro",
                  "SSO / SAML",
                  "On-prem deployment",
                  "Dedicated SLA",
                  "Custom integrations",
                ]}
                ctaLabel="Talk to sales"
                ctaHref="/contact"
              />
            </div>
          )}

          {/* Extension pricing */}
          {pricingTab === "extension" && (
            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
              <PriceCard
                tier="Free"
                price="$0"
                period="forever"
                desc="Core scanning features, no account required."
                features={[
                  "10 scans per day",
                  "Basic vulnerability detection",
                  "Local report export",
                ]}
                ctaLabel="Download free"
                ctaHref="#"
              />
              <PriceCard
                tier="Pro"
                price="$19"
                period="per month"
                desc="Unlimited scans and full agentic AI capabilities."
                features={[
                  "Unlimited scans",
                  "Agentic AI mode",
                  "POC auto-generation",
                  "Platform sync",
                  "MCP tool access",
                ]}
                ctaLabel="Start 14-day trial"
                ctaHref="/register?plan=ext-pro"
                featured
              />
            </div>
          )}

          {/* Bundle pricing */}
          {pricingTab === "bundle" && (
            <div className="max-w-sm">
              <PriceCard
                tier="Platform + Extension"
                price="$59"
                period="per seat / month — save 15%"
                desc="Everything in Pro for both products, billed together. One team, one workflow."
                features={[
                  "All Pro platform features",
                  "All Pro extension features",
                  "MCP tool included",
                  "Priority support",
                  "Early access to new features",
                ]}
                ctaLabel="Get the bundle"
                ctaHref="/register?plan=bundle"
                featured
                badge="Best value"
              />
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* CTA BANNER                                                           */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#1D9E75]/30 bg-[#1D9E75]/10 mb-6">
            <Shield className="w-3 h-3 text-[#1D9E75]" />
            <span className="text-[11px] font-mono text-[#1D9E75] tracking-widest uppercase">
              Free to start
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Start finding vulnerabilities
            <br />
            <span className="text-[#1D9E75]">in minutes</span>
          </h2>
          <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-md mx-auto">
            Install the extension, point it at your target, and let GAZE do the
            work. Every finding lands in your platform automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#"
              className="group inline-flex items-center gap-2 px-7 py-3.5 bg-[#1D9E75] hover:bg-[#178a65] text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-[#1D9E75]/20"
            >
              <Download className="w-4 h-4" />
              Download GAZE
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/10 hover:border-white/20 text-white/70 hover:text-white rounded-lg text-sm font-mono transition-all"
            >
              Create free account
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FOOTER                                                               */}
      {/* ------------------------------------------------------------------ */}
      <footer className="border-t border-white/[0.06] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#1D9E75]/80 flex items-center justify-center">
              <GazeIcon className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-mono text-white/30">
              GAZE · SECURITY · 2025
            </span>
          </div>
          <div className="flex items-center gap-5">
            {["Privacy", "Terms", "Docs", "Status", "GitHub"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs font-mono text-white/30 hover:text-white/60 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

// =============================================================================
// GAZE ICON (eye / crosshair hybrid)
// =============================================================================

function GazeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="8" r="2" fill="currentColor" />
      <line x1="8" y1="1" x2="8" y2="3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="8" y1="13" x2="8" y2="15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="1" y1="8" x2="3" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="13" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// =============================================================================
// SECTION LABEL
// =============================================================================

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 mb-1">
      <span className="w-4 h-px bg-[#1D9E75]" />
      <span className="text-[11px] font-mono text-[#1D9E75] uppercase tracking-widest">
        {children}
      </span>
    </div>
  );
}

// =============================================================================
// FEATURE CARD
// =============================================================================

interface PlatformFeature {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  desc: string;
}

const PLATFORM_FEATURES: PlatformFeature[] = [
  {
    icon: Shield,
    iconBg: "bg-[#1D9E75]/10",
    iconColor: "text-[#1D9E75]",
    title: "Finding lifecycle tracking",
    desc: "Open → in-remediation → verified. Full audit trail, assignees, and SLA timers per severity.",
  },
  {
    icon: Clock,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    title: "SLA-based remediation",
    desc: "Color-coded breach indicators. Critical → 7 days, High → 14 days, Medium → 30 days. Auto-escalation.",
  },
  {
    icon: BarChart3,
    iconBg: "bg-pink-500/10",
    iconColor: "text-pink-400",
    title: "Executive dashboards",
    desc: "Risk posture at a glance for leadership. Drill down for dev-level technical remediation detail.",
  },
  {
    icon: Layers,
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-400",
    title: "Asset & product mapping",
    desc: "Findings linked to specific assets and products. Filter by environment, criticality, or owner.",
  },
  {
    icon: FileText,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-400",
    title: "Dual-format reports",
    desc: "Generate executive PDF summaries or full technical reports with POC details for developers.",
  },
  {
    icon: Table2,
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
    title: "Excel sync",
    desc: "Two-way Excel synchronization for teams that require spreadsheet-based reporting workflows.",
  },
];

function FeatureCard({ icon: Icon, iconBg, iconColor, title, desc }: PlatformFeature) {
  return (
    <div className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.12] rounded-xl p-5 transition-all">
      <div className={cn("w-9 h-9 rounded-lg border border-white/[0.06] flex items-center justify-center mb-3.5", iconBg)}>
        <Icon className={cn("w-4 h-4", iconColor)} />
      </div>
      <h3 className="text-sm font-semibold text-white/90 mb-1.5">{title}</h3>
      <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
    </div>
  );
}

// =============================================================================
// DOWNLOAD CARD
// =============================================================================

interface DownloadCardProps {
  iconBg: string;
  icon: React.ReactNode;
  name: string;
  desc: string;
  version: string;
  ctaLabel: string;
  ctaPrimary?: boolean;
  href: string;
}

function DownloadCard({
  iconBg,
  icon,
  name,
  desc,
  version,
  ctaLabel,
  ctaPrimary,
  href,
}: DownloadCardProps) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 flex flex-col">
      <div
        className={cn(
          "w-11 h-11 rounded-xl border flex items-center justify-center mb-4",
          iconBg
        )}
      >
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-white/90 mb-1.5">{name}</h3>
      <p className="text-xs text-white/40 leading-relaxed flex-1 mb-4">{desc}</p>
      <a
        href={href}
        className={cn(
          "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold font-mono transition-all",
          ctaPrimary
            ? "bg-[#1D9E75] hover:bg-[#178a65] text-white"
            : "border border-white/10 hover:border-white/20 text-white/60 hover:text-white"
        )}
      >
        <Download className="w-3.5 h-3.5" />
        {ctaLabel}
      </a>
      <p className="text-[10px] font-mono text-white/25 text-center mt-2.5">
        {version}
      </p>
    </div>
  );
}

// =============================================================================
// PRICE CARD
// =============================================================================

interface PriceCardProps {
  tier: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  featured?: boolean;
  badge?: string;
}

function PriceCard({
  tier,
  price,
  period,
  desc,
  features,
  ctaLabel,
  ctaHref,
  featured,
  badge,
}: PriceCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl p-6 flex flex-col",
        featured
          ? "bg-[#1D9E75]/[0.07] border-2 border-[#1D9E75]/50"
          : "bg-white/[0.02] border border-white/[0.06]"
      )}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1D9E75] text-white text-[10px] font-mono font-semibold px-3 py-0.5 rounded-full whitespace-nowrap">
          {badge}
        </div>
      )}
      <div className="mb-4">
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1">
          {tier}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold font-mono text-white">{price}</span>
        </div>
        <p className="text-xs text-white/30 mt-0.5">{period}</p>
      </div>
      <p className="text-xs text-white/40 leading-relaxed mb-4 pb-4 border-b border-white/[0.06]">
        {desc}
      </p>
      <ul className="space-y-2.5 flex-1 mb-5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="w-3 h-3 text-[#1D9E75] mt-0.5 flex-shrink-0" />
            <span className="text-xs text-white/50">{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className={cn(
          "block text-center py-2.5 rounded-lg text-xs font-semibold font-mono transition-all",
          featured
            ? "bg-[#1D9E75] hover:bg-[#178a65] text-white"
            : "border border-white/10 hover:border-white/20 text-white/60 hover:text-white"
        )}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}