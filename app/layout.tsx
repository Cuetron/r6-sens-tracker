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
  title: "R6 Sensitivity Tracker", // I updated this from "Create Next App" for you!
  description: "The definitive database for Rainbow Six Siege pro configurations.",
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