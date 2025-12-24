import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import Navbar from "./navigation/navigation"
import Footer from "./components/footer"

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const switzer = localFont({
  src: "../public/fonts/switzer/Switzer-SemiboldItalic.woff2",
  variable: "--font-switzer",
});

export const metadata: Metadata = {
  title: "NATUREHOOD",
  description: "Connecting People with Athletes",
  icons: {
    icon: "/icon.svg"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${switzer.variable} antialiased`}
      >
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
