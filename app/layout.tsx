import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://cardvault-two.vercel.app'),
  alternates: {
    canonical: './',
  },
  title: {
    default: "CardVault — Your Card Collection Command Center",
    template: "%s | CardVault",
  },
  description:
    "CardVault is your command center for sports cards and Pokémon TCG. Browse sets, check prices, track market trends, and find iconic cards across baseball, basketball, football, and hockey.",
  keywords: ["sports cards", "pokemon cards", "card prices", "card collecting", "TCG", "PSA grading"],
  openGraph: {
    title: "CardVault — Your Card Collection Command Center",
    description:
      "Browse sports cards and Pokémon TCG sets, check real market prices, and track trends — all in one place.",
    type: "website",
    siteName: "CardVault",
  },
  twitter: {
    card: "summary_large_image",
    title: "CardVault — Your Card Collection Command Center",
    description: "Sports cards + Pokémon TCG price guide and set browser.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-gray-950 text-white antialiased">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
