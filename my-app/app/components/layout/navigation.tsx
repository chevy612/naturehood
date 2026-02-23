"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, User, LogOut, ChevronDown } from "lucide-react";
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Container, ButtonAccent} from '@/app/components/ui';
import { tokens } from '@/app/components/ui/tokens';

// ─────────────────────────────────────────────
// NAVIGATION ITEMS
// ─────────────────────────────────────────────
const allNavItems = [
  { label: "Home", href: "/" },
  { label: "Athletes", href: "/athlete", hideInProd: true },
  { label: "Brands", href: "/business" },
  { label: "About us", href: "/about", hideInProd: true },
];

const navItems = process.env.NODE_ENV === "production"
  ? allNavItems.filter((item) => !item.hideInProd)
  : allNavItems;

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // ─────────────────────────────────────────────
  // AUTH STATE MANAGEMENT
  // ─────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ─────────────────────────────────────────────
  // CLOSE MENU ON ESC KEY
  // ─────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
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

  // ─────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    router.push('/');
  };

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

            {/* ─── RIGHT: User Menu or Sign Up Button ─── */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    onBlur={() => setTimeout(() => setUserMenuOpen(false), 200)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5 transition-colors group"
                    aria-label="User menu"
                    aria-expanded={userMenuOpen}
                  >
                    <User className="h-5 w-5 text-white" />
                    <span className="hidden sm:inline text-sm font-medium text-white">
                      {user.email?.split('@')[0]}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-white/70 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* User Dropdown Menu */}
                  <div
                    className={`absolute right-0 mt-2 w-48 bg-[#1E1B1F] rounded-md shadow-lg border border-[#3A373C] overflow-hidden transition-all duration-200 origin-top ${
                      userMenuOpen
                        ? 'opacity-100 visible scale-100 translate-y-0'
                        : 'opacity-0 invisible scale-95 -translate-y-2'
                    }`}
                  >
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <Link href="/signup">
                  <ButtonAccent>Sign Up</ButtonAccent>
                </Link>
              )}
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
            {!user && (
              <div className="mt-8 pt-6 border-t border-[#3A373C]">
                <Link href="/signup" onClick={closeMobileMenu}>
                  <ButtonAccent fullWidth>Sign Up</ButtonAccent>
                </Link>
              </div>
            )}
          </nav>
        </aside>
      </div>
    </>
  );
}
