"use client";

import { useEffect, useState } from "react";

type MobileHeaderVisibilityProps = {
  children: React.ReactNode;
};

export function MobileHeaderVisibility({ children }: MobileHeaderVisibilityProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    function handleScroll() {
      const currentScrollY = window.scrollY;
      const isNearTop = currentScrollY < 24;
      const isScrollingUp = currentScrollY < lastScrollY;

      setIsVisible(isNearTop || isScrollingUp);
      lastScrollY = currentScrollY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={
        isVisible
          ? "transition duration-200 ease-out motion-reduce:transition-none"
          : "pointer-events-none -translate-y-[calc(100%+1rem)] opacity-0 transition duration-200 ease-out motion-reduce:transition-none"
      }
    >
      {children}
    </div>
  );
}
