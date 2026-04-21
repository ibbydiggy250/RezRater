import Link from "next/link";
import { signOut } from "@/app/login/actions";

type SiteHeaderProps = {
  userEmail: string | null;
};

export function SiteHeader({ userEmail }: SiteHeaderProps) {
  return (
    <header className="shell sticky top-0 z-40 pt-5">
      <div className="panel-strong flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--brand-deep)] text-lg font-bold text-white">
            SB
          </div>
          <div>
            <p className="font-[family-name:var(--font-heading)] text-lg font-semibold">
              SBU Dorm Review App
            </p>
            <p className="text-sm text-[color:var(--muted)]">Housing decisions with better data</p>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/quads" className="btn-ghost">
            Browse Dorms
          </Link>
          <Link href="/review" className="btn-ghost">
            Leave a Review
          </Link>
          {userEmail ? (
            <form action={signOut} className="flex items-center gap-2">
              <span className="hidden rounded-full bg-[color:var(--brand-soft)] px-4 py-2 text-sm font-medium text-[color:var(--brand-deep)] md:inline-flex">
                {userEmail}
              </span>
              <button type="submit" className="btn-secondary px-4 py-2">
                Sign Out
              </button>
            </form>
          ) : (
            <Link href="/login" className="btn-primary px-4 py-2">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
