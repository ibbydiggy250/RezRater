import Link from "next/link";
import Image from "next/image";
import { signOut } from "@/app/login/actions";
import siteLogo from "@/logos/ChatGPT Image Apr 25, 2026, 12_22_33 AM.png";

type SiteHeaderProps = {
  userEmail: string | null;
};

function getUserInitials(email: string | null) {
  if (!email) {
    return null;
  }

  const localPart = email.split("@")[0] ?? "";
  const nameParts = localPart
    .split(".")
    .map((part) => part.trim())
    .filter(Boolean);

  if (nameParts.length >= 2) {
    return `${nameParts[0][0] ?? ""}${nameParts[1][0] ?? ""}`.toUpperCase();
  }

  return localPart.slice(0, 2).toUpperCase() || null;
}

export function SiteHeader({ userEmail }: SiteHeaderProps) {
  const userInitials = getUserInitials(userEmail);

  return (
    <header className="shell sticky top-0 z-40 pt-4">
      <div className="navbar-surface px-4 py-3 sm:px-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.45),rgba(255,255,255,0))]"
        />
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-14 items-center justify-center rounded-2xl border border-white/70 bg-white/90 shadow-[0_10px_26px_rgba(22,61,107,0.12)]">
              <Image
                src={siteLogo}
                alt="SBU Seawolves logo"
                className="h-10 w-12 object-contain"
                priority
              />
            </div>
            <div className="min-w-0">
              <p className="truncate font-[family-name:var(--font-heading)] text-lg font-semibold text-white">
                RatemyRez
              </p>
              <p className="hidden truncate text-sm text-white/72 xl:block">
                Stony Brook housing decisions with better data
              </p>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
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
                  {userInitials}
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
