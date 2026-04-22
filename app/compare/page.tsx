import Link from "next/link";
import { notFound } from "next/navigation";
import { reviewCategoryLabels } from "@/lib/constants";
import { getBuildingPageData, getReviewFormData } from "@/lib/data";
import type { BuildingDetail, ReviewFormQuad, ReviewRecord } from "@/lib/types";
import { formatDateLabel, formatRating } from "@/lib/utils";

type ComparePageProps = {
  searchParams: Promise<{
    left?: string;
    right?: string;
  }>;
};

type CompareOption = {
  id: string;
  name: string;
  slug: string;
  quadName: string;
};

type CompareMetricRow = {
  label: string;
  description: string;
  leftValue: string;
  rightValue: string;
};

function flattenCompareOptions(quads: ReviewFormQuad[]): CompareOption[] {
  return quads.flatMap((quad) =>
    quad.buildings.map((building) => ({
      id: building.id,
      name: building.name,
      slug: building.slug,
      quadName: quad.name
    }))
  );
}

function resolveSelections(
  options: CompareOption[],
  requestedLeft?: string,
  requestedRight?: string
) {
  const defaultLeft = options[0]?.slug ?? "";
  const defaultRight = options.find((option) => option.slug !== defaultLeft)?.slug ?? defaultLeft;
  const hasRequestedLeft = options.some((option) => option.slug === requestedLeft);
  const hasRequestedRight = options.some((option) => option.slug === requestedRight);

  const left = hasRequestedLeft ? requestedLeft ?? defaultLeft : defaultLeft;
  let right =
    hasRequestedRight && requestedRight !== left ? requestedRight ?? defaultRight : defaultRight;

  if (right === left) {
    right = options.find((option) => option.slug !== left)?.slug ?? left;
  }

  return {
    left,
    right,
    showSelectionWarning:
      Boolean(requestedLeft && requestedRight) &&
      (!hasRequestedLeft || !hasRequestedRight || requestedLeft === requestedRight)
  };
}

function getLatestReviewDate(reviews: ReviewRecord[]) {
  return (
    reviews
      .map((review) => review.created_at)
      .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0] ?? null
  );
}

function getWouldLiveAgainRate(reviews: ReviewRecord[]) {
  if (reviews.length === 0) {
    return null;
  }

  const totalYes = reviews.filter((review) => review.would_live_again).length;
  return (totalYes / reviews.length) * 100;
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "N/A";
  }

  return `${Math.round(value)}%`;
}

function getDominantValue(values: string[]) {
  if (values.length === 0) {
    return "N/A";
  }

  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  let topValue = values[0];
  let topCount = counts.get(topValue) ?? 0;

  for (const [value, count] of counts.entries()) {
    if (count > topCount) {
      topValue = value;
      topCount = count;
    }
  }

  return `${topValue} (${topCount})`;
}

function getComparisonRows(left: BuildingDetail, right: BuildingDetail): CompareMetricRow[] {
  return [
    {
      label: "Community",
      description: "Which quad or residential area each dorm belongs to.",
      leftValue: left.quad.name,
      rightValue: right.quad.name
    },
    {
      label: "Building type",
      description: "Corridor, suite, or apartment style.",
      leftValue: left.type,
      rightValue: right.type
    },
    {
      label: "Kitchen access",
      description: "Whether the building includes kitchen or cooking access.",
      leftValue: left.hasKitchen ? "Available" : "No kitchen",
      rightValue: right.hasKitchen ? "Available" : "No kitchen"
    },
    {
      label: "Overall rating",
      description: "Headline score from all published reviews.",
      leftValue: formatRating(left.averageRating),
      rightValue: formatRating(right.averageRating)
    },
    {
      label: "Review count",
      description: "How much student feedback exists for each dorm.",
      leftValue: `${left.reviewCount}`,
      rightValue: `${right.reviewCount}`
    },
    {
      label: "Would live again",
      description: "Share of reviewers who said they would choose the dorm again.",
      leftValue: formatPercent(getWouldLiveAgainRate(left.reviews)),
      rightValue: formatPercent(getWouldLiveAgainRate(right.reviews))
    },
    {
      label: "Most common fit",
      description: "The most common `best for` tag across submitted reviews.",
      leftValue: getDominantValue(left.reviews.map((review) => review.best_for)),
      rightValue: getDominantValue(right.reviews.map((review) => review.best_for))
    },
    {
      label: "Most common class year",
      description: "Which student class year appears most often in the review set.",
      leftValue: getDominantValue(left.reviews.map((review) => review.class_year_when_lived)),
      rightValue: getDominantValue(right.reviews.map((review) => review.class_year_when_lived))
    },
    {
      label: "Latest review",
      description: "How recent the most recent published review is.",
      leftValue: formatDateLabel(getLatestReviewDate(left.reviews)),
      rightValue: formatDateLabel(getLatestReviewDate(right.reviews))
    },
    ...reviewCategoryLabels.map((category) => ({
      label: category.label,
      description: category.description,
      leftValue: formatRating(left.categoryAverages[category.key]),
      rightValue: formatRating(right.categoryAverages[category.key])
    }))
  ];
}

