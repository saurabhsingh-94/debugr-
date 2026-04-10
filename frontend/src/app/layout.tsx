import type { Metadata } from "next";
import { Inter, DM_Mono } from "next/font/google";
import "./globals.css";
import "./custom.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ['400', '500'],
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Debugr | Professional Bug Bounty Platform",
  description: "Connect with top hackers and protect your digital assets with the industrial-grade Debugr platform.",
};

import LenisProvider from "@/components/providers/LenisProvider";
import MouseGlow from "@/components/animation/MouseGlow";
import { CurrencyProvider } from "@/context/CurrencyContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${dmMono.variable} antialiased overflow-x-hidden`}
    >
      <head>
        <script src="https://sdk.cashfree.com/js/v3/cashfree.js" defer></script>
      </head>
      <body className="relative bg-[#050505] selection:bg-indigo-500/30 overflow-x-hidden">
        <MouseGlow />
        <LenisProvider>
          <CurrencyProvider>
            {children}
          </CurrencyProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
