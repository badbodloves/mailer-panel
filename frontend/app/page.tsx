"use client";

import useSWR from "swr";
import { StatsCard } from "@/components/stats-card";
import {
  EmailsPerMinuteChart,
  SentVsFailedChart,
} from "@/components/campaign-chart";
import { LogConsole } from "@/components/log-console";
import { CampaignControls } from "@/components/campaign-controls";
import { fetcher, type Stats } from "@/lib/api";
import { Mail, Clock, CheckCircle, XCircle } from "lucide-react";

export default function DashboardPage() {
  const { data: stats, isLoading } = useSWR<Stats>("/api/stats", fetcher, {
    refreshInterval: 3000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your email campaign performance in real-time
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Emails"
          value={stats?.total}
          icon={Mail}
          variant="default"
          isLoading={isLoading}
        />
        <StatsCard
          title="Pending"
          value={stats?.pending}
          icon={Clock}
          variant="warning"
          isLoading={isLoading}
        />
        <StatsCard
          title="Sent"
          value={stats?.sent}
          icon={CheckCircle}
          variant="success"
          isLoading={isLoading}
        />
        <StatsCard
          title="Failed"
          value={stats?.failed}
          icon={XCircle}
          variant="destructive"
          isLoading={isLoading}
        />
      </div>

      {/* Campaign Controls */}
      <CampaignControls />

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <EmailsPerMinuteChart />
        <SentVsFailedChart />
      </div>

      {/* Console Logs */}
      <LogConsole />
    </div>
  );
}
