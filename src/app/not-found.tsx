"use client";

import { FileQuestion, Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full bg-card/50 border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            {/* 404 Icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 border border-border/50 mb-4">
              <FileQuestion className="h-8 w-8 text-muted-foreground" />
            </div>

            {/* Title */}
            <h2 className="text-4xl font-bold font-mono text-primary mb-2">404</h2>
            <h3 className="text-xl font-semibold mb-2">Page Not Found</h3>
            
            {/* Description */}
            <p className="text-sm text-muted-foreground mb-6">
              The page you're looking for doesn't exist or has been moved.
            </p>

            {/* Suggestions */}
            <div className="w-full p-4 rounded-lg bg-muted/30 border border-border/50 mb-6 text-left">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Things to try:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Check the URL for typos</li>
                <li>• Go back to the previous page</li>
                <li>• Return to the dashboard</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="flex-1 border-border/50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                asChild
              >
                <Link href="/dashboard">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}