import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    critical: "severity-critical",
    high: "severity-high",
    medium: "severity-medium",
    low: "severity-low",
    info: "severity-info",
  };
  return colors[severity.toLowerCase()] || "severity-info";
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    open: "status-open",
    "in-progress": "status-in-progress",
    "in progress": "status-in-progress",
    resolved: "status-resolved",
    closed: "status-resolved",
    accepted: "status-accepted",
  };
  return colors[status.toLowerCase()] || "bg-secondary text-secondary-foreground";
}

export function calculateSLAStatus(
  dueDate: Date | string,
  status: string
): { label: string; variant: "default" | "warning" | "destructive" | "success" } {
  if (status === "resolved" || status === "closed") {
    return { label: "Completed", variant: "success" };
  }

  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: `${Math.abs(diffDays)}d overdue`, variant: "destructive" };
  }
  if (diffDays <= 3) {
    return { label: `${diffDays}d remaining`, variant: "warning" };
  }
  return { label: `${diffDays}d remaining`, variant: "default" };
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
