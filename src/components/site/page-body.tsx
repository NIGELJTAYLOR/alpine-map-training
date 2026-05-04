"use client";

import { MDXContent } from "@/lib/mdx";
import { mdxComponents } from "@/components/mdx/components";
import { SelfCheckProvider } from "./self-check-context";

interface PageBodyProps {
  pageId: string;
  body: string;
}

/**
 * Renders a Velite-compiled MDX body inside a SelfCheckProvider, so any
 * `<input type="checkbox">` rendered from `- [ ]` source lines binds to
 * the per-page progress store.
 */
export function PageBody({ pageId, body }: PageBodyProps) {
  return (
    <SelfCheckProvider pageId={pageId}>
      <MDXContent code={body} components={mdxComponents} />
    </SelfCheckProvider>
  );
}
