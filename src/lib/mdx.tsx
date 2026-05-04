import * as runtime from "react/jsx-runtime";
import type { ComponentType } from "react";

// MDX accepts a loose component map keyed by HTML element name. We avoid
// React.ComponentType<unknown> because that pins prop types too tightly.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = ComponentType<any>;
export type MDXComponents = Record<string, AnyComponent>;

interface MDXContentProps {
  code: string;
  components?: MDXComponents;
}

/**
 * Renders MDX compiled by Velite. The `code` is a self-contained function body
 * that returns a module exporting `default` (the React component).
 */
export function MDXContent({ code, components }: MDXContentProps) {
  const Component = useMDX(code);
  return <Component components={components} />;
}

function useMDX(code: string) {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  const fn = new Function(code);
  const mod = fn({ ...runtime });
  return (mod.default ?? (() => null)) as ComponentType<{
    components?: MDXComponents;
  }>;
}
