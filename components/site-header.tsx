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
      <div className="navbar-surface px-4 py-3 sm:px-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.45),rgba(255,255,255,0))]"
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
              <p className="font-[family-name:var(--font-heading)] text-lg font-semibold text-white">
                RatemyRez
              </p>
              <p className="text-sm text-white/72">Stony Brook housing decisions with better data</p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/quads" className="navbar-link">
              Browse Dorms
            </Link>
            <Link href="/compare" className="navbar-link">
              Compare Dorms
            </Link>
            <Link href="/review" className="navbar-link">
              Leave a Review
            </Link>
            {userEmail ? (
              <form action={signOut} className="flex items-center gap-2">
                <span className="navbar-email">
                  {userEmail}
                </span>
                <button type="submit" className="navbar-action">
                  Sign Out
                </button>
              </form>
            ) : (
              <Link href="/login" className="navbar-action">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
