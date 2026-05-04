import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { getAllTemplates } from "@/lib/content";

export const metadata: Metadata = { title: "Templates" };

export default function TemplatesIndex() {
  const templates = getAllTemplates();
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-8 sm:py-10 focus:outline-none">
        <header className="mb-8">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Reference
          </p>
          <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Templates
          </h1>
          <p className="mt-3 font-serif text-base leading-relaxed text-muted-foreground">
            Printable forms used during the workbook: route cards, the pressure
            log, the day log, decision-point sheets and the quiz worksheets.
            Interactive versions arrive in later sessions.
          </p>
        </header>

        <ol className="space-y-2">
          {templates.map((t) => {
            const slug = t.id.replace(/^template\./, "");
            return (
              <li
                key={t.id}
                className="rounded-lg border border-border transition-colors hover:border-primary"
              >
                <Link
                  href={`/templates/${slug}`}
                  className="flex items-baseline gap-3 p-3"
                >
                  <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground">
                    {t.number}
                  </span>
                  <span className="flex-1">
                    <span className="font-sans text-base text-foreground">
                      {t.title}
                    </span>
                    {t.pageRefs.length > 0 ? (
                      <span className="ml-2 font-sans text-xs text-muted-foreground">
                        ({t.pageRefs.join(", ")})
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </main>
    </>
  );
}
