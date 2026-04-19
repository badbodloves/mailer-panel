import { SmtpTable } from "@/components/smtp-table";

export default function SmtpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">SMTP Pool</h1>
        <p className="text-muted-foreground">
          Monitor and manage your SMTP server accounts
        </p>
      </div>

      <SmtpTable />
    </div>
  );
}
