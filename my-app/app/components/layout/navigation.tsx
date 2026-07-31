"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Event", href: "/events" },
  { label: "About us", href: "/about" },
];

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
    });
  }, []);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    function onScroll() {
      const currentY = window.scrollY;
      if (currentY < 100) {
        // Always show near the top
        setVisible(true);
      } else if (currentY > lastScrollY.current) {
        // Scrolling down → hide
        setVisible(false);
      } else {
        // Scrolling up → show
        setVisible(true);
      }
      lastScrollY.current = currentY;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      {/* MAIN NAVBAR — Floating, transparent, hide/show on scroll */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 px-6 sm:px-12 md:px-[108px] pt-4 md:pt-[30px] transition-transform duration-300 ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Desktop Navbar */}
        <nav
          className="hidden md:flex items-center justify-between bg-black rounded-[100px] h-[88px] px-[60px] lg:px-[103px] border-b border-[rgba(230,230,230,0.3)]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src="/naturehood.svg"
              alt="Naturehood"
              width={208}
              height={24}
              priority
              className="w-[160px] lg:w-[208px] h-auto"
            />
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-[40px] lg:gap-[60px]">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white text-[16px] lg:text-[20px] font-medium transition-colors hover:text-[#f5f5f5]/80 whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Sign Up / Auth Button */}
          <Link
            href={isLoggedIn ? "/home" : "/signup"}
            className="bg-[#f5f5f5] text-black rounded-[999px] px-[24px] py-[14px] text-[16px] lg:text-[20px] font-medium transition-colors hover:bg-white whitespace-nowrap"
          >
            {isLoggedIn ? "Open App" : "Sign up"}
          </Link>
        </nav>

        {/* Mobile Navbar */}
        <nav
          className="flex md:hidden items-center justify-between bg-black rounded-[100px] h-[56px] px-6"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <Link href="/" className="shrink-0">
            <Image
              src="/naturehood.svg"
              alt="Naturehood"
              width={160}
              height={20}
              priority
              className="w-[130px] h-auto"
            />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-white/10 rounded-md transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-white" />
            ) : (
              <Menu className="h-5 w-5 text-white" />
            )}
          </button>
        </nav>
      </header>

      {/* MOBILE MENU OVERLAY */}
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 z-50 md:hidden ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMobileMenu}
        aria-hidden={!mobileMenuOpen}
      >
        <aside
          onClick={(e) => e.stopPropagation()}
          className={`fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-black shadow-2xl transition-transform duration-300 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <Image
              src="/naturehood.svg"
              alt="Naturehood"
              width={130}
              height={16}
              className="w-[130px]"
            />
            <button
              onClick={closeMobileMenu}
              className="p-2 hover:bg-white/10 rounded-md transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Mobile Menu Items */}
          <nav className="p-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block px-4 py-3 text-[16px] font-medium text-white hover:bg-white/10 rounded-md transition-all"
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-6 border-t border-white/10">
              <Link
                href={isLoggedIn ? "/home" : "/signup"}
                onClick={closeMobileMenu}
                className="block w-full text-center bg-[#f5f5f5] text-black rounded-[999px] px-[24px] py-[14px] text-[16px] font-medium transition-colors hover:bg-white"
              >
                {isLoggedIn ? "Open App" : "Sign up"}
              </Link>
            </div>
          </nav>
        </aside>
      </div>
    </>
  );
}
