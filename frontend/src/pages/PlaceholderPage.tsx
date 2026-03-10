import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";

type PlaceholderPageProps = {
  title: string;
};

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section className="space-y-4">
      <PageHeader title={title} />
      <Card>
        <p className="text-sm text-slate-600">Placeholder page.</p>
      </Card>
    </section>
  );
}