function getSwapHref(leftSlug: string, rightSlug: string) {
  const params = new URLSearchParams({
    left: rightSlug,
    right: leftSlug
  });

  return `/compare?${params.toString()}`;
}

function CompareSummaryCard({
  building,
  sideLabel
}: {
  building: BuildingDetail;
  sideLabel: string;
}) {
  return (
    <article className="panel-strong h-full p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{sideLabel}</p>
          <h2 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-semibold">
            {building.name}
          </h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">{building.quad.name}</p>
        </div>
        <div className="rounded-full bg-[color:var(--brand-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--brand-deep)]">
          {formatRating(building.averageRating)}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="pill">{building.type}</span>
        {building.type === "Corridor" ? <span className="pill">Communal bathroom</span> : null}
        {building.hasKitchen ? <span className="pill">Kitchen / cooking unit</span> : null}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/80 px-4 py-4 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Reviews</p>
          <p className="mt-2 text-2xl font-semibold">{building.reviewCount}</p>
        </div>
        <div className="rounded-2xl bg-white/80 px-4 py-4 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
            Would live again
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {formatPercent(getWouldLiveAgainRate(building.reviews))}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={`/buildings/${building.slug}`} className="btn-secondary">
          Open full dorm page
        </Link>
        <Link href={`/review?building=${building.slug}`} className="btn-primary">
          Write a review
        </Link>
      </div>
    </article>
  );
}

