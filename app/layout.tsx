import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // 1. The Browser Tab Title
  title: {
    default: 'R6 Sens Tracker | Pro Siege Settings',
    template: '%s | R6 Sens Tracker', // This makes sub-pages look like "About | R6 Sens Tracker"
  },
  
  // 2. The Google Search Description
  description: 'The definitive, centralized hub for Rainbow Six Siege professional configurations, sensitivities, and multipliers.',
  
  // 3. The Discord/Twitter Link Preview (Open Graph)
  openGraph: {
    title: 'R6 Sens Tracker | Pro Siege Settings',
    description: 'The definitive database for Rainbow Six Siege professional configurations.',
    url: 'https://www.r6sens.com',
    siteName: 'R6 Sens Tracker',
    locale: 'en_US',
    type: 'website',
  },
  
  // 4. Twitter Specific Card Styling
  twitter: {
    card: 'summary_large_image',
    title: 'R6 Sens Tracker',
    description: 'The definitive database for Rainbow Six Siege professional configurations.',
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
      // Right at the end of this string is the overflow-y-scroll fix
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-y-scroll`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}