import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProgressProvider } from "@/lib/progress/provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Alpine Map Training",
    template: "%s — Alpine Map Training",
  },
  description:
    "A digital companion to the Alpine Map Training workbook for ski instructors preparing for BASI Alpine Level 4 ISTD.",
  manifest: "/manifest.webmanifest",
  applicationName: "Alpine Map Training",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Alpine Map Training",
  },
};

export const viewport: Viewport = {
  themeColor: "#475569",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      className={`${inter.variable} ${sourceSerif.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ProgressProvider>{children}</ProgressProvider>
      </body>
    </html>
  );
}
