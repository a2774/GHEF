import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist_Mono, Inter, Playfair_Display } from "next/font/google";
import { siteUrl } from "@/lib/site";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-logo",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "Hand-tufted and hand-knotted rugs and carpets, made in sizes that fit your room.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Ganga Handmade Export | Handmade Rugs & Carpets",
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Ganga Handmade Export",
    description,
    siteName: "Ganga Handmade Export",
    type: "website",
    locale: "en_IN",
    images: ["/images/hero-living-room.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${bricolage.variable} ${playfair.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
