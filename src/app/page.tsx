import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/site-header";
import { getPages } from "@/lib/content";

export default function Home() {
  const l1 = getPages(1);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12 sm:py-16">
        <header className="flex flex-col gap-3">
          <p className="font-sans text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Alpine Map Training
          </p>
          <h1 className="font-sans text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Levels 1 to 3 — digital companion
          </h1>
        </header>

        <div className="space-y-4 font-serif text-lg leading-relaxed text-foreground">
          <p>
            A Progressive Web App for the Alpine Map Training workbook,
            supporting BASI Alpine Level 4 ISTD candidates and their trainers.
          </p>
          <p>
            Level 1 ({l1.length} pages) is now navigable. Levels 2 and 3 land in
            Session 3. Interactive quizzes arrive in Session 4 and trainer mode in Session 7.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/levels/1" className={buttonVariants({ size: "lg" })}>
            Start Level 1
          </Link>
          <Button size="lg" variant="outline" disabled>
            Trainer mode (Session 7)
          </Button>
        </div>

        <ul className="grid gap-2 font-sans text-sm text-muted-foreground sm:grid-cols-2">
          <li>✓ Next.js 16 App Router</li>
          <li>✓ Tailwind v4 + shadcn/ui</li>
          <li>✓ Velite MDX content pipeline</li>
          <li>✓ {l1.length} Level 1 pages ingested</li>
          <li>✓ Mountain palette + serif body</li>
          <li>· Service worker → Session 6</li>
        </ul>
      </main>
    </>
  );
}
