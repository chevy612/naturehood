"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { ButtonPrimary } from "@/app/components/ui/buttons";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About us", href: "/about" },
];

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Reveal on scroll up, hide on scroll down (always shown near the top).
  // Past the hero, the pill gains subtle depth (shadow + stronger border).
  useEffect(() => {
    function onScroll() {
      const currentY = window.scrollY;
      if (currentY < 80) {
        setHidden(false);
      } else if (currentY > lastScrollY.current) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      setScrolled(currentY >= 80);
      lastScrollY.current = currentY;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
    });
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
      {/* MAIN NAVBAR — Sticky pill above the hero; reveals on scroll up */}
      <header
        className={`sticky top-0 z-50 w-full px-[15px] sm:px-[25px] md:px-[30px] lg:px-[35px] pt-5 md:pt-[25px] transition-transform duration-300 ${
          hidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="max-w-[1370px] mx-auto">
        {/* Desktop Navbar */}
        <nav
          className={`hidden md:flex items-center justify-between bg-black rounded-[100px] h-[72px] px-[50px] lg:px-[103px] transition-all duration-300 ${
            scrolled ? "shadow-lg shadow-black/20" : ""
          }`}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            borderBottom: `1px solid rgba(230, 230, 230, ${scrolled ? 0.5 : 0.3})`,
          }}
        >
          <Link href="/" className="shrink-0">
            <Image
              src="/naturehood.svg"
              alt="Naturehood"
              width={208}
              height={24}
              priority
              className="w-[150px] lg:w-[180px] h-auto"
            />
          </Link>

          <div className="flex items-center gap-10 lg:gap-[60px]">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`text-[17px] leading-[22px] font-medium transition-colors duration-200 whitespace-nowrap ${
                    active ? "text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <Link href={isLoggedIn ? "/home" : "/#subscribe"} className="shrink-0">
            <ButtonPrimary variant="white">Join us</ButtonPrimary>
          </Link>
        </nav>

        {/* Mobile Navbar */}
        <nav
          className={`flex md:hidden items-center justify-between bg-black rounded-full h-[48px] px-5 transition-all duration-300 ${
            scrolled ? "shadow-lg shadow-black/20" : ""
          }`}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            borderBottom: `1px solid rgba(230, 230, 230, ${scrolled ? 0.5 : 0.3})`,
          }}
        >
          <Link href="/" className="shrink-0">
            <Image
              src="/naturehood.svg"
              alt="Naturehood"
              width={140}
              height={18}
              priority
              className="w-[120px] h-auto"
            />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-white/10 active:bg-white/20 rounded-full transition-colors"
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
        </div>
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
          className={`fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-black shadow-2xl transition-transform duration-300 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <Image
              src="/naturehood.svg"
              alt="Naturehood"
              width={120}
              height={16}
              className="w-[120px]"
            />
            <button
              onClick={closeMobileMenu}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          <nav className="p-5">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`block px-4 py-3 text-[15px] font-medium rounded-lg transition-all ${
                        active
                          ? "text-white bg-white/5"
                          : "text-white/70 hover:text-white hover:bg-white/5"
                      }`}
                      onClick={closeMobileMenu}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 pt-6 border-t border-white/10">
              <Link
                href={isLoggedIn ? "/home" : "/#subscribe"}
                onClick={closeMobileMenu}
                className="block"
              >
                <ButtonPrimary variant="white" fullWidth>
                  Join us
                </ButtonPrimary>
              </Link>
            </div>
          </nav>
        </aside>
      </div>
    </>
  );
}
