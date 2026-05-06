import type { Metadata, Viewport } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ProgressProvider } from "@/lib/progress/provider";
import { SwRegister } from "@/components/site/sw-register";
import { InstallPrompt } from "@/components/site/install-prompt";
import { OfflineIndicator } from "@/components/site/offline-indicator";
import { IntroSplash } from "@/components/site/intro-splash";

// Carta typography stack — Direction 1
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  // Fraunces is a variable font — `axes` requires `weight` to be omitted
  // (or set to "variable"), so all weights are available via font-weight.
  axes: ["opsz"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
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
  // Carta paper background — keeps the system UI consistent with the page.
  themeColor: "#F4ECD8",
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
      className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable} h-full antialiased`}
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
          {children}
          <InstallPrompt />
          <SwRegister />
        </ProgressProvider>
      </body>
    </html>
  );
}
