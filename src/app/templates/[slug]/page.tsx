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
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-8 sm:py-10 focus:outline-none">
        <nav className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Link href="/templates" className="hover:text-foreground">
            Templates
          </Link>
          <span className="mx-2 opacity-50">/</span>
          <span>#{template.number}</span>
        </nav>
        <header className="mt-4 mb-6">
          <h1 className="font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {template.title}
          </h1>
          {template.pageRefs.length > 0 ? (
            <p className="mt-2 font-sans text-sm text-muted-foreground">
              Linked to: {template.pageRefs.join(", ")}
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
