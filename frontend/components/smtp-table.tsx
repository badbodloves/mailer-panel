"use client";

import useSWR from "swr";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher, type SmtpStats, type SmtpAccount } from "@/lib/api";
import { Server } from "lucide-react";

function getStatusBadge(account: SmtpAccount) {
  const failRate =
    account.send_count > 0
      ? account.fail_count / (account.send_count + account.fail_count)
      : 0;

  if (failRate > 0.5) {
    return (
      <Badge variant="destructive" className="bg-destructive/20 text-destructive border-destructive/30">
        Critical
      </Badge>
    );
  }
  if (failRate > 0.2) {
    return (
      <Badge className="bg-warning/20 text-warning border-warning/30">
        Warning
      </Badge>
    );
  }
  return (
    <Badge className="bg-success/20 text-success border-success/30">
      Healthy
    </Badge>
  );
}

export function SmtpTable() {
  const { data, isLoading } = useSWR<SmtpStats>("/api/stats/smtp", fetcher, {
    refreshInterval: 5000,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Server className="h-5 w-5 text-muted-foreground" />
        <CardTitle>SMTP Accounts</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Host</TableHead>
                  <TableHead>Port</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Sends</TableHead>
                  <TableHead className="text-right">Fails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.accounts?.length ? (
                  data.accounts.map((account, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-sm">
                        {account.host}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {account.port}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {account.user}
                      </TableCell>
                      <TableCell>{getStatusBadge(account)}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {account.send_count.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-destructive">
                        {account.fail_count.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No SMTP accounts configured
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
