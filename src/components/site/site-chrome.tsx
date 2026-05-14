"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import {
  Home as HomeIcon,
  BookOpen,
  Layers,
  BarChart3,
  Settings as SettingsIcon,
  Map as MapIcon,
  FileText,
  BookA,
  ArrowLeft,
} from "lucide-react";
import { Wordmark } from "@/components/site/carta/wordmark";
import { useProgress } from "@/lib/progress/provider";
import { FLASHCARDS } from "@/data/flashcards.generated";

interface SiteChromeProps {
  children: React.ReactNode;
}

const SIDEBAR_LEVELS: ReadonlyArray<{ code: string; href: string; label: string }> = [
  { code: "L1", href: "/levels/1", label: "Map literacy" },
  { code: "L2", href: "/levels/2", label: "Terrain interpretation" },
  { code: "L3", href: "/levels/3", label: "Navigation toolkit" },
];

const SIDEBAR_REFERENCE: ReadonlyArray<{
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { href: "/flashcards", label: "Flashcards", icon: Layers },
  { href: "/diagrams", label: "Diagrams", icon: MapIcon },
  { href: "/templates", label: "Templates", icon: FileText },
  { href: "/glossary", label: "Glossary", icon: BookA },
];

const SIDEBAR_HOME: ReadonlyArray<{
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { href: "/", label: "Overview", icon: HomeIcon },
  { href: "/progress", label: "Progress", icon: BarChart3 },
];

