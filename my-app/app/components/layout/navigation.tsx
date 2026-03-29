"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Container, ButtonAccent} from '@/app/components/ui';
import { tokens } from '@/app/components/ui/tokens';

// ─────────────────────────────────────────────
// NAVIGATION ITEMS
// ─────────────────────────────────────────────
const navItems = [
  { label: "Home", href: "/" },
  { label: "Athletes", href: "/athletes"},
  { label: "Brands", href: "/business" },
  { label: "About us", href: "/about" }
];

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ─────────────────────────────────────────────
  // CLOSE MENU ON ESC KEY
  // ─────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // ─────────────────────────────────────────────
  // LOCK BODY SCROLL WHEN MOBILE MENU OPEN
  // ─────────────────────────────────────────────
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
      {/* ═══════════════════════════════════════════
          MAIN NAVBAR
          ═══════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-50 bg-[#141115] border-b border-[#3A373C]/50 backdrop-blur-sm"
        style={{ fontFamily: tokens.font.body }}
      >
        <Container>
          <nav className="flex items-center justify-between h-16 sm:h-20">

            {/* ─── LEFT: Mobile Menu Button (Mobile Only) ─── */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-white/5 rounded-md transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </button>

            {/* ─── CENTER/LEFT: Logo ─── */}
            <Link href="/" className="flex items-center lg:mr-12">
              <Image
                src="/naturehood.svg"
                alt="Naturehood"
                width={160}
                height={64}
                priority
                className="w-32 h-auto sm:w-40 md:w-44"
              />
            </Link>

            {/* ─── CENTER: Desktop Navigation Links ─── */}
            <div className="hidden lg:flex items-center flex-1 gap-7">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[11px] font-semibold text-white/70 hover:text-white transition-colors uppercase"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: "0.18em",
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* ─── RIGHT: Sign Up Button ─── */}
            <div className="flex items-center gap-3">
              <Link href="/signup">
                <ButtonAccent>Sign Up</ButtonAccent>
              </Link>
            </div>
          </nav>
        </Container>
      </header>

      {/* ═══════════════════════════════════════════
          MOBILE MENU OVERLAY
          ═══════════════════════════════════════════ */}
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 z-50 lg:hidden ${
          mobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobileMenu}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Mobile Slide-in Menu */}
        <aside
          onClick={(e) => e.stopPropagation()}
          className={`fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-[#141115] border-r border-[#3A373C] shadow-2xl transition-transform duration-300 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
        >
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#3A373C]">
            <Image
              src="/naturehood.svg"
              alt="Naturehood"
              width={120}
              height={48}
              className="w-32"
            />
            <button
              onClick={closeMobileMenu}
              className="p-2 hover:bg-white/5 rounded-md transition-colors"
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
                    className="block px-4 py-3 text-[11px] font-semibold text-white hover:bg-[#C8F04D]/10 hover:text-[#C8F04D] rounded-md transition-all uppercase"
                    onClick={closeMobileMenu}
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      letterSpacing: "0.18em",
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Mobile Menu Footer */}
            <div className="mt-8 pt-6 border-t border-[#3A373C]">
              <Link href="/signup" onClick={closeMobileMenu}>
                <ButtonAccent fullWidth>Sign Up</ButtonAccent>
              </Link>
            </div>
          </nav>
        </aside>
      </div>
    </>
  );
}
