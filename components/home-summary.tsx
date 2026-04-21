type HomeSummaryProps = {
  label: string;
  value: string;
};

export function HomeSummary({ label, value }: HomeSummaryProps) {
  return (
    <div className="rounded-[1.25rem] bg-white/80 px-5 py-5">
      <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">{label}</p>
      <p className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-semibold">{value}</p>
    </div>
  );
}
