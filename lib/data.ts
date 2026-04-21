import { quadSortOptions, reviewCategoryLabels } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type {
  BuildingDetail,
  BuildingRecord,
  QuadBuildingSummary,
  QuadRecord,
  QuadSummary,
  ReviewFormQuad,
  ReviewRecord
} from "@/lib/types";
import { average, formatDateLabel } from "@/lib/utils";

export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

async function getQuadsWithBuildings(): Promise<QuadRecord[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quads")
    .select(
      `
        id,
        name,
        slug,
        buildings (
          id,
          quad_id,
          name,
          slug,
          type,
          has_kitchen,
          reviews (
            id,
            overall_rating,
            cleanliness_rating,
            noise_rating,
            bathroom_rating,
            location_rating,
            social_rating,
            amenities_rating,
            room_quality_rating,
            would_live_again,
            best_for,
            review_text,
            pros_text,
            cons_text,
            class_year_when_lived,
            created_at
          )
        )
      `
    )
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as QuadRecord[]).map((quad) => ({
    ...quad,
    buildings: (quad.buildings ?? []).map((building) => ({
      ...building,
      reviews: (building.reviews ?? []) as ReviewRecord[]
    }))
  }));
}

export async function getQuadSummaries(): Promise<QuadSummary[]> {
  const quads = await getQuadsWithBuildings();

  return quads.map((quad) => {
    const allReviews = quad.buildings.flatMap((building) => building.reviews);

    return {
      id: quad.id,
      name: quad.name,
      slug: quad.slug,
      averageRating: average(allReviews.map((review) => review.overall_rating)),
      buildingCount: quad.buildings.length,
      reviewCount: allReviews.length
    };
  });
}

function toBuildingSummary(building: BuildingRecord): QuadBuildingSummary {
  const ratings = building.reviews.map((review) => review.overall_rating);
  const latestReviewDate =
    building.reviews
      .map((review) => review.created_at)
      .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0] ?? null;

  return {
    id: building.id,
    name: building.name,
    slug: building.slug,
    type: building.type,
    hasKitchen: building.has_kitchen,
    averageRating: average(ratings),
    reviewCount: building.reviews.length,
    latestReviewDate,
    latestReviewDateLabel: formatDateLabel(latestReviewDate)
  };
}

export async function getQuadPageData(quadSlug: string, type = "all", sort = "rating") {
  const quads = await getQuadsWithBuildings();
  const quad = quads.find((entry) => entry.slug === quadSlug);

  if (!quad) {
    return null;
  }

  const safeType =
    type === "all" || quad.buildings.some((building) => building.type === type) ? type : "all";
  const safeSort = quadSortOptions.some((option) => option.value === sort) ? sort : "rating";

  const summaries = quad.buildings
    .filter((building) => (safeType === "all" ? true : building.type === safeType))
    .map(toBuildingSummary)
    .sort((left, right) => {
      if (safeSort === "reviews") {
        return right.reviewCount - left.reviewCount;
      }

      if (safeSort === "recent") {
        return (
          new Date(right.latestReviewDate ?? 0).getTime() - new Date(left.latestReviewDate ?? 0).getTime()
        );
      }

      return right.averageRating - left.averageRating;
    });

  const reviewCount = quad.buildings.reduce((count, building) => count + building.reviews.length, 0);

  return {
    quad,
    buildings: summaries,
    filters: {
      type: safeType,
      sort: safeSort
    },
    summary: {
      averageRating: average(
        quad.buildings.flatMap((building) => building.reviews.map((review) => review.overall_rating))
      ),
      buildingCount: quad.buildings.length,
      reviewCount
    }
  };
}

export async function getBuildingPageData(buildingSlug: string): Promise<BuildingDetail | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("buildings")
    .select(
      `
        id,
        name,
        slug,
        type,
        has_kitchen,
        quad:quads (
          id,
          name,
          slug
        ),
        reviews (
          id,
          overall_rating,
          cleanliness_rating,
          noise_rating,
          bathroom_rating,
          location_rating,
          social_rating,
          amenities_rating,
          room_quality_rating,
          would_live_again,
          best_for,
          review_text,
          pros_text,
          cons_text,
          class_year_when_lived,
          created_at
        )
      `
    )
    .eq("slug", buildingSlug)
    .single();

  if (error) {
    return null;
  }

  const reviews = ((data.reviews ?? []) as ReviewRecord[]).sort(
    (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  );
  const categoryAverages: BuildingDetail["categoryAverages"] = {
    cleanliness_rating: 0,
    noise_rating: 0,
    bathroom_rating: 0,
    location_rating: 0,
    social_rating: 0,
    amenities_rating: 0,
    room_quality_rating: 0
  };

  for (const category of reviewCategoryLabels) {
    categoryAverages[category.key] = average(reviews.map((review) => Number(review[category.key])));
  }

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    type: data.type,
    hasKitchen: data.has_kitchen,
    quad: Array.isArray(data.quad) ? data.quad[0] : data.quad,
    averageRating: average(reviews.map((review) => review.overall_rating)),
    reviewCount: reviews.length,
    categoryAverages,
    reviews
  };
}

export async function getReviewFormData() {
  const quads = await getQuadsWithBuildings();

  const serializedQuads: ReviewFormQuad[] = quads.map((quad) => ({
    id: quad.id,
    name: quad.name,
    slug: quad.slug,
    buildings: quad.buildings.map((building) => ({
      id: building.id,
      name: building.name,
      slug: building.slug
    }))
  }));

  return {
    quads: serializedQuads
  };
}
