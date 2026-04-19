"use client";

import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetcher,
  startCampaign,
  stopCampaign,
  type CampaignStatus,
} from "@/lib/api";
import { Play, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function CampaignControls() {
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  const { data: status, isLoading } = useSWR<CampaignStatus>(
    "/api/campaign/status",
    fetcher,
    { refreshInterval: 3000 }
  );

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await startCampaign();
      toast.success("Campaign started successfully");
      mutate("/api/campaign/status");
    } catch (error) {
      toast.error("Failed to start campaign");
      console.error(error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStop = async () => {
    setIsStopping(true);
    try {
      await stopCampaign();
      toast.success("Campaign stopped successfully");
      mutate("/api/campaign/status");
    } catch (error) {
      toast.error("Failed to stop campaign");
      console.error(error);
    } finally {
      setIsStopping(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Campaign Control</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleStart}
              disabled={status?.running || isStarting}
              className="bg-success hover:bg-success/90 text-success-foreground"
            >
              {isStarting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Start
            </Button>
            <Button
              onClick={handleStop}
              disabled={!status?.running || isStopping}
              variant="destructive"
            >
              {isStopping ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Square className="mr-2 h-4 w-4" />
              )}
              Stop
            </Button>
            <div className="flex items-center gap-2 text-sm">
              <div
                className={`h-2 w-2 rounded-full ${
                  status?.running ? "bg-success animate-pulse" : "bg-muted"
                }`}
              />
              <span className="text-muted-foreground">
                {status?.running ? "Running" : "Stopped"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
