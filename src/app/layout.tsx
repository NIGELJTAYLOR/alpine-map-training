import type { Metadata, Viewport } from "next";
import { Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ProgressProvider } from "@/lib/progress/provider";
import { SwRegister } from "@/components/site/sw-register";
import { InstallPrompt } from "@/components/site/install-prompt";
import { OfflineIndicator } from "@/components/site/offline-indicator";
import { IntroSplash } from "@/components/site/intro-splash";
import { SiteChrome } from "@/components/site/site-chrome";

// Glacier Lab typography stack — Direction 2
// Manrope is the single sans family for both display and body.
// IBM Plex Mono is the machine-code mono.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Alpine Map Training",
    template: "%s — Alpine Map Training",
  },
  description:
    "The digital companion to the Alpine Map Training workbook. For ski instructors preparing for BASI Alpine Level 4 ISTD.",
  manifest: "/manifest.webmanifest",
  applicationName: "Alpine Map Training",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Alpine Map Training",
  },
};

export const viewport: Viewport = {
  // Glacier Lab paper background — keeps the system UI consistent with the page.
  themeColor: "#EEF1F4",
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
      className={`${manrope.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground focus:shadow-lg"
        >
          Skip to main content
        </a>
        <ProgressProvider>
          <IntroSplash />
          <OfflineIndicator />
          <SiteChrome>{children}</SiteChrome>
          <InstallPrompt />
          <SwRegister />
        </ProgressProvider>
      </body>
    </html>
  );
}
