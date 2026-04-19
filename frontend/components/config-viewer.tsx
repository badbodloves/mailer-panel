"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetcher, type Config } from "@/lib/api";
import { Settings, Lock } from "lucide-react";

const sensitiveKeys = ["password", "secret", "key", "token", "credential", "auth"];

function maskSensitiveValue(key: string, value: unknown): string {
  const keyLower = key.toLowerCase();
  const isSensitive = sensitiveKeys.some((sk) => keyLower.includes(sk));

  if (isSensitive && typeof value === "string" && value.length > 0) {
    return "***";
  }

  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function ConfigSection({
  title,
  data,
}: {
  title: string;
  data: Record<string, unknown>;
}) {
  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="rounded-lg border bg-secondary/30">
        {Object.entries(data).map(([key, value], i, arr) => {
          const displayValue = maskSensitiveValue(key, value);
          const isMasked = displayValue === "***";

          return (
            <div key={key}>
              <div className="flex items-start gap-4 px-4 py-3">
                <span className="min-w-[140px] shrink-0 font-mono text-sm text-muted-foreground">
                  {key}
                </span>
                <span
                  className={`font-mono text-sm break-all ${
                    isMasked ? "flex items-center gap-1 text-muted-foreground" : ""
                  }`}
                >
                  {isMasked && <Lock className="h-3 w-3" />}
                  {displayValue}
                </span>
              </div>
              {i < arr.length - 1 && <Separator />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ConfigViewer() {
  const { data: config, isLoading } = useSWR<Config>("/api/config", fetcher);

  // Group config by sections (top-level objects become sections)
  const sections: Record<string, Record<string, unknown>> = {};
  const topLevel: Record<string, unknown> = {};

  if (config) {
    Object.entries(config).forEach(([key, value]) => {
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        sections[key] = value as Record<string, unknown>;
      } else {
        topLevel[key] = value;
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Settings className="h-5 w-5 text-muted-foreground" />
        <CardTitle>Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : config ? (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6">
              {Object.keys(topLevel).length > 0 && (
                <ConfigSection title="General" data={topLevel} />
              )}
              {Object.entries(sections).map(([sectionName, sectionData]) => (
                <ConfigSection
                  key={sectionName}
                  title={sectionName}
                  data={sectionData}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border border-dashed text-center">
            <Settings className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">No configuration available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
