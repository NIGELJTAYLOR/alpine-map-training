import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Alpine Map Training",
    short_name: "Map Training",
    description:
      "Digital companion to the Alpine Map Training workbook for ski instructors preparing for BASI Alpine Level 4 ISTD.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F4ECD8",
    theme_color: "#F4ECD8",
    categories: ["education", "navigation"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
