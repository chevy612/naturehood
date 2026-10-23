import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://naturehoodofficial.com",
  ),
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

/** Root layout must exist; locale-specific html/body live under `[locale]`. */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
