"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, Loader2, Lock, Mail, AlertCircle, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react"; // for useSearchParams build

declare const chrome: any;

function LoginPageContent() {
  const router = useRouter();
  const { login, verifyMfa, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [requiresMfa, setRequiresMfa] = React.useState(false);
  const [mfaCode, setMfaCode] = React.useState("");
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    remember: false,
  });
  const searchParams = useSearchParams();
  const isMcp = searchParams.get('mcp') === '1';

  const handleLoginSuccess = React.useCallback(async () => {
    if (isMcp) {
      try {
        const res = await fetch('http://localhost:8000/api/keys/mcp', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success && data.data?.key) {
          const extensionId = "gnmpmoejeaihcgiocgfjcaflajckiolp";
          if (typeof chrome !== "undefined" && (chrome as any).runtime) {
            (chrome as any).runtime.sendMessage(extensionId, {
              type: "GAZESEC_API_KEY",
              apiKey: data.data.key
            });
          }
        } else {
          console.error('[Gaze] MCP key fetch succeeded but returned no key:', data);
        }
      } catch (err) {
        console.error('[Gaze] Failed to send API key to extension:', err);
      }
    }
    router.push('/dashboard');
  }, [isMcp, router]);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      void handleLoginSuccess();
    }
  }, [isAuthenticated, handleLoginSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await login(formData.email, formData.password);

      if (!result.success) {
        setError(result.error || "Login failed");
        setIsLoading(false);
        return;
      }

      if (result.requiresMfa) {
        setRequiresMfa(true);
        setIsLoading(false);
        return;
      }

      // Success - redirect to dashboard
      await handleLoginSuccess();
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await verifyMfa(mfaCode);

      if (!result.success) {
        setError(result.error || "Invalid code");
        setIsLoading(false);
        return;
      }

      // Success - redirect to dashboard
      await handleLoginSuccess();
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  // MFA verification screen
  if (requiresMfa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 border border-primary/30">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">GAZE</h1>
              <p className="text-sm text-muted-foreground">Security Platform</p>
            </div>
          </div>

          {/* Header */}
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Two-Factor Authentication</h2>
            <p className="text-muted-foreground">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* MFA Form */}
          <form onSubmit={handleMfaSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="mfa-code">Verification Code</Label>
              <Input
                id="mfa-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl tracking-[0.5em] font-mono bg-input border-border"
                autoFocus
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading || mfaCode.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setRequiresMfa(false);
                setMfaCode("");
                setError(null);
              }}
            >
              Back to login
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Branding with Cyber Grid */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#050505]">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 bg-cyber-grid opacity-40" />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5" />

        {/* Animated Vertical Lines - Matrix Style */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent"
              style={{
                left: `${5 + i * 5}%`,
                height: '100%',
                animationDelay: `${i * 0.2}s`,
                opacity: 0.3 + Math.random() * 0.3,
              }}
            />
          ))}
        </div>

        {/* Scan Line Effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-scan-line" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 border border-primary/30 glow-sm">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">GAZE</h1>
                <p className="text-sm text-muted-foreground">Security Platform</p>
              </div>
            </div>
          </div>

          {/* Quote */}
          <div className="space-y-6">
            <blockquote className="text-xl font-medium leading-relaxed text-foreground/90">
              &ldquo;Security is not a product, but a process. This platform helps us
              manage that process effectively across our entire organization.&rdquo;
            </blockquote>
            <div>
              <p className="font-semibold text-foreground">Security Operations Team</p>
              <p className="text-sm text-muted-foreground">GAZE Limited</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">500+</p>
              <p className="text-sm text-muted-foreground">Assessments</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">2,000+</p>
              <p className="text-sm text-muted-foreground">Findings Resolved</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">99%</p>
              <p className="text-sm text-muted-foreground">SLA Compliance</p>
            </div>
          </div>
        </div>

        {/* Decorative Glow Orbs */}
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -top-32 -right-48 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 border border-primary/30">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">GAZE</h1>
              <p className="text-sm text-muted-foreground">Security Platform</p>
            </div>
          </div>

          {/* Header */}
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@hubtel.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={cn(
                      "pl-10 bg-input border-border focus:border-primary focus:ring-primary/20",
                      error && "border-destructive"
                    )}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className={cn(
                      "pl-10 pr-10 bg-input border-border focus:border-primary focus:ring-primary/20",
                      error && "border-destructive"
                    )}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={formData.remember}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, remember: checked as boolean })
                  }
                  className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  disabled={isLoading}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal text-muted-foreground cursor-pointer"
                >
                  Remember me for 30 days
                </Label>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium
                         shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:shadow-xl
                         transition-all duration-200"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          {/* MFA Notice */}
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-foreground">Multi-factor authentication</p>
                <p className="text-muted-foreground">
                  You&apos;ll be prompted for your authentication code after signing in.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground">
            Protected by enterprise-grade security.{" "}
            <Link href="/security" className="text-primary hover:text-primary/80 transition-colors">
              Learn more
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}