import Link from "next/link";
import { HomeSummary } from "@/components/home-summary";
import { getQuadSummaries } from "@/lib/data";

export default async function HomePage() {
  const quads = await getQuadSummaries();
  const reviewedBuildings = quads.reduce((total, quad) => total + quad.buildingCount, 0);
  const totalReviews = quads.reduce((total, quad) => total + quad.reviewCount, 0);
  const ratedQuads = quads.filter((quad) => quad.reviewCount > 0);

  return (
    <div className="shell pb-16 pt-12 sm:pb-24 sm:pt-20">
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-6">
          <p className="eyebrow">Stony Brook Housing Guide</p>
          <div className="space-y-4">
            <h1 className="max-w-3xl font-[family-name:var(--font-heading)] text-5xl font-bold tracking-tight sm:text-6xl">
              Compare dorms by what living there actually feels like.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
              SBU Dorm Review App helps students browse by quad, compare building tradeoffs, and
              leave structured reviews that are useful when housing decisions feel high stakes.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/quads" className="btn-primary">
              Browse Dorms
            </Link>
            <Link href="/review" className="btn-secondary">
              Leave a Review
            </Link>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-[color:var(--muted)]">
            <span className="pill">Structured ratings</span>
            <span className="pill">Verified `@stonybrook.edu` sign-in</span>
            <span className="pill">One review per student per building</span>
          </div>
        </div>

        <div className="panel-strong overflow-hidden p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Decision Snapshot</p>
              <h2 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-semibold">
                Pick the right dorm for your priorities.
              </h2>
            </div>
            <div className="rounded-full bg-[color:var(--brand-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--brand-deep)]">
              MVP
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <HomeSummary label="Quads" value={quads.length.toString()} />
            <HomeSummary label="Buildings in directory" value={reviewedBuildings.toString()} />
            <HomeSummary label="Published reviews" value={totalReviews.toString()} />
            <HomeSummary
              label="Average sentiment"
              value={
                ratedQuads.length > 0
                  ? `${(
                      ratedQuads.reduce((sum, quad) => sum + quad.averageRating, 0) /
                      ratedQuads.length
                    ).toFixed(1)} / 5`
                  : "N/A"
              }
            />
          </div>

          <div className="mt-8 rounded-[1.25rem] bg-[color:var(--brand-deep)] p-5 text-white">
            <p className="text-sm uppercase tracking-[0.2em] text-white/70">How it works</p>
            <ol className="mt-3 space-y-3 text-sm text-white/85">
              <li>1. Browse a quad and filter buildings by style or activity.</li>
              <li>2. Compare ratings across cleanliness, noise, location, and amenities.</li>
              <li>3. Leave your own verified review after signing in with your SBU email.</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
