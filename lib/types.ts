export type BuildingType = "Corridor" | "Suite" | "Apartment";
export type BestFor = "Quiet" | "Social" | "Convenience" | "Suite-style" | "Apartment-style";
export type ClassYear = "Freshman" | "Sophomore" | "Junior" | "Senior";
export type ResidenceSeason = "Fall" | "Winter" | "Spring" | "Summer";

export type ReviewRecord = {
  id: string;
  overall_rating: number;
  cleanliness_rating: number;
  noise_rating: number;
  bathroom_rating: number;
  location_rating: number;
  social_rating: number;
  amenities_rating: number;
  room_quality_rating: number;
  would_live_again: boolean;
  best_for: BestFor;
  review_text: string;
  pros_text: string | null;
  cons_text: string | null;
  class_year_when_lived: ClassYear;
  residence_start_season: ResidenceSeason | null;
  residence_start_year: number | null;
  residence_end_season: ResidenceSeason | null;
  residence_end_year: number | null;
  photo_urls: string[];
  created_at: string;
};

export type BuildingRecord = {
  id: string;
  quad_id: string;
  name: string;
  slug: string;
  type: BuildingType;
  has_kitchen: boolean;
  reviews: ReviewRecord[];
};

export type QuadRecord = {
  id: string;
  name: string;
  slug: string;
  buildings: BuildingRecord[];
};

export type QuadSummary = {
  id: string;
  name: string;
  slug: string;
  averageRating: number;
  buildingCount: number;
  reviewCount: number;
};

export type QuadBuildingSummary = {
  id: string;
  name: string;
  slug: string;
  type: BuildingType;
  hasKitchen: boolean;
  averageRating: number;
  reviewCount: number;
  latestReviewDate: string | null;
  latestReviewDateLabel: string;
};

export type BuildingDetail = {
  id: string;
  name: string;
  slug: string;
  type: BuildingType;
  hasKitchen: boolean;
  quad: {
    id: string;
    name: string;
    slug: string;
  };
  averageRating: number;
  reviewCount: number;
  categoryAverages: Record<
    | "cleanliness_rating"
    | "noise_rating"
    | "bathroom_rating"
    | "location_rating"
    | "social_rating"
    | "amenities_rating"
    | "room_quality_rating",
    number
  >;
  reviews: ReviewRecord[];
};

export type ReviewFormQuad = {
  id: string;
  name: string;
  slug: string;
  buildings: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
};

export type HomeSearchBuilding = {
  id: string;
  name: string;
  slug: string;
  quadName: string;
  quadSlug: string;
};

export type HomeQuickViewQuad = {
  id: string;
  name: string;
  slug: string;
  averageRating: number;
  buildingCount: number;
  reviewCount: number;
  buildings: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
};
