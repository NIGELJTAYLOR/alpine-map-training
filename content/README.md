# Content directory

This directory holds the workbook content as MDX files, processed by Velite at build time.

## Structure (target — populated in Session 2)

```
content/
  pages/
    L1/
      B1.1.mdx   B1.2.mdx   ...
    L2/
      C1.1.mdx   C2.1.mdx   ...
    L3/
      D1.1.mdx   D2.1.mdx   ...
  trainer-notes/
    L1/  L2/  L3/
  answer-keys/
    L1/  L2/  L3/
  diagrams/
    *.svg
  templates/
    *.mdx
```

The source markdown lives in the OneDrive workbook directory (Alpine_Map_Training).
Migration script in Session 2 copies and splits paired/triplet files into
individual page records with the front-matter schema defined in `velite.config.ts`.
