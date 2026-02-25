import type { Metadata } from "next";
import { Inter, Space_Mono, Outfit, Instrument_Serif } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";


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

export const metadata: Metadata = {
  title: "avrxt | Full Stack Developer & Tech Innovator",
  description: "avrxt: Full Stack Developer specializing in React, Node.js, API development, and AI automation. Building secure, scalable, and enterprise-ready web solutions.",
  icons: {
    icon: "https://camo.githubusercontent.com/870cfca3432cad5e7be3cb0bdb72a4492ac41a7c4e835a2ee34879164587a897/68747470733a2f2f63646e2e61767278742e696e2f6173736574732f6c6f676f2d30322e706e67",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.variable} ${spaceMono.variable} ${outfit.variable} ${instrumentSerif.variable} font-sans bg-black text-white selection:bg-white/10`}>
        <div className="mesh-gradient" />
        <Navbar />
        {children}
        <Footer />

      </body>
    </html>
  );
}
