import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="font-sans text-sm font-semibold tracking-tight text-foreground"
        >
          Alpine Map Training
        </Link>
        <nav className="flex items-center gap-4 font-sans text-sm text-muted-foreground">
          <Link href="/levels/1" className="hover:text-foreground">
            Level 1
          </Link>
          <span aria-hidden className="opacity-50">
            Level 2 (soon)
          </span>
          <span aria-hidden className="opacity-50">
            Level 3 (soon)
          </span>
        </nav>
      </div>
    </header>
  );
}
