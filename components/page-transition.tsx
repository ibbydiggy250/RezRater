"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const page = mainRef.current;
    const revealItems = page
      ? Array.from(page.querySelectorAll<HTMLElement>("[data-scroll-reveal]"))
      : [];
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || revealItems.length === 0) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    revealItems.forEach((item) => item.classList.add("is-ready"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.12
      }
    );

    requestAnimationFrame(() => {
      revealItems.forEach((item) => {
        const rect = item.getBoundingClientRect();

        if (rect.top < window.innerHeight * 0.92) {
          item.classList.add("is-visible");
          return;
        }

        observer.observe(item);
      });
    });

    return () => observer.disconnect();
  }, [pathname]);

  return (
    <main ref={mainRef} key={pathname} className="page-transition flex-1">
      {children}
    </main>
  );
}
