import Link from "next/link";
import { getQuadSummaries } from "@/lib/data";
import { formatRating } from "@/lib/utils";

export default async function QuadsPage() {
  const quads = await getQuadSummaries();

  return (
    <div className="shell pb-20 pt-10 sm:pt-14">
      <div className="max-w-3xl space-y-4">
        <p className="eyebrow">All Communities</p>
        <h1 className="section-title font-[family-name:var(--font-heading)]">
          Explore Stony Brook housing one community at a time.
        </h1>
        <p className="text-lg text-[color:var(--muted)]">
          Each community rollup shows the average rating, number of buildings, and total review
          volume so students can compare whole housing areas before drilling into a specific hall.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {quads.map((quad) => (
          <Link
            key={quad.id}
            href={`/quads/${quad.slug}`}
            className="panel-strong group flex h-full flex-col justify-between p-6 transition hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Quad</p>
                  <h2 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-semibold">
                    {quad.name}
                  </h2>
                </div>
                <span className="rounded-full bg-[color:var(--brand-soft)] px-3 py-1 text-sm font-semibold text-[color:var(--brand-deep)]">
                  {formatRating(quad.averageRating)}
                </span>
              </div>
              <p className="text-sm text-[color:var(--muted)]">
                Browse buildings, compare living styles, and inspect structured feedback before
                deciding where you want to live.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-white/80 px-3 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  Buildings
                </p>
                <p className="mt-2 text-xl font-semibold">{quad.buildingCount}</p>
              </div>
              <div className="rounded-2xl bg-white/80 px-3 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  Reviews
                </p>
                <p className="mt-2 text-xl font-semibold">{quad.reviewCount}</p>
              </div>
              <div className="rounded-2xl bg-white/80 px-3 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  Avg
                </p>
                <p className="mt-2 text-xl font-semibold">{formatRating(quad.averageRating)}</p>
              </div>
            </div>

            <div className="mt-6 text-sm font-semibold text-[color:var(--brand-deep)]">
              Open quad
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
