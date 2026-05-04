import { defineConfig, defineCollection, s } from "velite";

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
      body: s.mdx(),
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

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:6].[ext]",
    clean: true,
  },
  collections: { pages, answerKeys, trainerNotes, diagrams, templates },
  mdx: {
    rehypePlugins: [],
    remarkPlugins: [],
  },
});
