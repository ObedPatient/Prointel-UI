interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-8 shadow-sm">
      <p className="text-sm font-semibold tracking-wide text-primary">Coming Soon</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        This page is ready for the next TypeScript feature pass. The routing and layout are in
        place, so you can now build each screen without fighting the project setup first.
      </p>
    </section>
  );
}
