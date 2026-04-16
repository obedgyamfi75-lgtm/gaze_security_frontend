"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, FileX, Search, Plus, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  backLink?: string;
  backLabel?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "An error occurred while loading the data",
  onRetry,
  backLink,
  backLabel = "Go back",
}: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="bg-card/50 border-border/50 max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-6">{description}</p>
          <div className="flex items-center justify-center gap-2">
            {onRetry && (
              <Button variant="outline" onClick={onRetry} className="border-border/50">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            )}
            {backLink && (
              <Button variant="outline" asChild className="border-border/50">
                <Link href={backLink}>{backLabel}</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const ActionIcon = action?.icon || Plus;
  
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      {Icon && (
        <div className="mx-auto w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>
      )}
      {action && (
        action.href ? (
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href={action.href}>
              <ActionIcon className="mr-2 h-4 w-4" />
              {action.label}
            </Link>
          </Button>
        ) : (
          <Button onClick={action.onClick} className="bg-primary hover:bg-primary/90">
            <ActionIcon className="mr-2 h-4 w-4" />
            {action.label}
          </Button>
        )
      )}
    </div>
  );
}

export function NoSearchResults({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={query ? `No results matching "${query}"` : "Try adjusting your search or filters"}
    />
  );
}

export function NoData({ type }: { type: string }) {
  return (
    <EmptyState
      icon={FileX}
      title={`No ${type} yet`}
      description={`Get started by creating your first ${type.toLowerCase()}`}
    />
  );
}