"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export const navigationProgressEvent = "RateMyRez:navigation-start";

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
  const [status, setStatus] = useState<"idle" | "loading" | "finishing">("idle");
  const finishTimer = useRef<number | null>(null);
  const startedAt = useRef(0);
  const statusRef = useRef(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    function start() {
      if (finishTimer.current) {
        window.clearTimeout(finishTimer.current);
      }

      startedAt.current = performance.now();
      setStatus("loading");
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
    document.addEventListener("click", handleClick, true);

    return () => {
      window.removeEventListener(navigationProgressEvent, start);
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  useEffect(() => {
    if (statusRef.current !== "loading") {
      return;
    }

    const elapsed = performance.now() - startedAt.current;
    const delay = Math.max(420 - elapsed, 120);

    finishTimer.current = window.setTimeout(() => {
      setStatus("finishing");

      finishTimer.current = window.setTimeout(() => {
        setStatus("idle");
      }, 240);
    }, delay);

    return () => {
      if (finishTimer.current) {
        window.clearTimeout(finishTimer.current);
      }
    };
  }, [pathname, searchParams]);

  return (
    <div
      aria-hidden="true"
      className={`navigation-progress ${status !== "idle" ? "is-loading" : ""} ${
        status === "finishing" ? "is-finishing" : ""
      }`}
    />
  );
}
