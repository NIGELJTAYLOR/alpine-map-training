import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getAllTemplates } from "@/lib/content";

export const metadata: Metadata = { title: "Templates" };

export default function TemplatesIndex() {
  const templates = getAllTemplates();
  return (
    <main id="main-content" tabIndex={-1} className="focus:outline-none">
      {/* Header band */}
      <header className="border-b border-rule bg-paper-3 px-[22px] pb-5 pt-5 md:px-14 md:pt-10">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
          Reference
        </p>
        <h1 className="mb-1.5 mt-2 font-display text-[28px] font-extrabold leading-[1.1] tracking-[-0.025em] text-ink md:text-[40px]">
          Templates
        </h1>
        <p className="max-w-[62ch] text-[14px] leading-[1.55] text-ink-2 md:text-[15px]">
          Printable forms used during the workbook: route cards, the pressure
          log, the day log, decision-point sheets and the quiz worksheets.
          Print at A4, fill in pencil, take to the hut.
        </p>
      </header>

      <div className="px-[22px] pb-12 pt-5 md:mx-auto md:max-w-3xl md:px-14 md:pt-8">
        <ol className="flex flex-col">
          {templates.map((t) => {
            const slug = t.id.replace(/^template\./, "");
            return (
              <li key={t.id} className="border-t border-rule first:border-t-0">
                <Link
                  href={`/templates/${slug}`}
                  className="grid items-center gap-3 bg-paper-3 px-4 py-3.5 text-ink no-underline hover:bg-paper-4 md:px-5 md:py-4"
                  style={{ gridTemplateColumns: "32px 1fr auto 16px" }}
                >
                  <span className="font-mono text-[11px] font-semibold tracking-[0.08em] text-ink-3">
                    {String(t.number).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-[15px] font-bold tracking-[-0.01em] text-ink">
                      {t.title}
                    </span>
                    {t.pageRefs.length > 0 ? (
                      <span className="mt-0.5 block font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-ink-3">
                        {t.pageRefs.join(" · ")}
                      </span>
                    ) : null}
                  </span>
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-red">
                    Open
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-ink-3" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </main>
  );
}
