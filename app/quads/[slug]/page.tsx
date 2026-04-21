import Link from "next/link";
import { notFound } from "next/navigation";
import { buildingTypes, quadSortOptions } from "@/lib/constants";
import { getQuadPageData } from "@/lib/data";
import { formatRating } from "@/lib/utils";

type QuadPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?: string;
    type?: string;
  }>;
};

export default async function QuadPage({ params, searchParams }: QuadPageProps) {
  const { slug } = await params;
  const filters = await searchParams;
  const data = await getQuadPageData(slug, filters.type, filters.sort);

  if (!data) {
    notFound();
  }

  return (
    <div className="shell pb-20 pt-10 sm:pt-14">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-4">
          <Link href="/quads" className="eyebrow inline-flex">
            Back to all quads
          </Link>
          <div>
            <h1 className="section-title font-[family-name:var(--font-heading)]">{data.quad.name}</h1>
            <p className="mt-3 text-lg text-[color:var(--muted)]">
              Compare buildings in {data.quad.name} by review volume, average rating, and housing
              style before you choose where to live.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="panel px-5 py-4 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Avg</p>
            <p className="mt-2 text-2xl font-semibold">{formatRating(data.summary.averageRating)}</p>
          </div>
          <div className="panel px-5 py-4 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Buildings</p>
            <p className="mt-2 text-2xl font-semibold">{data.summary.buildingCount}</p>
          </div>
          <div className="panel px-5 py-4 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Reviews</p>
            <p className="mt-2 text-2xl font-semibold">{data.summary.reviewCount}</p>
          </div>
        </div>
      </div>

      <form className="panel mt-8 grid gap-4 p-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="space-y-2 text-sm font-medium">
          <span>Filter by type</span>
          <select name="type" defaultValue={data.filters.type} className="field">
            <option value="all">All building types</option>
            {buildingTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium">
          <span>Sort buildings</span>
          <select name="sort" defaultValue={data.filters.sort} className="field">
            {quadSortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" className="btn-primary">
          Apply Filters
        </button>
      </form>

      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        {data.buildings.map((building) => (
          <Link
            key={building.id}
            href={`/buildings/${building.slug}`}
            className="panel-strong flex h-full flex-col justify-between p-6 transition hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">
                    {building.name}
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="pill">{building.type}</span>
                    {building.type === "Corridor" ? <span className="pill">Communal bathroom</span> : null}
                    {building.hasKitchen ? <span className="pill">Kitchen / cooking unit</span> : null}
                  </div>
                </div>
                <div className="rounded-full bg-[color:var(--brand-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--brand-deep)]">
                  {formatRating(building.averageRating)}
                </div>
              </div>

              <p className="text-sm text-[color:var(--muted)]">
                {building.reviewCount > 0
                  ? `${building.reviewCount} review${building.reviewCount === 1 ? "" : "s"} with latest activity ${building.latestReviewDateLabel}.`
                  : "No reviews yet. Be the first person to share what it feels like to live here."}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-white/80 px-3 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  Reviews
                </p>
                <p className="mt-2 text-xl font-semibold">{building.reviewCount}</p>
              </div>
              <div className="rounded-2xl bg-white/80 px-3 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  Avg
                </p>
                <p className="mt-2 text-xl font-semibold">{formatRating(building.averageRating)}</p>
              </div>
              <div className="rounded-2xl bg-white/80 px-3 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  Latest
                </p>
                <p className="mt-2 text-sm font-semibold">{building.latestReviewDateLabel}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {data.buildings.length === 0 ? (
        <div className="panel mt-8 p-8 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">
            No buildings match those filters.
          </h2>
          <p className="mt-3 text-[color:var(--muted)]">
            Try a different building type or sorting option to broaden the list.
          </p>
        </div>
      ) : null}
    </div>
  );
}
