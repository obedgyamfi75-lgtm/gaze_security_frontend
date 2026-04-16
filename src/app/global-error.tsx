"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full bg-card/50 border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            {/* Error Icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            
            {/* Description */}
            <p className="text-sm text-muted-foreground mb-6">
              An unexpected error occurred. Our team has been notified and is working on a fix.
            </p>

            {/* Error Details (Development) */}
            {process.env.NODE_ENV === "development" && (
              <div className="w-full p-3 rounded-lg bg-muted/30 border border-border/50 mb-6">
                <p className="text-xs font-mono text-muted-foreground break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-[10px] font-mono text-muted-foreground/70 mt-1">
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button
                onClick={reset}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-border/50"
                asChild
              >
                <Link href="/dashboard">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>
            </div>

            {/* Report Bug Link */}
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 text-muted-foreground"
            >
              <Bug className="mr-2 h-3.5 w-3.5" />
              Report this issue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}