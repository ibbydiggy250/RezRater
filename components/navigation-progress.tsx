"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export const navigationProgressEvent = "ratemyrez:navigation-start";

function isInternalNavigationLink(element: Element | null) {
  const link = element?.closest("a");

  if (!link || !link.href || link.target || link.hasAttribute("download")) {
    return false;
  }

  const url = new URL(link.href);
  return url.origin === window.location.origin && url.href !== window.location.href;
}

export function startNavigationProgress() {
  window.dispatchEvent(new Event(navigationProgressEvent));
}

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const finishTimer = useRef<number | null>(null);

  useEffect(() => {
    function start() {
      if (finishTimer.current) {
        window.clearTimeout(finishTimer.current);
      }

      setIsLoading(true);
    }

    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      if (isInternalNavigationLink(event.target as Element | null)) {
        start();
      }
    }

    window.addEventListener(navigationProgressEvent, start);
    document.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener(navigationProgressEvent, start);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    finishTimer.current = window.setTimeout(() => {
      setIsLoading(false);
    }, 220);

    return () => {
      if (finishTimer.current) {
        window.clearTimeout(finishTimer.current);
      }
    };
  }, [pathname, searchParams]);

  return (
    <div
      aria-hidden="true"
      className={`navigation-progress ${isLoading ? "is-loading" : ""}`}
    />
  );
}
