"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/data";
import {
  bestForOptions,
  classYearOptions,
  residenceSeasonOptions,
  residenceStartYear
} from "@/lib/constants";
import { consumeRateLimit, isUuid, isValidLength, sanitizePlainText } from "@/lib/security";
import { isRatingValue, isSbuEmail } from "@/lib/utils";

export type ReviewFormState = {
  error: string | null;
  success: string | null;
};

const maxPhotoCount = 4;
const maxPhotoSize = 5 * 1024 * 1024;
const allowedPhotoTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"]
]);

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

  const quadId = sanitizePlainText(formData.get("quad_id")?.toString() ?? "");
  const buildingId = sanitizePlainText(formData.get("building_id")?.toString() ?? "");
  const reviewText = sanitizePlainText(formData.get("review_text")?.toString() ?? "");
  const prosText = sanitizePlainText(formData.get("pros_text")?.toString() ?? "");
  const consText = sanitizePlainText(formData.get("cons_text")?.toString() ?? "");
  const bestFor = formData.get("best_for")?.toString().trim() ?? "";
  const classYear = formData.get("class_year_when_lived")?.toString().trim() ?? "";
  const residenceSeason = formData.get("residence_season")?.toString().trim() ?? "";
  const residenceYearValue = formData.get("residence_year")?.toString().trim() ?? "";
  const residenceYear = Number(residenceYearValue);
  const wouldLiveAgainValue = formData.get("would_live_again")?.toString() ?? "";
  const wouldLiveAgain = wouldLiveAgainValue === "true";
  const photos = formData
    .getAll("photos")
    .filter((value): value is File => value instanceof File && value.size > 0);

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

  if (!isUuid(quadId) || !isUuid(buildingId)) {
    return {
      error: "Choose a valid quad and building.",
      success: null
    };
  }

  if (!isValidLength(reviewText, 10, 2000) || prosText.length > 1000 || consText.length > 1000) {
    return {
      error: "Review text must be between 10 and 2000 characters. Pros and cons must be 1000 characters or fewer.",
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

  if (!residenceSeasonOptions.some((option) => option === residenceSeason)) {
    return {
      error: "Pick a valid season for when you lived there.",
      success: null
    };
  }

  const currentYear = new Date().getFullYear();

  if (
    !Number.isInteger(residenceYear) ||
    residenceYear < residenceStartYear ||
    residenceYear > currentYear
  ) {
    return {
      error: `Enter a year from ${residenceStartYear} to ${currentYear}.`,
      success: null
    };
  }

  if (wouldLiveAgainValue !== "true" && wouldLiveAgainValue !== "false") {
    return {
      error: "Pick a valid response for whether you would live there again.",
      success: null
    };
  }

  if (photos.length > maxPhotoCount) {
    return {
      error: `Upload ${maxPhotoCount} photos or fewer.`,
      success: null
    };
  }

  if (photos.some((photo) => photo.size > maxPhotoSize || !allowedPhotoTypes.has(photo.type))) {
    return {
      error: "Photos must be JPG, PNG, or WebP files that are 5 MB or smaller.",
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

  if (
    !consumeRateLimit({
      key: `review-submit:${user.id}`,
      limit: 5,
      windowMs: 60 * 60 * 1000
    })
  ) {
    return {
      error: "Too many review attempts. Please try again later.",
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
      error: "Choose a valid building for the selected quad.",
      success: null
    };
  }

  const reviewId = crypto.randomUUID();
  const uploadedPhotoPaths: string[] = [];
  const photoUrls: string[] = [];

  for (const photo of photos) {
    const extension = allowedPhotoTypes.get(photo.type) ?? "jpg";
    const path = `${user.id}/${reviewId}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("review-photos")
      .upload(path, photo, {
        contentType: photo.type,
        upsert: false
      });

    if (uploadError) {
      if (uploadedPhotoPaths.length > 0) {
        await supabase.storage.from("review-photos").remove(uploadedPhotoPaths);
      }

      return {
        error: "Photos could not be uploaded. Please try again.",
        success: null
      };
    }

    uploadedPhotoPaths.push(path);
    const { data: publicUrlData } = supabase.storage.from("review-photos").getPublicUrl(path);
    photoUrls.push(publicUrlData.publicUrl);
  }

  const { error } = await supabase.from("reviews").insert({
    id: reviewId,
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
    class_year_when_lived: classYear,
    residence_season: residenceSeason,
    residence_year: residenceYear,
    photo_urls: photoUrls
  });

  if (error) {
    if (uploadedPhotoPaths.length > 0) {
      await supabase.storage.from("review-photos").remove(uploadedPhotoPaths);
    }

    if (error.code === "23505") {
      return {
        error: "You already submitted a review for this building.",
        success: null
      };
    }

    return {
      error: "Review could not be submitted. Please try again.",
      success: null
    };
  }

  revalidatePath("/quads");
  revalidatePath("/");
  revalidatePath(`/quads/${formData.get("quad_slug")?.toString() ?? ""}`);
  revalidatePath(`/buildings/${building.slug}`);
  redirect(`/buildings/${building.slug}`);
}
