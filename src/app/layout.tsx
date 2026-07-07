import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";
import { BackgroundPattern } from "@/components/background-pattern";
import { Toaster } from "@/components/ui/sonner";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "NEXUS30 — Ideaton / Hakaton / AI Startup Kuni",
  description:
    "Olmazor tumani yoshlari uchun 3 bosqichli tech-tadbir: Ideaton, Hakaton va AI Startup Kuni uchun ro'yxatdan o'tish platformasi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className={cn(display.variable, body.variable, mono.variable)}>
      <body className="min-h-screen font-sans">
        <Providers>
          <BackgroundPattern />
          {children}
          <Toaster theme="dark" position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
