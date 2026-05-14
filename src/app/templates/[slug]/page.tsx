import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AnswerKeyBody } from "@/components/site/answer-key-body";
import { getAllTemplates, getTemplate } from "@/lib/content";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllTemplates().map((t) => ({
    slug: t.id.replace(/^template\./, ""),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const t = getTemplate(slug);
  if (!t) return {};
  return { title: t.title };
}

export default async function TemplateRoute({ params }: PageProps) {
  const { slug } = await params;
  const template = getTemplate(slug);
  if (!template) notFound();

  return (
    <main id="main-content" tabIndex={-1} className="focus:outline-none">
      {/* Header band */}
      <header className="border-b border-rule bg-paper-3 px-[22px] pb-5 pt-5 md:px-14 md:pt-10">
        <nav className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-3">
          <Link href="/" className="no-underline hover:text-ink">
            Home
          </Link>
          <ChevronRight className="h-2 w-2" aria-hidden />
          <Link href="/templates" className="no-underline hover:text-ink">
            Templates
          </Link>
          <ChevronRight className="h-2 w-2" aria-hidden />
          <span className="text-ink">
            #{String(template.number).padStart(2, "0")}
          </span>
        </nav>
        <h1 className="mb-1.5 mt-3 font-display text-[28px] font-extrabold leading-[1.1] tracking-[-0.025em] text-ink md:text-[40px]">
          {template.title}
        </h1>
        {template.pageRefs.length > 0 ? (
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-ink-3">
            Linked to · {template.pageRefs.join(" · ")}
          </p>
        ) : null}
      </header>

      <div className="mdx-body px-[22px] pb-12 pt-5 md:mx-auto md:max-w-3xl md:px-14 md:pt-8">
        <AnswerKeyBody body={template.body} />
      </div>
    </main>
  );
}
