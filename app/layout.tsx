import type { Metadata } from "next";
import { Barlow_Condensed, Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import NavBar from "@/app/components/NavBar";
import Footer from "@/app/components/Footer";
import ContactWidget from "@/app/components/ContactWidget";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Headlines, player and team names, and every number.
const barlow = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  // Sub-pages set a title like "Box settings: sens, DPI and gear" and this
  // template adds the site name.
  title: {
    default: "R6Sens | Pro Rainbow Six Siege settings, sent by the pros",
    template: "%s | R6Sens",
  },
  description:
    "Sensitivity, DPI, FOV and gear for every Rainbow Six Siege pro. Most entries come straight from the player.",

  // Discord/Twitter link preview (Open Graph)
  openGraph: {
    title: "R6Sens | Pro Rainbow Six Siege settings",
    description:
      "Sensitivity, DPI, FOV and gear for every Rainbow Six Siege pro, collected from the players.",
    url: "https://www.r6sens.com",
    siteName: "R6Sens",
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "R6Sens",
    description:
      "Sensitivity, DPI, FOV and gear for every Rainbow Six Siege pro, collected from the players.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // overflow-y-scroll keeps the scrollbar gutter stable between pages
      className={`${geistSans.variable} ${barlow.variable} h-full antialiased overflow-y-scroll`}
    >
      <body className="min-h-full flex flex-col bg-ground text-ink font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
        >
          Skip to content
        </a>
        <NavBar />
        <div className="flex-1">{children}</div>
        <Footer />
        <ContactWidget />
        <Analytics />
      </body>
    </html>
  );
}
