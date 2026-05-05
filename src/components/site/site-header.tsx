"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProgress } from "@/lib/progress/provider";
import { Wordmark } from "@/components/site/carta/wordmark";

interface NavItem {
  href: string;
  label: string;
  matchPrefix?: string;
}

const NAV: NavItem[] = [
  { href: "/levels/1", label: "L1", matchPrefix: "/levels/1" },
  { href: "/levels/2", label: "L2", matchPrefix: "/levels/2" },
  { href: "/levels/3", label: "L3", matchPrefix: "/levels/3" },
  { href: "/flashcards", label: "Cards", matchPrefix: "/flashcards" },
  { href: "/diagrams", label: "Diagrams", matchPrefix: "/diagrams" },
  { href: "/templates", label: "Templates", matchPrefix: "/templates" },
  { href: "/glossary", label: "Glossary", matchPrefix: "/glossary" },
  { href: "/progress", label: "Progress", matchPrefix: "/progress" },
  { href: "/settings", label: "Settings", matchPrefix: "/settings" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { hydrated, store } = useProgress();
  const trainerOn = hydrated && store.settings.trainerMode;
  return (
    <header className="no-print sticky top-0 z-30 border-b border-rule bg-paper/85 backdrop-blur supports-[backdrop-filter]:bg-paper/70">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Wordmark href="/" />
          {trainerOn ? (
            <Link
              href="/settings"
              className="pill pill-contour"
              title="Trainer mode is on — tap to manage in Settings"
            >
              Trainer
            </Link>
          ) : null}
        </div>
        <nav className="flex items-center gap-0.5 overflow-x-auto">
          {NAV.map((item) => {
            const active = item.matchPrefix
              ? pathname?.startsWith(item.matchPrefix)
              : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  "whitespace-nowrap rounded-md px-2.5 py-1.5 font-mono text-xs uppercase tracking-[0.14em] transition-colors " +
                  (active
                    ? "bg-paper-2 text-ink"
                    : "text-ink-3 hover:bg-paper-2 hover:text-ink")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
