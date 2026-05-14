import { defineConfig, defineCollection, s } from "velite";
import remarkGfm from "remark-gfm";

const pageKind = s.enum([
  "page",
  "quiz",
  "contents",
  "reflection",
  "marking-guide",
]);

const pages = defineCollection({
  name: "Page",
  pattern: "pages/**/*.mdx",
  schema: s
    .object({
      id: s.string(),
      level: s.number().int().min(1).max(6),
      section: s.string(),
      page: s.string(),
      title: s.string(),
      kind: pageKind.default("page"),
      order: s.number().int().default(5000),
      learningAim: s.string().optional(),
      exerciseCount: s.number().int().default(0),
      selfCheckCount: s.number().int().default(0),
      sourceFile: s.string().optional(),
      // When true, the lesson MDX positions diagrams inline via <Diagram fig="..." />
      // and the page renderer suppresses the bottom-of-page "Schematic diagrams"
      // section. Default false preserves the legacy bottom rendering for any page
      // that has not yet been migrated to inline placement.
      hasInlineDiagrams: s.boolean().default(false),
      body: s.mdx(),
      // Raw markdown body, alongside the compiled MDX. Used by the
      // exercise parser (and the AI grader) which look for "### Exercise N"
      // headings — those don't survive MDX compilation as text.
      rawBody: s.raw(),
    })
    .transform((data) => ({
      ...data,
      slug: `/levels/${data.level}/${data.page}`,
    })),
});

const answerKeys = defineCollection({
  name: "AnswerKey",
  pattern: "answer-keys/**/*.mdx",
  schema: s.object({
    id: s.string(),
    pageId: s.string().optional(),
    level: s.number().int().min(1).max(6),
    // section/page are absent on file-level marking-guide records.
    section: s.string().optional(),
    page: s.string().optional(),
    title: s.string(),
    kind: pageKind.default("page"),
    sourceFile: s.string().optional(),
    body: s.mdx(),
    // Raw markdown body — used by the AI grader to extract per-exercise
    // model answers via the same "### Exercise N" heading convention.
    rawBody: s.raw(),
  }),
});

const trainerNotes = defineCollection({
  name: "TrainerNote",
  pattern: "trainer-notes/**/*.mdx",
  schema: s.object({
    id: s.string(),
    level: s.number().int().min(1).max(6),
    title: s.string(),
    sections: s.array(s.string()).default([]),
    sourceFile: s.string().optional(),
    body: s.mdx(),
  }),
});

const diagrams = defineCollection({
  name: "Diagram",
  pattern: "diagrams/**/*.mdx",
  schema: s.object({
    id: s.string(),
    level: s.number().int().min(1).max(6),
    number: s.number().int(),
    sub: s.string().default(""),
    title: s.string(),
    svgUrl: s.string(),
    pageRefs: s.array(s.string()).default([]),
    whenToUse: s.string().optional(),
    sourceFile: s.string().optional(),
    body: s.mdx(),
  }),
});

const templates = defineCollection({
  name: "Template",
  pattern: "templates/*.mdx",
  schema: s.object({
    id: s.string(),
    number: s.number().int(),
    title: s.string(),
    pageRefs: s.array(s.string()).default([]),
    sourceFile: s.string().optional(),
    body: s.mdx(),
  }),
});

const questionType = s.enum(["numeric", "mc", "self-mark", "practical"]);

const numericInput = s.object({
  label: s.string(),
  expected: s.number(),
  tolerance: s.number().default(0),
});

const baseQuestion = s.object({
  id: s.string(),
  title: s.string(),
  prompt: s.string(),
  type: questionType,
  inputs: s.array(numericInput).optional(),
  options: s.array(s.string()).optional(),
  correct: s.union([s.number(), s.array(s.number())]).optional(),
  modelAnswer: s.string().optional(),
  expectations: s.string().optional(),
  explanation: s.string().optional(),
  skillArea: s.string(),
  pageRef: s.string(),
});

const skillArea = s.object({
  id: s.string(),
  label: s.string(),
});

const quizzes = defineCollection({
  name: "Quiz",
  pattern: "quizzes/*.json",
  schema: s.object({
    id: s.string(),
    level: s.number().int().min(1).max(6),
    page: s.string(),
    title: s.string(),
    intro: s.string(),
    skillAreas: s.array(skillArea),
    questions: s.array(baseQuestion),
  }),
});

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:6].[ext]",
    clean: true,
  },
  collections: { pages, answerKeys, trainerNotes, diagrams, templates, quizzes },
  mdx: {
    rehypePlugins: [],
    remarkPlugins: [remarkGfm],
  },
});
