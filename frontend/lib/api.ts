const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetcher<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

export interface Stats {
  total: number;
  pending: number;
  sent: number;
  failed: number;
  counts_by_status: {
    pending: number;
    sent: number;
    failed: number;
  };
}

export interface SmtpAccount {
  host: string;
  port: number;
  user: string;
  send_count: number;
  fail_count: number;
}

export interface SmtpStats {
  accounts: SmtpAccount[];
}

export interface CampaignStatus {
  running: boolean;
}

export interface LogsResponse {
  lines: string[];
}

export interface Template {
  id?: string;
  name: string;
  subject: string;
  body_html: string;
  body_text: string;
}

export interface Config {
  [key: string]: unknown;
}

export async function getStats(): Promise<Stats> {
  return fetcher<Stats>("/api/stats");
}

export async function getSmtpStats(): Promise<SmtpStats> {
  return fetcher<SmtpStats>("/api/stats/smtp");
}

export async function getCampaignStatus(): Promise<CampaignStatus> {
  return fetcher<CampaignStatus>("/api/campaign/status");
}

export async function startCampaign(): Promise<void> {
  const res = await fetch(`${API_URL}/api/campaign/start`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to start campaign");
}

export async function stopCampaign(): Promise<void> {
  const res = await fetch(`${API_URL}/api/campaign/stop`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to stop campaign");
}

export async function getLogs(lines = 50): Promise<LogsResponse> {
  return fetcher<LogsResponse>(`/api/logs?lines=${lines}`);
}

export async function getTemplates(): Promise<Template[]> {
  return fetcher<Template[]>("/api/templates");
}

export async function createTemplate(template: Omit<Template, "id">): Promise<Template> {
  const res = await fetch(`${API_URL}/api/templates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(template),
  });
  if (!res.ok) throw new Error("Failed to create template");
  return res.json();
}

export async function getConfig(): Promise<Config> {
  return fetcher<Config>("/api/config");
}
