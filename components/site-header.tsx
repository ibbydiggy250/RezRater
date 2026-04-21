import Link from "next/link";
import Image from "next/image";
import { signOut } from "@/app/login/actions";
import siteLogo from "@/logos/image.png";

type SiteHeaderProps = {
  userEmail: string | null;
};

export function SiteHeader({ userEmail }: SiteHeaderProps) {
  return (
    <header className="shell sticky top-0 z-40 pt-4">
      <div className="panel-strong relative overflow-hidden border-white/50 px-4 py-3 sm:px-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(166,34,49,0.1),rgba(22,61,107,0.4),rgba(166,34,49,0.1))]"
        />
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-14 items-center justify-center rounded-2xl border border-white/70 bg-white/90 shadow-[0_10px_26px_rgba(22,61,107,0.12)]">
              <Image
                src={siteLogo}
                alt="SBU Seawolves logo"
                className="h-10 w-12 object-contain"
                priority
              />
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
                <span className="hidden rounded-full border border-[color:rgba(22,61,107,0.08)] bg-[color:var(--brand-soft)] px-4 py-2 text-sm font-medium text-[color:var(--brand-deep)] md:inline-flex">
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
      </div>
    </header>
  );
}
