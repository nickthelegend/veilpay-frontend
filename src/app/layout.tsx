import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import NetworkGuard from "@/components/NetworkGuard";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "VeilPay - Smart Private Payments & Micro-Investing",
  description: "Round up your spending and invest in your future privately. The world's first stealth DeFi micro-investment platform on Conflux.",
  keywords: ["defi", "privacy", "stealth address", "conflux", "crypto", "investing", "round-up", "payments"],
  authors: [{ name: "VeilPay" }],
  openGraph: {
    title: "VeilPay - Smart Private Payments",
    description: "Secure, private, and automated micro-investments.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${spaceGrotesk.variable} antialiased bg-[#111111] text-white`}>
        <Providers>
          <NetworkGuard>
            {children}
          </NetworkGuard>
        </Providers>
      </body>
    </html>
  );
}

