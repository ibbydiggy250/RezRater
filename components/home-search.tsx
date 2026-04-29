"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useDeferredValue, useState } from "react";
import { startNavigationProgress } from "@/components/navigation-progress";
import type { HomeQuickViewQuad, HomeSearchBuilding } from "@/lib/types";

type HomeSearchProps = {
  buildings: HomeSearchBuilding[];
  quads: HomeQuickViewQuad[];
  variant?: "default" | "hero";
  showHelper?: boolean;
};

type SearchResult = {
  id: string;
  name: string;
  subtitle: string;
  href: string;
  type: "Community" | "Dorm";
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function getSearchResults(buildings: HomeSearchBuilding[], quads: HomeQuickViewQuad[]) {
  return [
    ...quads.map((quad) => ({
      id: `quad-${quad.id}`,
      name: quad.name,
      subtitle: "Community",
      href: `/quads/${quad.slug}`,
      type: "Community" as const
    })),
    ...buildings.map((building) => ({
      id: `building-${building.id}`,
      name: building.name,
      subtitle: building.quadName,
      href: `/buildings/${building.slug}`,
      type: "Dorm" as const
    }))
  ];
}

function getMatches(results: SearchResult[], query: string) {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return [];
  }

  const startsWithMatches = results.filter((result) => normalize(result.name).startsWith(normalizedQuery));

  const includesMatches = results.filter((result) => {
    const resultName = normalize(result.name);
    const subtitle = normalize(result.subtitle);
    return (
      !resultName.startsWith(normalizedQuery) &&
      (resultName.includes(normalizedQuery) || subtitle.includes(normalizedQuery))
    );
  });

  return [...startsWithMatches, ...includesMatches].slice(0, 6);
}

export function HomeSearch({
  buildings,
  quads,
  variant = "default",
  showHelper = true
}: HomeSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);
  const results = getSearchResults(buildings, quads);
  const matches = getMatches(results, deferredQuery);
  const isHero = variant === "hero";

  function openResult(href: string) {
    setError(null);
    startNavigationProgress();
    startTransition(() => {
      router.push(href);
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedQuery = normalize(query);
    if (!normalizedQuery) {
      setError("Enter a building or community name.");
      return;
    }

    const exactMatch = results.find((result) => normalize(result.name) === normalizedQuery) ?? matches[0];

    if (!exactMatch) {
      setError(`No building or community matched "${query.trim()}".`);
      return;
    }

    openResult(exactMatch.href);
  }

  return (
    <div className={isHero ? "mx-auto w-full max-w-2xl space-y-3" : "space-y-3"}>
      <form
        onSubmit={handleSubmit}
        className={
          isHero
            ? "rounded-full bg-white/95 p-2 shadow-[0_24px_60px_rgba(6,18,35,0.22)] backdrop-blur-sm"
            : "panel-strong p-3 sm:p-4"
        }
      >
        <label htmlFor="home-building-search" className="sr-only">
          Search for a building or community
        </label>
        <div className={isHero ? "flex gap-2" : "flex flex-col gap-3 sm:flex-row"}>
          <input
            id="home-building-search"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              if (error) {
                setError(null);
              }
            }}
            placeholder="Search by building or community"
            className={
              isHero
                ? "min-w-0 flex-1 rounded-full border border-transparent bg-transparent px-4 py-3 text-sm text-[color:var(--foreground)] outline-none placeholder:text-[color:rgba(18,35,61,0.48)] focus:border-[color:rgba(22,61,107,0.18)] sm:px-5 sm:text-base"
                : "field flex-1"
            }
          />
          <button type="submit" className="btn-primary shrink-0 px-5 sm:px-6">
            Search
          </button>
        </div>
      </form>

      {error ? <p className="feedback-error">{error}</p> : null}

      {matches.length > 0 ? (
        <div
          className={
            isHero
              ? "flex flex-wrap justify-center gap-2 rounded-[1.25rem] bg-white/92 px-4 py-3 shadow-[0_18px_44px_rgba(6,18,35,0.14)] backdrop-blur-sm"
              : "panel flex flex-wrap gap-2 px-4 py-3"
          }
        >
          {matches.map((result) => (
            <button
              key={result.id}
              type="button"
              onClick={() => openResult(result.href)}
              className="rounded-full border border-[color:var(--border)] bg-white/90 px-4 py-2 text-left text-sm transition hover:border-[color:rgba(166,34,49,0.18)] hover:bg-white"
            >
              <span className="font-semibold text-[color:var(--foreground)]">{result.name}</span>
              {result.subtitle !== result.type ? (
                <span className="ml-2 text-[color:var(--muted)]">{result.subtitle}</span>
              ) : null}
              <span
                className={
                  result.type === "Community"
                    ? "ml-2 text-[color:var(--brand-blue)]"
                    : "ml-2 text-[color:var(--brand-accent)]"
                }
              >
                {result.type}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {showHelper ? (
        <p className="text-sm text-[color:var(--muted)]">
          Try a hall name like `Yang` or a community like `Kelly`, or{" "}
          <Link href="/quads" className="font-semibold text-[color:var(--brand-deep)]">
            browse all communities
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
