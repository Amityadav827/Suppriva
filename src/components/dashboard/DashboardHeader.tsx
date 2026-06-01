export function DashboardHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-7">
      <h1 className="font-heading text-3xl font-extrabold text-text-dark md:text-4xl">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{subtitle}</p>
    </div>
  );
}
