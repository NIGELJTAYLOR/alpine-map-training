/**
 * Brand & course configuration.
 *
 * This is the single source of truth for customer-specific strings. The
 * intent (framework-mode) is that swapping this file is the only thing
 * needed to turn the same shell into a different customer's course.
 *
 * Today, only a subset of the codebase reads from this file; older
 * inline strings will migrate here over time. Until then, treat this as
 * the canonical location for new customer-facing copy.
 */

import pkg from "../../package.json";

export const BRAND = {
  /** Short product name shown in the wordmark, headers, page titles. */
  productName: "Alpine Map Training",

  /** Mono-caps byline under the wordmark. */
  byline: "By PerformOS",

  /** Long-form description used in metadata, About, and exports. */
  productDescription:
    "A digital learning companion built to help you reach the standard required for the BASI Alpine Level 4 ISTD and the ISIA Card in the art of map reading.",

  /** Course identity for the metadata strip on the home page. */
  courseTagline: "BASI Alpine L4 · ISTD navigation · Glacier Lab",

  /** Plain-English subject used in AI grading prompts. */
  subject: "alpine ski navigation for BASI Alpine Level 4 ISTD",

  /** Email of the course author / instructor for exports + about. */
  authorEmail: "Hello@performos.ai",
  authorName: "PerformOS",
  authorUrl: "https://www.performos.ai",

  /**
   * Slug used in the downloaded progress-export filename. Format:
   *   "{Candidate-Name}_{exportSlug}_{YYYY-MM-DD}.md"
   * Kept short so multiple files line up alphabetically in a folder.
   */
  exportSlug: "alpine-map-progress",

  /**
   * App version stamp shown under the sidebar wordmark on desktop, so
   * Nigel can tell at a glance which build is running. Pulled
   * automatically from package.json's "version" field. Bump that and
   * the sidebar reflects it on the next build.
   */
  version: pkg.version,
} as const;

export type Brand = typeof BRAND;
