import { LoginForm } from "@/components/login-form";
import { requestMagicLink } from "@/app/login/actions";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <div className="shell flex min-h-[calc(100vh-6rem)] items-center py-10">
      <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <p className="eyebrow">Verified Student Access</p>
          <h1 className="font-[family-name:var(--font-heading)] text-5xl font-bold tracking-tight">
            Sign in with your SBU email to leave a review.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-[color:var(--muted)]">
            Authentication is intentionally lightweight for the MVP. Students request a magic link,
            sign in with a `@stonybrook.edu` address, and can then submit one review per building.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="panel px-4 py-5">
              <p className="text-sm font-semibold">Verified identity</p>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                School-domain email only.
              </p>
            </div>
            <div className="panel px-4 py-5">
              <p className="text-sm font-semibold">Low friction</p>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                No password setup required.
              </p>
            </div>
            <div className="panel px-4 py-5">
              <p className="text-sm font-semibold">Cleaner data</p>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                One review per student per dorm.
              </p>
            </div>
          </div>
        </div>

        <LoginForm
          action={requestMagicLink}
          initialState={{ error: null, success: null }}
          next={params.next}
        />
      </div>
    </div>
  );
}
