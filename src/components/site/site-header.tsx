"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  matchPrefix?: string;
}

const NAV: NavItem[] = [
  { href: "/levels/1", label: "Level 1", matchPrefix: "/levels/1" },
  { href: "/levels/2", label: "Level 2", matchPrefix: "/levels/2" },
  { href: "/levels/3", label: "Level 3", matchPrefix: "/levels/3" },
  { href: "/diagrams", label: "Diagrams", matchPrefix: "/diagrams" },
  { href: "/templates", label: "Templates", matchPrefix: "/templates" },
];

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="font-sans text-sm font-semibold tracking-tight text-foreground whitespace-nowrap"
        >
          Alpine Map Training
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto font-sans text-sm">
          {NAV.map((item) => {
            const active = item.matchPrefix
              ? pathname?.startsWith(item.matchPrefix)
              : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "whitespace-nowrap rounded-md px-2.5 py-1 transition-colors " +
                  (active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground")
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
