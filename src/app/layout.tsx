import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ActivityLogger from "@/components/ActivityLogger";
import DebugPanel from "@/components/DebugPanel";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { siteConfig } from "@/lib/config";
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
  title: {
    default: `${siteConfig.name} | Custom Photo Magnets, Made in India`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "photo magnet",
    "custom fridge magnet India",
    "photo magnet 8x8",
    "personalised photo gift",
    "personalised gift",
    "fish magnets",
  ],
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-800">
        <ActivityLogger />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <DebugPanel />
      </body>
    </html>
  );
}
