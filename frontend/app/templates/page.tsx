import { TemplateList } from "@/components/template-list";

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Templates</h1>
        <p className="text-muted-foreground">
          Create and manage your email templates
        </p>
      </div>

      <TemplateList />
    </div>
  );
}
