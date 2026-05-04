import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-background px-6 py-16">
      <main className="flex w-full max-w-2xl flex-col gap-8">
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
            This is the scaffolded build (Session 1). Workbook content is migrated
            and made interactive in subsequent sessions.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button size="lg" disabled>
            Start Level 1 (coming Session 2)
          </Button>
          <Button size="lg" variant="outline" disabled>
            Trainer mode (coming Session 7)
          </Button>
        </div>

        <ul className="grid gap-2 font-sans text-sm text-muted-foreground sm:grid-cols-2">
          <li>✓ Next.js 16 App Router</li>
          <li>✓ Tailwind CSS v4 + shadcn/ui</li>
          <li>✓ Velite MDX content pipeline</li>
          <li>✓ Serwist PWA (installable)</li>
          <li>✓ Mountain palette (slate / contour brown)</li>
          <li>✓ Inter + Source Serif Pro</li>
        </ul>
      </main>
    </div>
  );
}
