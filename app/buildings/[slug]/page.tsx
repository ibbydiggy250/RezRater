import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { reviewCategoryLabels } from "@/lib/constants";
import { getBuildingPageData } from "@/lib/data";
import { formatDateLabel, formatRating } from "@/lib/utils";

type BuildingPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BuildingPage({ params }: BuildingPageProps) {
  const { slug } = await params;
  const building = await getBuildingPageData(slug);

  if (!building) {
    notFound();
  }

  return (
    <div className="shell pb-20 pt-10 sm:pt-14">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-4">
          <Link href={`/quads/${building.quad.slug}`} className="eyebrow inline-flex">
            {building.quad.name}
          </Link>
          <div>
            <h1 className="section-title font-[family-name:var(--font-heading)]">{building.name}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="pill">{building.type}</span>
              {building.type === "Corridor" ? <span className="pill">Communal bathroom</span> : null}
              {building.hasKitchen ? <span className="pill">Kitchen / cooking unit</span> : null}
            </div>
            <p className="mt-4 text-lg text-[color:var(--muted)]">
              Read the overall rating, category breakdown, and first-hand reviews from students who
              have actually lived in {building.name}.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="panel px-5 py-4 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Overall</p>
            <p className="mt-2 text-2xl font-semibold">{formatRating(building.averageRating)}</p>
          </div>
          <div className="panel px-5 py-4 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Reviews</p>
            <p className="mt-2 text-2xl font-semibold">{building.reviewCount}</p>
          </div>
          <Link href={`/review?building=${building.slug}`} className="btn-primary self-center">
            Write a Review
          </Link>
        </div>
      </div>

      <section className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="panel-strong p-6">
          <p className="eyebrow">Category Breakdown</p>
          <h2 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-semibold">
            Average category ratings
          </h2>
          <div className="mt-6 space-y-4">
            {reviewCategoryLabels.map((category) => (
              <div
                key={category.key}
                className="grid items-center gap-3 rounded-2xl bg-white/75 px-4 py-4 sm:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-medium capitalize">{category.label}</p>
                  <p className="text-sm text-[color:var(--muted)]">
                    {category.description}
                  </p>
                </div>
                <div className="text-lg font-semibold text-[color:var(--brand-deep)]">
                  {formatRating(building.categoryAverages[category.key])}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="panel-strong p-6">
            <p className="eyebrow">Review Feed</p>
            <h2 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-semibold">
              What students say
            </h2>
          </div>

          {building.reviews.map((review) => (
            <article key={review.id} className="panel-strong p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="pill">{formatRating(review.overall_rating)}</span>
                    <span className="pill">{review.class_year_when_lived}</span>
                    {review.residence_season && review.residence_year ? (
                      <span className="pill">
                        {review.residence_season} {review.residence_year}
                      </span>
                    ) : null}
                    <span className="pill">{review.best_for}</span>
                    <span className="pill">
                      {review.would_live_again ? "Would live again" : "Would not live again"}
                    </span>
                  </div>
                  <p className="text-sm text-[color:var(--muted)]">
                    Posted {formatDateLabel(review.created_at)}
                  </p>
                </div>
              </div>

              <p className="mt-5 text-base leading-7">{review.review_text}</p>

              {review.photo_urls.length > 0 ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {review.photo_urls.map((photoUrl) => (
                    <Image
                      key={photoUrl}
                      src={photoUrl}
                      alt="Dorm photo from review"
                      width={800}
                      height={600}
                      className="aspect-[4/3] w-full rounded-2xl object-cover"
                      sizes="(min-width: 640px) 50vw, 100vw"
                      loading="lazy"
                    />
                  ))}
                </div>
              ) : null}

              {review.pros_text ? (
                <div className="mt-5 rounded-2xl bg-white/75 p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-accent)]">
                    Pros
                  </p>
                  <p className="mt-2 text-sm text-[color:var(--foreground)]">{review.pros_text}</p>
                </div>
              ) : null}

              {review.cons_text ? (
                <div className="mt-4 rounded-2xl bg-white/75 p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--danger)]">
                    Cons
                  </p>
                  <p className="mt-2 text-sm text-[color:var(--foreground)]">{review.cons_text}</p>
                </div>
              ) : null}

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                The first review will set the tone for future students trying to compare dorms.
              </p>
              <Link href={`/review?building=${building.slug}`} className="btn-primary mt-6">
                Leave the first review
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