const SIDEBAR_ACCOUNT: ReadonlyArray<{
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [{ href: "/settings", label: "Settings", icon: SettingsIcon }];

const MOBILE_TABS: ReadonlyArray<{
  href: string;
  match: (p: string) => boolean;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { href: "/", match: (p) => p === "/", label: "Home", icon: HomeIcon },
  {
    href: "/levels/1",
    match: (p) => p.startsWith("/levels"),
    label: "Workbook",
    icon: BookOpen,
  },
  {
    href: "/flashcards",
    match: (p) => p.startsWith("/flashcards"),
    label: "Cards",
    icon: Layers,
  },
  { href: "/progress", match: (p) => p === "/progress", label: "Progress", icon: BarChart3 },
];

/**
 * Glacier Lab site chrome — wraps every page.
 *
 * Mobile (< md): top wordmark strip + a sticky bottom tabbar (Home /
 * Workbook / Cards / Stats). A settings cog in the top strip exposes the
 * secondary nav.
 *
 * Desktop (>= md): a sticky left sidebar with the wordmark, three nav
 * sections (Home / Workbook / Reference / Account), and a stat tile at the
 * foot. The main content sits in the right column.
 *
 * Rendered exactly once from layout.tsx; pages should NOT mount their own
 * SiteHeader.
 */
export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname() ?? "/";
  const { hydrated, store } = useProgress();
  const trainerOn = hydrated && store.settings.trainerMode;
  const parentRoute = computeParentRoute(pathname);

  // Due-cards count: number of FSRS schedules whose due date is in the past
  // OR cards that have never been studied. Used for the Reference > Flashcards
  // badge in the sidebar and the future home stripe. Returns 0 until the
  // progress store hydrates to keep SSR / CSR markup identical.
  //
  // NB: hook calls must happen unconditionally before any early return, so
  // these `useMemo` blocks sit above the full-bleed short-circuit below.
  // React's Rules of Hooks require a stable hook order across renders, and
  // navigating in or out of /onboarding changes which branch fires.
  const dueCount = useMemo(() => {
    if (!hydrated) return 0;
    const now = Date.now();
    let due = 0;
    for (const card of FLASHCARDS) {
      const sched = store.flashcards[card.id];
      if (!sched) {
        // Never studied — counts as due
        due += 1;
        continue;
      }
      if (new Date(sched.dueDate).getTime() <= now) due += 1;
    }
    return due;
  }, [hydrated, store.flashcards]);

  // Active-pathway %: simple fraction of pages where status === "completed".
  // Used for the desktop sidebar stat tile.
  const pathwayPct = useMemo(() => {
    if (!hydrated) return 0;
    const pages = Object.values(store.pages);
    if (pages.length === 0) return 0;
    const completed = pages.filter((p) => p.status === "completed").length;
    // Total page count is fixed at 66 per the workbook spec.
    return Math.round((completed / 66) * 100);
  }, [hydrated, store.pages]);

  // Full-bleed routes — render children without chrome. Must come AFTER
  // every hook so React sees the same hook order on every render
  // (Rules of Hooks).
  if (pathname === "/onboarding") {
    return <>{children}</>;
  }

  return (
    <>
      {/* ===========================================================
          Mobile top strip: wordmark left, settings cog right.
          Sticky so it stays visible above body scroll. md:hidden
          keeps it off desktop.
          =========================================================== */}
      <header
        className="no-print sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-rule bg-paper/85 px-4 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-paper/70 md:hidden"
        aria-label="App header"
      >
        <div className="flex min-w-0 items-center gap-2">
          {parentRoute ? (
            <Link
              href={parentRoute}
              aria-label="Back"
              className="-ml-1 inline-flex h-9 w-9 items-center justify-center rounded-[2px] border border-transparent text-ink-2 hover:border-rule-2 hover:text-ink"
            >
              <ArrowLeft className="h-[18px] w-[18px]" aria-hidden />
            </Link>
          ) : null}
          <Wordmark href="/" />
          {trainerOn ? (
            <Link
              href="/settings"
              className="tag red"
              title="Trainer mode is on — tap to manage in Settings"
            >
              <span className="dot" />
              Trainer
            </Link>
          ) : null}
        </div>
        <Link
          href="/settings"
          aria-label="Settings"
          className="-mr-1 inline-flex h-9 w-9 items-center justify-center rounded-[2px] border border-transparent text-ink-3 hover:border-rule-2 hover:text-ink"
        >
          <SettingsIcon className="h-[18px] w-[18px]" />
        </Link>
      </header>

      {/* ===========================================================
          Desktop two-column shell. The sidebar is sticky to the
          viewport so the nav stays put when long pages scroll.
          The "main column" wraps page content and is offset by a
          left margin equal to the sidebar width.
          =========================================================== */}
      <div className="md:grid md:grid-cols-[244px_1fr]">
        <aside
          className="no-print hidden md:flex md:sticky md:top-0 md:h-screen md:flex-col md:gap-6 md:overflow-y-auto md:border-r md:border-rule md:bg-paper-4 md:px-5 md:py-6"
          aria-label="Primary navigation"
        >
          <div className="px-1.5">
            <Wordmark href="/" />
            {trainerOn ? (
              <Link
                href="/settings"
                className="tag red mt-3"
                title="Trainer mode is on — tap to manage in Settings"
              >
                <span className="dot" />
                Trainer mode on
              </Link>
            ) : null}
          </div>

          <SidebarSection label="Home">
            {SIDEBAR_HOME.map((item) => (
              <SidebarLink
                key={item.href}
                href={item.href}
                active={activeForRoute(pathname, item.href)}
                icon={<item.icon className="h-[14px] w-[14px]" aria-hidden />}
              >
                {item.label}
              </SidebarLink>
            ))}
          </SidebarSection>

          <SidebarSection label="Workbook">
            {SIDEBAR_LEVELS.map((lv) => {
              const active = pathname.startsWith(lv.href);
              return (
                <SidebarLink
                  key={lv.href}
                  href={lv.href}
                  active={active}
                  leadingCode={lv.code}
                >
                  {lv.label}
                </SidebarLink>
              );
            })}
          </SidebarSection>

          <SidebarSection label="Reference">
            {SIDEBAR_REFERENCE.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              const badge = item.href === "/flashcards" && hydrated && dueCount > 0 ? dueCount : null;
              return (
                <SidebarLink
                  key={item.href}
                  href={item.href}
                  active={active}
                  icon={<item.icon className="h-[14px] w-[14px]" aria-hidden />}
                  badge={badge}
                >
                  {item.label}
                </SidebarLink>
              );
            })}
          </SidebarSection>

          <SidebarSection label="Account">
            {SIDEBAR_ACCOUNT.map((item) => (
              <SidebarLink
                key={item.href}
                href={item.href}
                active={pathname === item.href}
                icon={<item.icon className="h-[14px] w-[14px]" aria-hidden />}
              >
                {item.label}
              </SidebarLink>
            ))}
          </SidebarSection>

          {/* Stat tile sits at the foot of the sidebar */}
          <div className="mt-auto rounded-[4px] border border-rule bg-paper p-3.5">
            <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-3">
              Pathway
            </div>
            <div className="mt-1.5 font-display text-[26px] font-extrabold leading-none tracking-tight">
              {pathwayPct}
              <small className="ml-0.5 text-[14px] font-semibold text-ink-3">%</small>
            </div>
            <div className="mt-0.5 font-mono text-[11px] font-medium text-ink-3">
              of 66 pages complete
            </div>
          </div>
        </aside>

        {/* Right column: the page itself. Adds bottom padding on mobile so
            the sticky tabbar doesn't overlap the last item on the page. */}
        <div className="min-w-0 pb-[86px] md:pb-0">{children}</div>
      </div>

      {/* ===========================================================
          Mobile bottom tabbar (sticky, 4 columns). md:hidden keeps
          it off desktop where the sidebar handles nav.
          =========================================================== */}
      <nav
        className="no-print fixed inset-x-0 bottom-0 z-30 grid h-[70px] grid-cols-4 border-t border-rule bg-paper-3 pb-3 pt-2.5 md:hidden"
        aria-label="Primary mobile navigation"
      >
        {MOBILE_TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={
                "flex flex-col items-center gap-1 text-[9px] font-bold uppercase tracking-[0.06em] no-underline " +
                (active ? "text-red" : "text-ink-3")
              }
            >
              <tab.icon className="h-5 w-5" aria-hidden />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

/* ---------- helpers ---------- */

function activeForRoute(pathname: string, target: string): boolean {
  if (target === "/") return pathname === "/";
  return pathname === target || pathname.startsWith(target + "/");
}

/**
 * Compute the parent route for the in-app back button.
 *
 * Strictly URL-hierarchical, not browser-history. Always predictable and
 * safe under deep-linking / refresh. Returns null for routes that have no
 * sensible parent (home, offline), which hides the back button.
 */
function computeParentRoute(pathname: string): string | null {
  // Strip a trailing slash for consistent matching.
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p === "/" || p === "/~offline") return null;

  // /levels/[level]/[page]/quiz → /levels/[level]/[page]
  let m = p.match(/^\/levels\/(\d+)\/([^/]+)\/quiz$/);
  if (m) return `/levels/${m[1]}/${m[2]}`;

  // /levels/[level]/[page]/complete → /levels/[level]
  m = p.match(/^\/levels\/(\d+)\/([^/]+)\/complete$/);
  if (m) return `/levels/${m[1]}`;

  // /levels/[level]/[page] → /levels/[level]
  m = p.match(/^\/levels\/(\d+)\/([^/]+)$/);

  // /levels/[level]/[page] → /levels/[level]
  let m1 = p.match(/^\/levels\/(\d+)\/([^/]+)$/);
  if (m1) return `/levels/${m1[1]}`;

  // /levels/[level] → /
  if (/^\/levels\/\d+$/.test(p)) return "/";

  // /flashcards/study/[deckId] → /flashcards
  if (/^\/flashcards\/study\/[^/]+$/.test(p)) return "/flashcards";

  // /templates/[slug] → /templates
  if (/^\/templates\/[^/]+$/.test(p)) return "/templates";

  // Single-segment top-level routes go to /
  if (/^\/[^/]+$/.test(p)) return "/";

  // Fall-through: trim the last path segment.
  const cut = p.lastIndexOf("/");
  if (cut <= 0) return "/";
  return p.slice(0, cut);
}

function SidebarSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 px-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-3">
        {label}
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function SidebarLink({
  href,
  active,
  icon,
  leadingCode,
  badge,
  children,
}: {
  href: string;
  active: boolean;
  icon?: React.ReactNode;
  leadingCode?: string;
  badge?: number | null;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        "group flex items-center gap-2.5 border-l-2 px-2.5 py-2 text-[13px] font-semibold no-underline " +
        (active
          ? "border-l-red bg-paper pl-2 text-ink"
          : "border-l-transparent text-ink-2 hover:bg-paper")
      }
    >
      {leadingCode ? (
        <span
          className={
            "w-[22px] font-mono text-[11px] font-semibold " +
            (active ? "text-red" : "text-ink-3")
          }
        >
          {leadingCode}
        </span>
      ) : null}
      {icon}
      <span className="flex-1">{children}</span>
      {badge ? (
        <span className="font-mono text-[10px] font-bold text-red">{badge}</span>
      ) : null}
    </Link>
  );
}
