"use client";

import { usePathname } from "next/navigation";
import Navigation from "./layout/navigation";
import Footer from "./layout/footer";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Hide navigation and footer on auth pages
  const hideLayout = pathname?.startsWith("/signup") || pathname?.startsWith("/login");

  return (
    <>
      {!hideLayout && <Navigation />}
      <main className="min-h-screen">
        {children}
      </main>
      {!hideLayout && <Footer />}
    </>
  );
}
