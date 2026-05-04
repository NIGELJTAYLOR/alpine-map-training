import type { ComponentPropsWithoutRef } from "react";

/** Replace native HTML elements emitted by MDX with styled versions. */
export const mdxComponents = {
  h1: (props: ComponentPropsWithoutRef<"h1">) => (
    <h1
      {...props}
      className="font-sans text-3xl font-semibold tracking-tight text-foreground mt-10 mb-4"
    />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      {...props}
      className="font-sans text-2xl font-semibold tracking-tight text-foreground mt-10 mb-3"
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => {
    const text = String(props.children ?? "");
    const variant = h3Variant(text);
    return (
      <h3
        {...props}
        className={`font-sans text-lg font-semibold tracking-tight ${variant} mt-8 mb-2`}
        data-h3-variant={variant ? "tagged" : undefined}
      />
    );
  },
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p {...props} className="font-serif text-base leading-relaxed text-foreground my-3" />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul {...props} className="font-serif text-base leading-relaxed text-foreground my-3 ml-6 list-disc space-y-1" />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol {...props} className="font-serif text-base leading-relaxed text-foreground my-3 ml-6 list-decimal space-y-1" />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => <li {...props} className="pl-1" />,
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="my-4 overflow-x-auto">
      <table {...props} className="w-full border-collapse text-left text-sm" />
    </div>
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th
      {...props}
      className="border border-border bg-muted px-3 py-2 font-sans font-medium text-foreground"
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td {...props} className="border border-border px-3 py-2 align-top" />
  ),
  hr: (props: ComponentPropsWithoutRef<"hr">) => (
    <hr {...props} className="my-8 border-border" />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code {...props} className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm" />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      {...props}
      className="my-4 border-l-4 border-border pl-4 italic text-muted-foreground"
    />
  ),
};

/** Tag certain H3s with a colour cue based on their text content. */
function h3Variant(text: string): string {
  if (/^learning aim$/i.test(text)) return "text-primary";
  if (/^worked example$/i.test(text)) return "text-contour";
  if (/^exercise\b/i.test(text)) return "text-foreground";
  if (/^self[- ]check$/i.test(text)) return "text-success";
  if (/^reflection$/i.test(text)) return "text-muted-foreground";
  if (/^questions?$/i.test(text)) return "text-foreground";
  return "text-foreground";
}
