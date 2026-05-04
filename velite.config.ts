import { defineConfig, defineCollection, s } from "velite";

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
      learningAim: s.string().optional(),
      slug: s.path(),
      body: s.mdx(),
    })
    .transform((data) => ({
      ...data,
      slug: `/levels/${data.level}/${data.section}/${data.page}`,
    })),
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
  collections: { pages },
  mdx: {
    rehypePlugins: [],
    remarkPlugins: [],
  },
});
