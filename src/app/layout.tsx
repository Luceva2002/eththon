import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/navbar";
import "@coinbase/onchainkit/styles.css";
import RootProvider from "@/components/ui/rootProvider";
import { FarcasterReady } from "@/components/farcaster-ready";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ethton - Bill Splitting Made Easy",
  description:
    "Gestisci le spese di gruppo con amici e familiari. Dividi le spese in modo semplice e veloce.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  manifest: "/.well-known/farcaster.json",
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "https://eththon.vercel.app/logo.png",
    "fc:frame:button:1": "Apri App",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": "https://eththon.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RootProvider>
          <FarcasterReady />
          <NavBar />
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
