import { PageHeader } from "./page-header";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader title={title} description={description} />
      <section className="mt-6 rounded-lg border border-border bg-card p-6 shadow-card">
        <p className="text-sm text-muted-foreground">
          Feature coming in a later milestone.
        </p>
      </section>
    </div>
  );
}
