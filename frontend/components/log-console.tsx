"use client";

import { useEffect, useRef } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher, type LogsResponse } from "@/lib/api";
import { Terminal } from "lucide-react";

export function LogConsole() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useSWR<LogsResponse>(
    "/api/logs?lines=50",
    fetcher,
    {
      refreshInterval: 3000,
    }
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Terminal className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="text-base">Console Logs</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        ) : (
          <ScrollArea
            className="h-[250px] rounded-b-lg bg-[oklch(0.1_0.005_250)] p-4"
            ref={scrollRef}
          >
            <div className="space-y-1 font-mono text-xs">
              {data?.lines?.length ? (
                data.lines.map((line, i) => (
                  <div
                    key={i}
                    className={getLogLineClass(line)}
                  >
                    {line}
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground">
                  No logs available...
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function getLogLineClass(line: string): string {
  const lower = line.toLowerCase();
  if (lower.includes("error") || lower.includes("fail")) {
    return "text-destructive";
  }
  if (lower.includes("success") || lower.includes("sent")) {
    return "text-success";
  }
  if (lower.includes("warn")) {
    return "text-warning";
  }
  return "text-muted-foreground";
}
