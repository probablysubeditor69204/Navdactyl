import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Navdactyl Dashboard",
  description: "Premium Pterodactyl Client Portal",
};

import NextAuthProvider from "@/config/providers";
import { Toaster } from "@/components/ui/sonner";
import { MetadataManager } from "@/components/metadata-manager";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-background text-foreground`}
      >
        <NextAuthProvider>
          <MetadataManager />
          {children}
          <Toaster />
        </NextAuthProvider>
      </body>
    </html>
  );
}
