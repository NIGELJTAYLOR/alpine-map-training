"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";

interface SelfCheckCtx {
  pageId: string;
  // mutable counter so each <SelfCheckCheckbox> gets a stable, in-DOM-order index
  nextIndex: () => number;
  totalRef: React.RefObject<number>;
}

const Ctx = createContext<SelfCheckCtx | null>(null);

export function SelfCheckProvider({
  pageId,
  children,
}: {
  pageId: string;
  children: ReactNode;
}) {
  // Each render starts the counter fresh. React calls the children render in
  // top-to-bottom DOM order, so checkboxes get indices that match their visual
  // position.
  const counterRef = useRef(0);
  const totalRef = useRef(0);
  counterRef.current = 0;
  totalRef.current = 0;
  const value: SelfCheckCtx = {
    pageId,
    nextIndex: () => {
      const n = counterRef.current;
      counterRef.current += 1;
      totalRef.current = counterRef.current;
      return n;
    },
    totalRef,
  };
  return <Ctx value={value}>{children}</Ctx>;
}

export function useSelfCheckContext(): SelfCheckCtx | null {
  return useContext(Ctx);
}
