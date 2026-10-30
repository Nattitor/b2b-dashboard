import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nattitor-dashboard.vercel.app"),
  title: {
    template: "%s · Nattitor Operations",
    default: "Nattitor Operations · Business in focus",
  },
  description:
    "Revenue, customers, and collections in one read-only B2B workspace. A portfolio dashboard with synthetic demonstration data.",
  openGraph: {
    title: "Nattitor Operations",
    description:
      "Your business, in focus. Revenue, customers, and collections in a B2B dashboard.",
    url: "https://nattitor-dashboard.vercel.app",
    siteName: "Nattitor Operations",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/brand/portfolio-cover.png",
        width: 1200,
        height: 630,
        alt: "Nattitor Operations · Business in focus",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nattitor Operations",
    description: "Your business, in focus.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <div className="sidebar-shell">
          <Sidebar />
        </div>
        <div className="app-shell">
          <Topbar />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <footer className="app-footer">
            <span>
              NATTITOR <span className="text-slate-400">/ OPERATIONS</span>
            </span>
            <span>Built for a clearer picture.</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
