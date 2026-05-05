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
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-10 sm:py-14 focus:outline-none">
        <header className="mb-10">
          <p className="eyebrow eyebrow-contour">Reference</p>
          <h1 className="mt-3 font-display text-3xl font-medium tracking-[-0.015em] text-ink sm:text-[44px]">
            Templates
          </h1>
          <p className="mt-3 font-sans text-base leading-relaxed text-ink-2">
            Printable forms used during the workbook: route cards, the pressure
            log, the day log, decision-point sheets and the quiz worksheets.
            Print at A4, fill in pencil, take to the hut.
          </p>
        </header>

        <ol className="divide-y divide-rule overflow-hidden rounded-md border border-rule bg-paper-3">
          {templates.map((t) => {
            const slug = t.id.replace(/^template\./, "");
            return (
              <li key={t.id}>
                <Link
                  href={`/templates/${slug}`}
                  className="flex items-baseline gap-4 px-4 py-3.5 transition-colors hover:bg-paper-2"
                >
                  <span className="page-code w-6 shrink-0 text-right">
                    {String(t.number).padStart(2, "0")}
                  </span>
                  <span className="flex-1">
                    <span className="font-display text-base font-medium text-ink">
                      {t.title}
                    </span>
                    {t.pageRefs.length > 0 ? (
                      <span className="ml-2 page-code">
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
