import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
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
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-10 sm:py-14 focus:outline-none">
        <nav className="eyebrow">
          <Link href="/templates" className="hover:text-ink">
            Templates
          </Link>
          <span className="mx-2 text-rule">/</span>
          <span className="text-ink">#{String(template.number).padStart(2, "0")}</span>
        </nav>
        <header className="mt-5 mb-8">
          <h1 className="font-display text-3xl font-medium tracking-[-0.015em] text-ink sm:text-[44px]">
            {template.title}
          </h1>
          {template.pageRefs.length > 0 ? (
            <p className="mt-2 page-code">
              Linked to · {template.pageRefs.join(" · ")}
            </p>
          ) : null}
        </header>

        <div className="mdx-body">
          <AnswerKeyBody body={template.body} />
        </div>
      </main>
    </>
  );
}
