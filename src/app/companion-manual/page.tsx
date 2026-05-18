import type { Metadata } from "next";
import { BookOpen, Download, ExternalLink, Wifi, WifiOff } from "lucide-react";
import { BRAND } from "@/config/brand";

export const metadata: Metadata = {
  title: "Companion manual",
  description:
    "The printable Alpine Map Training workbook. Open in a new tab to read in your browser, or download as a PDF for offline reference.",
};

/**
 * Companion manual landing page.
 *
 *   Provides two routes into the static workbook:
 *     - Open the HTML edition in a new tab (`/companion-manual/index.html`).
 *       Works offline once the service worker has cached the assets.
 *     - Download the PDF edition for archival / print
 *       (`/companion-manual/Alpine_Map_Training_Companion_Manual.pdf`).
 *
 *   The HTML version is the same content as the in-app workbook but laid
 *   out as a single, scrollable, printable document. It is the preferred
 *   format for studying away from the interactive app.
 */
export default function CompanionManualPage() {
  return (
    <main id="main-content" tabIndex={-1} className="focus:outline-none">
      {/* ===== Header band ===== */}
      <header className="border-b border-rule bg-paper-3 px-[22px] pb-5 pt-5 md:px-14 md:pt-10">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
          Companion resource
        </p>
        <h1 className="mb-1.5 mt-2 font-display text-[28px] font-extrabold leading-[1.1] tracking-[-0.025em] text-ink md:text-[40px]">
          Companion manual
        </h1>
        <p className="max-w-[62ch] text-[14px] leading-[1.55] text-ink-2 md:text-[15px]">
          The full Alpine Map Training workbook in a single, printable
          document. Same content as the interactive workbook, formatted for
          reading end to end, marking up by hand, or keeping on the shelf
          as a permanent reference.
        </p>
      </header>

      {/* ===== Hero photo strip ===== */}
      <div
        className="photo-slot has-img"
        style={{
          height: 220,
          backgroundImage: "url(/photos/lone-skier-navy.jpg)",
          backgroundPosition: "center center",
          backgroundSize: "cover",
        }}
        aria-label="A skier studying terrain"
      />

      <div className="px-[22px] pb-12 pt-6 md:mx-auto md:max-w-3xl md:px-14 md:pt-10">
        {/* ===== Two-up action cards ===== */}
        <section className="mb-10">
          <h2 className="mb-4 font-display text-[20px] font-extrabold tracking-[-0.015em] text-ink md:text-[22px]">
            Choose a format
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Open in browser */}
            <a
              href="/companion-manual/index.html"
              target="_blank"
              // Intentionally NOT rel="noopener" — the companion-manual
              // pages need window.opener so their "Back to app" button
              // can focus this tab. The workbook is same-origin static
              // HTML we control, so the usual rationale for noopener
              // does not apply.
              rel="opener"
              className="group flex flex-col gap-3 border border-rule bg-paper-3 p-5 transition-colors hover:border-ink hover:bg-paper-2"
            >
              <div className="flex items-center gap-2">
                <BookOpen
                  className="h-[20px] w-[20px] text-red"
                  aria-hidden
                />
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-red">
                  Read in browser
                </p>
              </div>
              <h3 className="font-display text-[18px] font-bold tracking-[-0.01em] text-ink md:text-[20px]">
                Open in new tab
              </h3>
              <p className="text-[13px] leading-[1.55] text-ink-2 md:text-[14px]">
                The HTML edition. Opens in a new tab so the app stays
                where it is. Navigate by table of contents, zoom into
                diagrams, or use your browser&rsquo;s find-on-page to jump
                to any term.
              </p>
              <span className="mt-auto inline-flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-2 group-hover:text-ink">
                Open <ExternalLink className="h-[12px] w-[12px]" aria-hidden />
              </span>
            </a>

            {/* Download PDF */}
            <a
              href="/companion-manual/Alpine_Map_Training_Companion_Manual.pdf"
              download="Alpine_Map_Training_Companion_Manual.pdf"
              className="group flex flex-col gap-3 border border-rule bg-paper-3 p-5 transition-colors hover:border-ink hover:bg-paper-2"
            >
              <div className="flex items-center gap-2">
                <Download
                  className="h-[20px] w-[20px] text-red"
                  aria-hidden
                />
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-red">
                  Download PDF
                </p>
              </div>
              <h3 className="font-display text-[18px] font-bold tracking-[-0.01em] text-ink md:text-[20px]">
                Download for offline / print
              </h3>
              <p className="text-[13px] leading-[1.55] text-ink-2 md:text-[14px]">
                The PDF edition (about 34&nbsp;MB). Saves to your device
                so you can read it on any PDF reader, share it with a
                trainer, or print it. Pinch-zoomable on phones and
                tablets.
              </p>
              <span className="mt-auto inline-flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-2 group-hover:text-ink">
                Download <Download className="h-[12px] w-[12px]" aria-hidden />
              </span>
            </a>
          </div>
        </section>

        {/* ===== Online / offline note ===== */}
        <section className="mb-10 border-l-2 border-rule pl-4 md:pl-5">
          <h2 className="mb-3 font-display text-[18px] font-extrabold tracking-[-0.015em] text-ink md:text-[20px]">
            Online and offline
          </h2>
          <ul className="space-y-3 text-[14px] leading-[1.6] text-ink-2 md:text-[15px]">
            <li className="flex items-start gap-2.5">
              <Wifi
                className="mt-[3px] h-[16px] w-[16px] shrink-0 text-ink-3"
                aria-hidden
              />
              <span>
                <strong className="text-ink">Online.</strong> Both formats
                open instantly. The HTML version is the lightest and the
                quickest to start reading.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <WifiOff
                className="mt-[3px] h-[16px] w-[16px] shrink-0 text-ink-3"
                aria-hidden
              />
              <span>
                <strong className="text-ink">Offline.</strong> Once
                you&rsquo;ve opened the HTML edition once while online,
                the service worker caches the pages and figures so it
                will continue to open in a new tab when offline. If you
                want absolute certainty of offline access (no network at
                all, fresh device, mountain hut), download the PDF in
                advance and read it from your PDF reader.
              </span>
            </li>
          </ul>
        </section>

        {/* ===== About the manual ===== */}
        <section className="mb-2">
          <h2 className="mb-3 font-display text-[18px] font-extrabold tracking-[-0.015em] text-ink md:text-[20px]">
            About this edition
          </h2>
          <p className="max-w-[62ch] text-[14px] leading-[1.6] text-ink-2 md:text-[15px]">
            The companion manual mirrors the structure of the interactive
            workbook: three levels covering map literacy, terrain
            interpretation, and the navigation toolkit, followed by
            answer keys and the source maps used throughout the course.
            It is intended as a parallel reference, not a replacement for
            the app&rsquo;s grading and progress-tracking. Type your
            answers into the workbook; use the manual to read ahead,
            review, or study away from the screen.
          </p>
          <p className="mt-3 max-w-[62ch] text-[13px] leading-[1.6] text-ink-3 md:text-[14px]">
            {BRAND.productDescription} Spotted something that needs
            fixing? Send a note to{" "}
            <a
              href={`mailto:${BRAND.authorEmail}?subject=${encodeURIComponent(
                BRAND.productName + " companion manual — feedback",
              )}`}
              className="text-red hover:text-ink"
            >
              {BRAND.authorEmail}
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
