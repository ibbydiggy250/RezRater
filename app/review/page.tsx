import { redirect } from "next/navigation";
import { ReviewForm } from "@/components/review-form";
import { submitReview } from "@/app/review/actions";
import { createClient } from "@/lib/supabase/server";
import { getReviewFormData, hasSupabaseEnv } from "@/lib/data";

type ReviewPageProps = {
  searchParams: Promise<{
    building?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  if (!hasSupabaseEnv()) {
    return (
      <div className="shell pb-20 pt-10 sm:pt-14">
        <div className="panel-strong max-w-3xl p-8">
          <p className="eyebrow">Setup Needed</p>
          <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-semibold">
            Connect Supabase before submitting reviews.
          </h1>
          <p className="mt-4 text-[color:var(--muted)]">
            Add your `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
            `NEXT_PUBLIC_SITE_URL`, then run the SQL in `supabase/schema.sql`.
          </p>
        </div>
      </div>
    );
  }

  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/review${params.building ? `?building=${params.building}` : ""}`)}`);
  }

  const data = await getReviewFormData();

  if (data.quads.length === 0) {
    return (
      <div className="shell pb-20 pt-10 sm:pt-14">
        <div className="panel-strong max-w-3xl p-8">
          <p className="eyebrow">No Dorm Data Yet</p>
          <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-semibold">
            Seed the quad and building tables before collecting reviews.
          </h1>
          <p className="mt-4 text-[color:var(--muted)]">
            Run the SQL in `supabase/seed.sql` after the schema so students have dorms to review.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="shell pb-20 pt-10 sm:pt-14">
      <div className="max-w-3xl space-y-4">
        <p className="eyebrow">Write Review</p>
        <h1 className="section-title font-[family-name:var(--font-heading)]">
          Leave a structured dorm review.
        </h1>
        <p className="text-lg text-[color:var(--muted)]">
          Reviews are limited to one per student per building so the data stays useful for future
          residents making real housing decisions.
        </p>
      </div>

      <div className="mt-8 max-w-5xl">
        <ReviewForm
          action={submitReview}
          initialState={{ error: null, success: null }}
          quads={data.quads}
          preselectedBuildingSlug={params.building}
        />
      </div>
    </div>
  );
}