function CompareReviewsColumn({ building }: { building: BuildingDetail }) {
  return (
    <div className="space-y-5">
      <div className="panel-strong p-6">
        <p className="eyebrow">Reviews</p>
        <h2 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-semibold">
          {building.name}
        </h2>
        <p className="mt-3 text-[color:var(--muted)]">
          Every published review for {building.name}, sorted from newest to oldest.
        </p>
      </div>

      {building.reviews.map((review) => (
        <article key={review.id} className="panel-strong p-6">
          <div className="flex flex-wrap gap-2">
            <span className="pill">{formatRating(review.overall_rating)}</span>
            <span className="pill">{review.class_year_when_lived}</span>
            <span className="pill">{review.best_for}</span>
            <span className="pill">
              {review.would_live_again ? "Would live again" : "Would not live again"}
            </span>
          </div>

          <p className="mt-3 text-sm text-[color:var(--muted)]">
            Posted {formatDateLabel(review.created_at)}
          </p>
          <p className="mt-5 text-base leading-7">{review.review_text}</p>

          {review.pros_text ? (
            <div className="mt-5 rounded-2xl bg-white/75 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-accent)]">
                Pros
              </p>
              <p className="mt-2 text-sm">{review.pros_text}</p>
            </div>
          ) : null}

          {review.cons_text ? (
            <div className="mt-4 rounded-2xl bg-white/75 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--danger)]">
                Cons
              </p>
              <p className="mt-2 text-sm">{review.cons_text}</p>
            </div>
          ) : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {reviewCategoryLabels.map((category) => (
              <div key={category.key} className="rounded-2xl bg-white/80 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">
                  {category.label}
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {review[category.key]}
                  <span className="text-sm text-[color:var(--muted)]"> / 5</span>
                </p>
              </div>
            ))}
          </div>
        </article>
      ))}

      {building.reviews.length === 0 ? (
        <div className="panel p-8 text-center">
          <h3 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">
            No reviews yet
          </h3>
          <p className="mt-3 text-[color:var(--muted)]">
            There is not enough student feedback here yet, so your review could be the first one.
          </p>
          <Link href={`/review?building=${building.slug}`} className="btn-primary mt-6">
            Leave the first review
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const filters = await searchParams;
  const { quads } = await getReviewFormData();
  const options = flattenCompareOptions(quads);

  if (options.length === 0) {
    return (
      <div className="shell pb-20 pt-10 sm:pt-14">
        <div className="panel-strong max-w-3xl p-8 sm:p-10">
          <p className="eyebrow">Compare Dorms</p>
          <h1 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-semibold">
            Comparison data is not available yet.
          </h1>
          <p className="mt-4 text-lg text-[color:var(--muted)]">
            Once dorm and review data is connected, this page will let students compare two
            buildings side by side.
          </p>
        </div>
      </div>
    );
  }

  const selection = resolveSelections(options, filters.left, filters.right);
  const [leftBuilding, rightBuilding] = await Promise.all([
    getBuildingPageData(selection.left),
    getBuildingPageData(selection.right)
  ]);

  if (!leftBuilding || !rightBuilding) {
    notFound();
  }

  const comparisonRows = getComparisonRows(leftBuilding, rightBuilding);

  return (
    <div className="shell pb-20 pt-10 sm:pt-14">
      <section className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="max-w-3xl space-y-4">
          <p className="eyebrow">Side-By-Side Compare</p>
          <h1 className="section-title font-[family-name:var(--font-heading)]">
            Compare two dorms with the full ratings breakdown and review history.
          </h1>
          <p className="text-lg text-[color:var(--muted)]">
            Pick any two residence halls, line up every structured rating category, and read the
            actual student reviews for both without bouncing between separate pages.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={`/buildings/${leftBuilding.slug}`} className="btn-secondary">
              Open {leftBuilding.name}
            </Link>
            <Link href={`/buildings/${rightBuilding.slug}`} className="btn-secondary">
              Open {rightBuilding.name}
            </Link>
          </div>
        </div>

        <div className="panel-strong p-6 sm:p-8">
          <p className="eyebrow">Current Matchup</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.25rem] bg-white/80 p-5">
              <p className="text-sm uppercase tracking-[0.16em] text-[color:var(--muted)]">Left dorm</p>
              <h2 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-semibold">
                {leftBuilding.name}
              </h2>
              <p className="mt-2 text-sm text-[color:var(--muted)]">{leftBuilding.quad.name}</p>
            </div>
            <div className="rounded-[1.25rem] bg-white/80 p-5">
              <p className="text-sm uppercase tracking-[0.16em] text-[color:var(--muted)]">Right dorm</p>
              <h2 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-semibold">
                {rightBuilding.name}
              </h2>
              <p className="mt-2 text-sm text-[color:var(--muted)]">{rightBuilding.quad.name}</p>
            </div>
          </div>
          <Link href={getSwapHref(leftBuilding.slug, rightBuilding.slug)} className="btn-primary mt-5">
            Swap sides
          </Link>
        </div>
      </section>

      <form action="/compare" className="panel mt-8 grid gap-4 p-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <label className="space-y-2 text-sm font-medium">
          <span>Left dorm</span>
          <select name="left" defaultValue={leftBuilding.slug} className="field">
            {quads.map((quad) => (
              <optgroup key={quad.id} label={quad.name}>
                {quad.buildings.map((building) => (
                  <option key={building.id} value={building.slug}>
                    {building.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium">
          <span>Right dorm</span>
          <select name="right" defaultValue={rightBuilding.slug} className="field">
            {quads.map((quad) => (
              <optgroup key={quad.id} label={quad.name}>
                {quad.buildings.map((building) => (
                  <option key={building.id} value={building.slug}>
                    {building.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <button type="submit" className="btn-primary">
          Compare dorms
        </button>
      </form>

      {selection.showSelectionWarning ? (
        <p className="feedback-error mt-4">
          Choose two different valid dorms to compare. The page picked the closest available
          side-by-side matchup for you.
        </p>
      ) : null}

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <CompareSummaryCard building={leftBuilding} sideLabel="Left dorm" />
        <CompareSummaryCard building={rightBuilding} sideLabel="Right dorm" />
      </section>

      <section className="panel-strong mt-8 overflow-hidden p-6 sm:p-8">
        <p className="eyebrow">Metrics</p>
        <h2 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-semibold">
          Full comparison table
        </h2>
        <div className="mt-6 space-y-4">
          {comparisonRows.map((row) => (
            <div key={row.label} className="rounded-[1.25rem] bg-white/75 p-4 sm:p-5">
              <div className="max-w-2xl">
                <p className="font-semibold">{row.label}</p>
                <p className="mt-1 text-sm text-[color:var(--muted)]">{row.description}</p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[color:var(--border)] bg-white/90 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">
                    {leftBuilding.name}
                  </p>
                  <p className="mt-2 text-lg font-semibold">{row.leftValue}</p>
                </div>
                <div className="rounded-2xl border border-[color:var(--border)] bg-white/90 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">
                    {rightBuilding.name}
                  </p>
                  <p className="mt-2 text-lg font-semibold">{row.rightValue}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-2">
        <CompareReviewsColumn building={leftBuilding} />
        <CompareReviewsColumn building={rightBuilding} />
      </section>
    </div>
  );
}
