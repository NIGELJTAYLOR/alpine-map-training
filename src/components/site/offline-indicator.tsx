"use client";

import { useEffect, useState } from "react";

/**
 * Tiny "Offline" pill that fades in at the top of the screen when the
 * browser reports no network. Disappears when connectivity returns.
 */
export function OfflineIndicator() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="no-print fixed inset-x-0 top-0 z-50 mx-auto w-fit rounded-b-md bg-destructive px-3 py-1 font-sans text-xs font-medium text-white shadow"
    >
      Offline — showing cached pages
    </div>
  );
}
