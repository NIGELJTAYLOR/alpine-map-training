import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { PageShell } from "@/components/site/page-shell";
import { AnswerToggle } from "@/components/site/answer-toggle";
import { mdxComponents } from "@/components/mdx/components";
import { MDXContent } from "@/lib/mdx";
import {
  getPage,
  getPages,
  getNeighbours,
  getAnswerKeyForPage,
} from "@/lib/content";

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

  return (
    <>
      <SiteHeader />
      <PageShell page={page} prev={neighbours.prev} next={neighbours.next}>
        <MDXContent code={page.body} components={mdxComponents} />

        {answerKey ? (
          <AnswerToggle>
            <MDXContent code={answerKey.body} components={mdxComponents} />
          </AnswerToggle>
        ) : null}
      </PageShell>
    </>
  );
}
