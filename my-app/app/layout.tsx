import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import CookieBanner from "./components/ui/cookie-banner";

import "./globals.css";

// Naturehood Design System Fonts
// 2-font system: Sk Modernist (display) + DM Sans (everything else)
const dmSans = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://naturehoodofficial.com"),
  title: "Naturehood Official",
  description: "Connecting athletes and brands through authentic partnerships.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "Naturehood Official",
    description: "Connecting athletes and brands through authentic partnerships.",
    url: "/",
    siteName: "Naturehood",
    images: [
      {
        url: "/image/metadata.png",
        width: 1200,
        height: 630,
        alt: "Naturehood — Connecting athletes and brands",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Naturehood Official",
    description: "Connecting athletes and brands through authentic partnerships.",
    images: ["/image/metadata.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} antialiased`}
      >
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
