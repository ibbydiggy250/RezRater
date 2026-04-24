import Link from "next/link";
import { HomeSearch } from "@/components/home-search";
import { QuickViewScroller } from "@/components/quick-view-scroller";
import { getHomePageData } from "@/lib/data";
import { formatRating } from "@/lib/utils";
import heroBackground from "@/logos/image copy.png";

const featureCards = [
  {
    label: "Structured ratings",
    description:
      "Compare dorms using consistent categories like cleanliness, noise, bathrooms, location, social life, amenities, and room quality.",
    iconLabel: "01"
  },
  {
    label: "Verified @stonybrook.edu sign-in",
    description:
      "Reviews come from students signing in with a Stony Brook email, which keeps the feedback more relevant and grounded.",
    iconLabel: "02"
  },
  {
    label: "One review per student per building",
    description:
      "Each student gets one voice per dorm, helping ratings reflect broad student experience instead of repeat submissions.",
    iconLabel: "03"
  }
];

export default async function HomePage() {
  const { quads, buildings } = await getHomePageData();
  const reviewedBuildings = quads.reduce((total, quad) => total + quad.buildingCount, 0);
  const totalReviews = quads.reduce((total, quad) => total + quad.reviewCount, 0);
  const ratedQuads = quads.filter((quad) => quad.reviewCount > 0);
  const averageRating =
    ratedQuads.length > 0
      ? `${(
          ratedQuads.reduce((sum, quad) => sum + quad.averageRating, 0) / ratedQuads.length
        ).toFixed(1)} / 5`
      : "N/A";
  const stats = [
    {
      label: "Quads",
      value: quads.length.toString(),
      icon: "Q"
    },
    {
      label: "Buildings",
      value: reviewedBuildings.toString(),
      icon: "B"
    },
    {
      label: "Reviews",
      value: totalReviews.toString(),
      icon: "R"
    },
    {
      label: "Average rating",
      value: averageRating,
      icon: "A"
    }
  ];

  return (
    <div className="pb-16 sm:pb-24">
      <section
        className="relative isolate -mt-[88px] flex min-h-[100svh] items-center justify-center overflow-hidden bg-cover bg-center px-4 pb-20 pt-[132px] text-white sm:px-6"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(8, 18, 35, 0.34), rgba(8, 18, 35, 0.58)), linear-gradient(90deg, rgba(111, 15, 19, 0.42), rgba(22, 61, 107, 0.22)), url("${heroBackground.src}")`
        }}
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_42%)]" />
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/78">
            Stony Brook Housing Guide
          </p>
          <h1 className="mt-5 font-[family-name:var(--font-heading)] text-6xl font-bold tracking-tight text-white drop-shadow-[0_10px_32px_rgba(0,0,0,0.28)] sm:text-7xl lg:text-8xl">
            RateMyRez
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/82 sm:text-lg">
            Find the dorm that fits your campus life.
          </p>

          <div className="mt-9 w-full">
            <HomeSearch buildings={buildings} quads={quads} variant="hero" showHelper={false} />
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/quads" className="btn-primary">
              Browse Dorms
            </Link>
            <Link href="/review" className="btn-primary">
              Leave a Review
            </Link>
          </div>
        </div>
      </section>

      <section
        data-scroll-reveal
        className="border-y border-[color:var(--border)] bg-white/58 py-12 backdrop-blur-sm sm:py-14"
      >
        <div className="shell">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">At A Glance</p>
              <h2 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight sm:text-4xl">
                A quick read on the housing directory.
              </h2>
            </div>
            <p className="max-w-xl text-[color:var(--muted)]">
              Simple campus-wide context before students dig into individual residence halls.
            </p>
          </div>

          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="border-l border-[color:rgba(18,35,61,0.14)] pl-5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--brand-soft)] font-[family-name:var(--font-heading)] text-sm font-semibold text-[color:var(--brand-deep)]">
                    {stat.icon}
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                    {stat.label}
                  </p>
                </div>
                <p className="mt-4 font-[family-name:var(--font-heading)] text-5xl font-semibold tracking-tight">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-scroll-reveal className="shell mt-14 space-y-5 sm:mt-20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="eyebrow">Quick View</p>
            <h2 className="section-title font-[family-name:var(--font-heading)]">
              Scroll through quads and jump straight into dorm pages.
            </h2>
            <p className="max-w-3xl text-lg text-[color:var(--muted)]">
              Each card gives you the community snapshot and the fastest route into individual
              halls.
            </p>
          </div>
          <Link href="/quads" className="btn-secondary w-fit">
            View all quads
          </Link>
        </div>

        <QuickViewScroller>
          {quads.map((quad) => (
            <article
              key={quad.id}
              className="panel-strong interactive-card group relative min-w-[290px] snap-start p-5 sm:min-w-[320px]"
            >
              <Link
                href={`/quads/${quad.slug}`}
                aria-label={`Open ${quad.name}`}
                className="absolute inset-0 z-10 rounded-panel"
              />

              <div className="pointer-events-none relative z-20">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">Quad</p>
                    <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-semibold">
                      {quad.name}
                    </h3>
                  </div>
                  <span className="rounded-full bg-[color:var(--brand-soft)] px-3 py-1 text-sm font-semibold text-[color:var(--brand-deep)]">
                    {formatRating(quad.averageRating)}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
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

                <div className="pointer-events-auto mt-5 flex flex-wrap gap-2">
                  {quad.buildings.slice(0, 6).map((building) => (
                    <Link key={building.id} href={`/buildings/${building.slug}`} className="pill">
                      {building.name}
                    </Link>
                  ))}
                  {quad.buildings.length > 6 ? (
                    <Link href={`/quads/${quad.slug}`} className="pill">
                      +{quad.buildings.length - 6} more
                    </Link>
                  ) : null}
                </div>

                <span
                  className="mt-6 inline-flex text-sm font-semibold text-[color:var(--brand-deep)] transition group-hover:translate-x-0.5"
                >
                  Open {quad.name}
                </span>
              </div>
            </article>
          ))}
        </QuickViewScroller>
      </section>

      <section data-scroll-reveal className="shell mt-16 sm:mt-24">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="space-y-3">
            <p className="eyebrow">Why RateMyRez</p>
            <h2 className="section-title font-[family-name:var(--font-heading)]">
              Built for housing decisions students can trust.
            </h2>
            <p className="text-lg text-[color:var(--muted)]">
              The details that were too noisy for the hero belong here: how reviews are structured,
              who can submit them, and why the data stays useful.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {featureCards.map((feature) => (
              <article
                key={feature.label}
                className="rounded-[1.75rem] border border-[color:var(--border)] bg-white/62 p-6 backdrop-blur-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--brand-deep)] font-[family-name:var(--font-heading)] text-sm font-semibold text-white">
                  {feature.iconLabel}
                </div>
                <h3 className="mt-5 font-[family-name:var(--font-heading)] text-xl font-semibold">
                  {feature.label}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
