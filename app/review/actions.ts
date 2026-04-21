"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/data";
import { bestForOptions, classYearOptions } from "@/lib/constants";
import { isRatingValue, isSbuEmail } from "@/lib/utils";

export type ReviewFormState = {
  error: string | null;
  success: string | null;
};

export async function submitReview(
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  if (!hasSupabaseEnv()) {
    return {
      error: "Supabase environment variables are missing. Add them before submitting reviews.",
      success: null
    };
  }

  const quadId = formData.get("quad_id")?.toString().trim() ?? "";
  const buildingId = formData.get("building_id")?.toString().trim() ?? "";
  const reviewText = formData.get("review_text")?.toString().trim() ?? "";
  const prosText = formData.get("pros_text")?.toString().trim() ?? "";
  const consText = formData.get("cons_text")?.toString().trim() ?? "";
  const bestFor = formData.get("best_for")?.toString().trim() ?? "";
  const classYear = formData.get("class_year_when_lived")?.toString().trim() ?? "";
  const wouldLiveAgain = formData.get("would_live_again")?.toString() === "true";

  const ratings = {
    overall_rating: formData.get("overall_rating")?.toString() ?? "",
    cleanliness_rating: formData.get("cleanliness_rating")?.toString() ?? "",
    noise_rating: formData.get("noise_rating")?.toString() ?? "",
    bathroom_rating: formData.get("bathroom_rating")?.toString() ?? "",
    location_rating: formData.get("location_rating")?.toString() ?? "",
    social_rating: formData.get("social_rating")?.toString() ?? "",
    amenities_rating: formData.get("amenities_rating")?.toString() ?? "",
    room_quality_rating: formData.get("room_quality_rating")?.toString() ?? ""
  };

  if (!quadId || !buildingId || !reviewText) {
    return {
      error: "Quad, building, and review text are required.",
      success: null
    };
  }

  if (!Object.values(ratings).every(isRatingValue)) {
    return {
      error: "Every rating must be a value from 1 to 5.",
      success: null
    };
  }

  if (!bestForOptions.some((option) => option === bestFor)) {
    return {
      error: "Pick a valid \"best for\" option.",
      success: null
    };
  }

  if (!classYearOptions.some((option) => option === classYear)) {
    return {
      error: "Pick a valid class year.",
      success: null
    };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.id || !user.email) {
    return {
      error: "You need to sign in with your Stony Brook email before submitting a review.",
      success: null
    };
  }

  if (!isSbuEmail(user.email)) {
    return {
      error: "Only @stonybrook.edu accounts can submit reviews.",
      success: null
    };
  }

  const { data: building, error: buildingError } = await supabase
    .from("buildings")
    .select("id, slug, quad_id")
    .eq("id", buildingId)
    .single();

  if (buildingError || !building || building.quad_id !== quadId) {
    return {
      error: "The selected building does not belong to the selected quad.",
      success: null
    };
  }

  const { error } = await supabase.from("reviews").insert({
    user_id: user.id,
    building_id: buildingId,
    overall_rating: Number(ratings.overall_rating),
    cleanliness_rating: Number(ratings.cleanliness_rating),
    noise_rating: Number(ratings.noise_rating),
    bathroom_rating: Number(ratings.bathroom_rating),
    location_rating: Number(ratings.location_rating),
    social_rating: Number(ratings.social_rating),
    amenities_rating: Number(ratings.amenities_rating),
    room_quality_rating: Number(ratings.room_quality_rating),
    would_live_again: wouldLiveAgain,
    best_for: bestFor,
    review_text: reviewText,
    pros_text: prosText || null,
    cons_text: consText || null,
    class_year_when_lived: classYear
  });

  if (error) {
    if (error.code === "23505") {
      return {
        error: "You already submitted a review for this building.",
        success: null
      };
    }

    return {
      error: error.message,
      success: null
    };
  }

  revalidatePath("/quads");
  revalidatePath("/");
  revalidatePath(`/quads/${formData.get("quad_slug")?.toString() ?? ""}`);
  revalidatePath(`/buildings/${building.slug}`);
  redirect(`/buildings/${building.slug}`);
}
