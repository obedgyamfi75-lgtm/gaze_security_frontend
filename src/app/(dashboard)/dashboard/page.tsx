"use client";

import Link from "next/link";
import { Shield, Bug, AlertTriangle, Target, Clock, Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardStats, useTrends, useRecentActivity, useFindings } from "@/hooks/use-data";
import { DashboardSkeleton } from "@/components/shared/skeletons";
import { ErrorState } from "@/components/shared/empty-state";
import { MetricCard } from "@/components/dashboard/metric-card";
import { VulnerabilityTrend } from "@/components/dashboard/vulnerability-trend";
import { SeverityDistribution } from "@/components/dashboard/severity-distribution";
import { FindingsFeed } from "@/components/dashboard/findings-feed";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { AssessmentProgress } from "@/components/dashboard/assessment-progress";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: trends, isLoading: trendsLoading } = useTrends(180);
  const { data: activity, isLoading: activityLoading } = useRecentActivity(4);
  const { data: recentFindings, isLoading: findingsLoading } = useFindings({ perPage: 5 });

  if (statsLoading && !stats) return <DashboardSkeleton />;

  if (statsError) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        description={statsError}
        onRetry={refetchStats}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your security posture and assessment status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetchStats()}
            className="border-border/50"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Link href="/reports">
            <Button variant="outline" className="border-border/50 hover:border-primary/50 hover:bg-primary/5">
              <Activity className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </Link>
          <Link href="/assessments">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
              <Shield className="mr-2 h-4 w-4" />
              New Assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Findings"
          value={stats?.findings.total.toString() ?? "0"}
          description={`${stats?.findings.open ?? 0} open findings`}
          trend={stats && stats.findings.open > 0 ? "up" : undefined}
          trendValue={stats ? `${stats.findings.open} open` : undefined}
          icon={Bug}
          accentColor="primary"
        />
        <MetricCard
          title="Critical Issues"
          value={stats?.findings?.bySeverity?.critical?.toString() ?? "0"}
          description="Require immediate action"
          trend={(stats?.findings?.bySeverity?.critical ?? 0) > 0 ? "up" : "down"}
          trendValue={(stats?.findings?.bySeverity?.critical ?? 0) > 0 ? "Action needed" : "Clear"}
          icon={AlertTriangle}
          accentColor="red"
        />
        <MetricCard
          title="Active Assessments"
          value={stats?.assessments.inProgress.toString() ?? "0"}
          description={`${stats?.assessments.total ?? 0} total assessments`}
          icon={Target}
          accentColor="purple"
        />
        <MetricCard
          title="SLA Compliance"
          value={`${stats?.sla?.complianceRate ?? 0}%`}
          description={`${stats?.sla?.overdue ?? 0} overdue items`}
          trend={(stats?.sla?.complianceRate ?? 0) >= 85 ? "up" : "down"}
          trendValue={(stats?.sla?.complianceRate ?? 0) >= 85 ? "On target" : "Below target"}
          icon={Clock}
          accentColor={(stats?.sla?.complianceRate ?? 0) >= 85 ? "green" : "yellow"}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-7">
        <VulnerabilityTrend trends={trends} isLoading={trendsLoading} />
        <SeverityDistribution stats={stats} />
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-7">
        <FindingsFeed findings={recentFindings} isLoading={findingsLoading} />
        <div className="lg:col-span-3 space-y-6">
          <AssessmentProgress stats={stats} />
          <ActivityFeed activity={activity} isLoading={activityLoading} />
        </div>
      </div>
    </div>
  );
}
