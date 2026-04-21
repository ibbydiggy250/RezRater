import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell flex min-h-[60vh] items-center justify-center py-16">
      <div className="panel-strong max-w-xl p-8 text-center">
        <p className="eyebrow">Not Found</p>
        <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-semibold">
          We couldn&apos;t find that page.
        </h1>
        <p className="mt-4 text-[color:var(--muted)]">
          The building or quad may not exist in the current dataset yet.
        </p>
        <Link href="/quads" className="btn-primary mt-6">
          Browse Quads
        </Link>
      </div>
    </div>
  );
}
