import type { Metadata } from "next";
import { Space_Grotesk, Source_Serif_4 } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { NavigationProgress } from "@/components/navigation-progress";
import { PageTransition } from "@/components/page-transition";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/data";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading"
});

const bodyFont = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "RatemyRez",
  description:
    "Browse Stony Brook residence halls by quad, compare buildings, and leave structured dorm reviews with RatemyRez."
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  let userEmail: string | null = null;

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
  }

  return (
    <html lang="en">
      <body
        className={`${headingFont.variable} ${bodyFont.variable} font-[family-name:var(--font-body)] text-[color:var(--foreground)] antialiased`}
      >
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader userEmail={userEmail} />
          <PageTransition>{children}</PageTransition>
          <footer className="shell py-8 text-center text-sm leading-6 text-[color:var(--muted)]">
            <p>&copy; 2026 Ibrahim Quaizar. All rights reserved.</p>
            <p>
              RateMyRez is a student-made project and is not affiliated with
              Stony Brook University.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
