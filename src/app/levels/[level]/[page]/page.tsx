import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { PageShell } from "@/components/site/page-shell";
import { AnswerToggle } from "@/components/site/answer-toggle";
import { DiagramCard } from "@/components/site/diagram-card";
import { mdxComponents } from "@/components/mdx/components";
import { MDXContent } from "@/lib/mdx";
import {
  getPage,
  getPages,
  getNeighbours,
  getAnswerKeyForPage,
  getDiagramsForPage,
  getTemplatesForPage,
} from "@/lib/content";
import Link from "next/link";

interface PageProps {
  params: Promise<{ level: string; page: string }>;
}

export async function generateStaticParams() {
  return getPages().map((p) => ({
    level: String(p.level),
    page: p.page,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { level, page } = await params;
  const p = getPage(parseInt(level, 10), page);
  if (!p) return {};
  return { title: p.title };
}

export default async function PageRoute({ params }: PageProps) {
  const { level: levelStr, page: pageCode } = await params;
  const level = parseInt(levelStr, 10);
  if (Number.isNaN(level)) notFound();

  const page = getPage(level, pageCode);
  if (!page) notFound();

  const neighbours = getNeighbours(level, pageCode);
  const answerKey = getAnswerKeyForPage(level, pageCode);
  const diagrams = getDiagramsForPage(level, pageCode);
  const templates = getTemplatesForPage(level, pageCode);

  return (
    <>
      <SiteHeader />
      <PageShell page={page} prev={neighbours.prev} next={neighbours.next}>
        <MDXContent code={page.body} components={mdxComponents} />

        {diagrams.length > 0 ? (
          <section className="mt-10">
            <h2 className="font-sans text-xl font-semibold text-foreground">
              Schematic diagrams for this page
            </h2>
            {diagrams.map((d) => (
              <DiagramCard key={d.id} diagram={d} />
            ))}
          </section>
        ) : null}

        {templates.length > 0 ? (
          <section className="mt-10">
            <h2 className="font-sans text-xl font-semibold text-foreground">
              Templates linked to this page
            </h2>
            <ul className="mt-3 space-y-2">
              {templates.map((t) => (
                <li
                  key={t.id}
                  className="rounded-lg border border-border p-3 hover:border-primary"
                >
                  <Link
                    href={`/templates/${t.id.replace(/^template\./, "")}`}
                    className="font-sans text-sm font-medium text-foreground hover:text-primary"
                  >
                    {t.number}. {t.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {answerKey ? (
          <AnswerToggle>
            <MDXContent code={answerKey.body} components={mdxComponents} />
          </AnswerToggle>
        ) : null}
      </PageShell>
    </>
  );
}
