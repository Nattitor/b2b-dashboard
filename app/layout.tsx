import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://nattitor-dashboard.vercel.app'),
  title: {
    template: 'Nattitor B2B | %s',
    default: 'Nattitor B2B | Dashboard',
  },
  description: 'High-performance B2B Dashboard portfolio demonstration engineered with Next.js 15 (App Router), React Server Components, Supabase, and Tailwind CSS.',
  openGraph: {
    title: 'Nattitor B2B | Dashboard',
    description: 'High-performance B2B Dashboard portfolio demonstration engineered with Next.js 15 (App Router), React Server Components, Supabase, and Tailwind CSS.',
    url: 'https://nattitor-dashboard.vercel.app',
    siteName: 'Nattitor',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nattitor B2B | Dashboard',
    description: 'High-performance B2B Dashboard portfolio demonstration engineered with Next.js 15, Supabase, and Tailwind CSS.',
  }
};

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#0A0E17] text-white">
        <Sidebar />
        <div className="pl-64 flex flex-col min-h-screen">
          <Topbar />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
