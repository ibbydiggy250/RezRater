"use client";

import { useActionState, useState } from "react";
import type { ReviewFormState } from "@/app/review/actions";
import {
  bestForOptions,
  classYearOptions,
  ratingFieldDefinitions,
  residenceStartYear,
  residenceSeasonOptions
} from "@/lib/constants";
import type { ReviewFormQuad } from "@/lib/types";

type ReviewFormProps = {
  action: (state: ReviewFormState, formData: FormData) => Promise<ReviewFormState>;
  initialState: ReviewFormState;
  quads: ReviewFormQuad[];
  preselectedBuildingSlug?: string;
};

function getInitialSelection(quads: ReviewFormQuad[], preselectedBuildingSlug?: string) {
  for (const quad of quads) {
    const matchingBuilding =
      quad.buildings.find((building) => building.slug === preselectedBuildingSlug) ??
      quad.buildings[0];

    if (matchingBuilding && (!preselectedBuildingSlug || matchingBuilding.slug === preselectedBuildingSlug)) {
      return {
        quadId: quad.id,
        quadSlug: quad.slug,
        buildingId: matchingBuilding.id
      };
    }
  }

  const firstQuad = quads[0];
  const firstBuilding = firstQuad?.buildings[0];

  return {
    quadId: firstQuad?.id ?? "",
    quadSlug: firstQuad?.slug ?? "",
    buildingId: firstBuilding?.id ?? ""
  };
}

function getDefaultResidenceRange() {
  const now = new Date();
  const currentYear = now.getFullYear();

  if (now.getMonth() <= 4) {
    return {
      startYear: currentYear - 1,
      endYear: currentYear
    };
  }

  return {
    startYear: currentYear,
    endYear: currentYear + 1
  };
}

export function ReviewForm({
  action,
  initialState,
  quads,
  preselectedBuildingSlug
}: ReviewFormProps) {
  const initialSelection = getInitialSelection(quads, preselectedBuildingSlug);

  const [selectedQuadId, setSelectedQuadId] = useState(initialSelection.quadId);
  const [selectedQuadSlug, setSelectedQuadSlug] = useState(initialSelection.quadSlug);
  const [selectedBuildingId, setSelectedBuildingId] = useState(initialSelection.buildingId);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const defaultResidenceRange = getDefaultResidenceRange();
  const residenceYearOptions = Array.from(
    { length: new Date().getFullYear() + 1 - residenceStartYear + 1 },
    (_, index) => new Date().getFullYear() + 1 - index
  );

  const activeQuad = quads.find((quad) => quad.id === selectedQuadId) ?? quads[0];
  const activeBuildings = activeQuad?.buildings ?? [];

  return (
    <form action={formAction} className="panel-strong space-y-8 p-4 sm:p-8">
      <div className="grid gap-5 lg:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          <span>Quad</span>
          <select
            name="quad_id"
            value={selectedQuadId}
            onChange={(event) => {
              const nextQuad = quads.find((quad) => quad.id === event.target.value);
              const firstBuilding = nextQuad?.buildings[0];
              setSelectedQuadId(event.target.value);
              setSelectedQuadSlug(nextQuad?.slug ?? "");
              setSelectedBuildingId(firstBuilding?.id ?? "");
            }}
            className="field"
            required
          >
            {quads.map((quad) => (
              <option key={quad.id} value={quad.id}>
                {quad.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium">
          <span>Building</span>
          <select
            name="building_id"
            value={selectedBuildingId}
            onChange={(event) => setSelectedBuildingId(event.target.value)}
            className="field"
            required
          >
            {activeBuildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <input type="hidden" name="quad_slug" value={selectedQuadSlug} />

      <section className="space-y-4">
        <div>
          <p className="eyebrow">Ratings</p>
          <h2 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-semibold">
            Score each category from 1 to 5
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {ratingFieldDefinitions.map((field) => (
            <label key={field.name} className="space-y-2 rounded-[1.25rem] bg-white/70 p-3 text-sm sm:p-4">
              <span className="block font-semibold">{field.label}</span>
              <span className="block text-sm text-[color:var(--muted)]">{field.helpText}</span>
              <select name={field.name} defaultValue="5" className="field" required>
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <label className="space-y-2 text-sm font-medium">
          <span>Best for</span>
          <select name="best_for" className="field" defaultValue={bestForOptions[0]} required>
            {bestForOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium">
          <span>Class year when you lived there</span>
          <select
            name="class_year_when_lived"
            className="field"
            defaultValue={classYearOptions[0]}
            required
          >
            {classYearOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium">
          <span>Would you live there again?</span>
          <select name="would_live_again" className="field" defaultValue="true" required>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
      </section>

      <section className="grid gap-5 lg:grid-cols-4">
        <label className="space-y-2 text-sm font-medium">
          <span>Start semester</span>
          <select name="residence_start_season" className="field" defaultValue="Fall" required>
            {residenceSeasonOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium">
          <span>Start year</span>
          <select
            name="residence_start_year"
            className="field"
            defaultValue={defaultResidenceRange.startYear}
            required
          >
            {residenceYearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium">
          <span>End semester</span>
          <select name="residence_end_season" className="field" defaultValue="Spring" required>
            {residenceSeasonOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium">
          <span>End year</span>
          <select
            name="residence_end_year"
            className="field"
            defaultValue={defaultResidenceRange.endYear}
            required
          >
            {residenceYearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="grid gap-5">
        <label className="space-y-2 text-sm font-medium">
          <span>Review</span>
          <textarea
            name="review_text"
            rows={6}
            className="field"
            placeholder="What should another student know before choosing this dorm?"
            required
          />
        </label>

        <div className="grid gap-5 lg:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            <span>Pros</span>
            <textarea
              name="pros_text"
              rows={4}
              className="field"
              placeholder="What stood out in a good way?"
            />
          </label>

          <label className="space-y-2 text-sm font-medium">
            <span>Cons</span>
            <textarea
              name="cons_text"
              rows={4}
              className="field"
              placeholder="What tradeoffs should people expect?"
            />
          </label>
        </div>

        <label className="space-y-2 text-sm font-medium">
          <span>Photos</span>
          <input
            name="photos"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="field file:mr-4 file:rounded-full file:border-0 file:bg-[color:var(--brand-deep)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
          <span className="block text-sm text-[color:var(--muted)]">
            Upload up to 4 JPG, PNG, or WebP photos.
          </span>
        </label>
      </section>

      {state.error ? (
        <p className="feedback-error">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="feedback-success">
          {state.success}
        </p>
      ) : null}

      <button type="submit" disabled={isPending} className="btn-primary disabled:opacity-70">
        {isPending ? "Submitting review..." : "Submit Review"}
      </button>
    </form>
  );
}
