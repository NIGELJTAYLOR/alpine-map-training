import { Suspense } from "react";
import { HomeView } from "@/components/site/home/home-view";

export default function Home() {
  return (
    <main id="main-content" tabIndex={-1} className="focus:outline-none">
      <Suspense fallback={<HomeViewFallback />}>
        <HomeView />
      </Suspense>
    </main>
  );
}

/* Static fallback rendered during the (very brief) suspend window before
   the progress store hydrates client-side. Keeps the page's overall
   visual rhythm so there's no layout shift. */
function HomeViewFallback() {
  return (
    <section className="relative overflow-hidden border-b border-rule bg-paper">
      <div className="grid-bg" />
      <div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <p className="eyebrow">Alpine Map Training</p>
        <h1 className="mt-4 font-display text-[36px] font-extrabold leading-[1.02] tracking-[-0.028em] sm:text-[64px]">
          Read the mountain
          <br />
          before you <span className="text-red">ski</span> it.
        </h1>
      </div>
    </section>
  );
}
