"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownStringProps {
  text: string;
  className?: string;
}

export function MarkdownString({ text, className }: MarkdownStringProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: (props) => (
            <p {...props} className="font-serif text-base leading-relaxed text-foreground my-2" />
          ),
          ul: (props) => (
            <ul {...props} className="font-serif text-base leading-relaxed my-2 ml-6 list-disc space-y-1" />
          ),
          ol: (props) => (
            <ol {...props} className="font-serif text-base leading-relaxed my-2 ml-6 list-decimal space-y-1" />
          ),
          table: (props) => (
            <div className="my-3 overflow-x-auto">
              <table {...props} className="w-full border-collapse text-left text-sm" />
            </div>
          ),
          th: (props) => (
            <th {...props} className="border border-border bg-muted px-3 py-2 font-sans font-medium" />
          ),
          td: (props) => (
            <td {...props} className="border border-border px-3 py-2 align-top" />
          ),
          strong: (props) => <strong {...props} className="font-semibold text-foreground" />,
          code: (props) => (
            <code {...props} className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm" />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
