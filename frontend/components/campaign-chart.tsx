"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { fetcher, type Stats } from "@/lib/api";

interface TimeDataPoint {
  time: string;
  emails: number;
}

export function EmailsPerMinuteChart() {
  const [data, setData] = useState<TimeDataPoint[]>([]);
  const prevSentRef = useRef<number | null>(null);

  const { data: stats } = useSWR<Stats>("/api/stats", fetcher, {
    refreshInterval: 3000,
  });

  useEffect(() => {
    if (stats) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const emailsThisInterval =
        prevSentRef.current !== null
          ? Math.max(0, stats.sent - prevSentRef.current)
          : 0;

      prevSentRef.current = stats.sent;

      setData((prev) => {
        const newData = [
          ...prev,
          { time: timeStr, emails: emailsThisInterval },
        ];
        // Keep last 20 data points
        return newData.slice(-20);
      });
    }
  }, [stats]);

  const chartConfig = {
    emails: {
      label: "Emails",
      color: "var(--color-chart-1)",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emails per Interval</CardTitle>
        <CardDescription>Real-time sending rate (3s intervals)</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <Skeleton className="h-[200px] w-full" />
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="time"
                  stroke="var(--muted-foreground)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="emails"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "var(--color-chart-1)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function SentVsFailedChart() {
  const { data: stats, isLoading } = useSWR<Stats>("/api/stats", fetcher, {
    refreshInterval: 3000,
  });

  const chartData = stats
    ? [
        { name: "Sent", value: stats.sent, fill: "var(--color-chart-1)" },
        { name: "Failed", value: stats.failed, fill: "var(--color-destructive)" },
      ]
    : [];

  const chartConfig = {
    value: {
      label: "Count",
    },
    Sent: {
      label: "Sent",
      color: "var(--color-chart-1)",
    },
    Failed: {
      label: "Failed",
      color: "var(--color-destructive)",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sent vs Failed</CardTitle>
        <CardDescription>Distribution of email delivery status</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  stroke="var(--muted-foreground)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
