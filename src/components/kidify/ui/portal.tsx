"use client";

import { createPortal } from "react-dom";
import { useSyncExternalStore, type ReactNode } from "react";

/** Returns true only on the client (after hydration), SSR-safe. */
function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/**
 * Renders children into a portal at document.body, escaping any parent
 * stacking contexts (e.g. so modals aren't trapped below fixed siblings
 * like the bottom nav or floating bear).
 */
export function Portal({ children }: { children: ReactNode }) {
  const isClient = useIsClient();
  if (!isClient) return null;
  return createPortal(children, document.body);
}
