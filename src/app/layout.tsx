import type { Metadata, Viewport } from "next";
import { Inter, Space_Mono, Outfit, Instrument_Serif } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import ParallaxBackground from "@/components/ParallaxBackground";
import PremiumLoader from "@/components/PremiumLoader";
import { ogSize } from "@/lib/og-image";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-accent",
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
});

const siteFavicon = "https://cdn.avrxt.in/icons/favicon.jpg";
const metadataBase = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "https://www.avrxt.in"
);

const openGraphImage = {
  url: "/opengraph-image",
  width: ogSize.width,
  height: ogSize.height,
  alt: "avrxt.in preview image",
} as const;

const twitterImage = {
  url: "/twitter-image",
  width: ogSize.width,
  height: ogSize.height,
  alt: "avrxt.in preview image",
} as const;

export const metadata: Metadata = {
  metadataBase,
  title: "avrxt | Full Stack Developer & Tech Innovator",
  description: "avrxt: Full Stack Developer specializing in React, Node.js, API development, and AI automation. Building secure, scalable, and enterprise-ready web solutions.",
  icons: {
    icon: [{ url: siteFavicon, type: "image/jpeg" }],
    shortcut: [siteFavicon],
    apple: [siteFavicon],
  },
  openGraph: {
    title: "avrxt | Full Stack Developer & Tech Innovator",
    description: "avrxt: Full Stack Developer specializing in React, Node.js, API development, and AI automation. Building secure, scalable, and enterprise-ready web solutions.",
    type: "website",
    siteName: "avrxt.in",
    images: [openGraphImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "avrxt | Full Stack Developer & Tech Innovator",
    description: "avrxt: Full Stack Developer specializing in React, Node.js, API development, and AI automation. Building secure, scalable, and enterprise-ready web solutions.",
    images: [twitterImage],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.variable} ${spaceMono.variable} ${outfit.variable} ${instrumentSerif.variable} font-sans bg-[#050505] text-white selection:bg-white/10 overflow-x-hidden`}>
        <PremiumLoader />
        <CustomCursor />
        <ParallaxBackground />
        <div className="mesh-gradient" />
        <Navbar />
        <main className="relative z-10 min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
