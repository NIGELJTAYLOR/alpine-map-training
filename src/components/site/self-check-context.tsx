"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

interface SelfCheckCtx {
  pageId: string;
}

const Ctx = createContext<SelfCheckCtx | null>(null);

/**
 * Wraps a lesson page's MDX body so any `<SelfCheckCheckbox>` children
 * inside it can read the current `pageId` and bind to the progress store.
 *
 * Each checkbox keys itself by `React.useId()`, so identity is stable across
 * SSR and the client hydration pass; the provider no longer needs to assign
 * a render-time index.
 */
export function SelfCheckProvider({
  pageId,
  children,
}: {
  pageId: string;
  children: ReactNode;
}) {
  const value = useMemo<SelfCheckCtx>(() => ({ pageId }), [pageId]);
  return <Ctx value={value}>{children}</Ctx>;
}

export function useSelfCheckContext(): SelfCheckCtx | null {
  return useContext(Ctx);
}
