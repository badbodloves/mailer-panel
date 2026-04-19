import { ConfigViewer } from "@/components/config-viewer";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          View your campaign configuration (read-only)
        </p>
      </div>

      <ConfigViewer />
    </div>
  );
}
