import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/navbar";
import { Providers } from "@/components/providers";
import "@coinbase/onchainkit/styles.css";
import RootProvider from "@/components/ui/rootProvider";

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
          <NavBar />
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
