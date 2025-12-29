"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, User, ShoppingBag, X } from "lucide-react";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Team", href: "/team" },
  { label: "For Business", href: "/business" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  //Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!open) return;
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  //Close on ESC Key
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 flex flex-row items-center justify-between bg-[#141115] h-16 sm:h-18 md:h-22 px-2 sm:px-3 md:px-4">
      {/* Left side - Menu toggle and Logo */}
      <div className="flex items-center gap-2 sm:gap-2 md:gap-3">
        {/* Menu toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="icon-button p-2 sm:p-3 opacity-70"
          aria-label="Menu"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" /> : <Menu className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />}
        </button>
        
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image 
            src="/naturehood.svg" 
            alt="Logo" 
            width={160} 
            height={64} 
            priority 
            className="w-32 h-auto sm:w-40 md:w-44 lg:w-48"
          />
        </Link>
      </div>

      {/* Right side - Sign up button */}
      <div className="flex items-center mr-3 sm:mr-4 md:mr-6">
        <button className="btn btn-primary py-1.5 sm:py-2 text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4">
          Sign Up
        </button>
      </div>

      {/* Overlay + Slide Panel*/}
      <div
        className={[
          "fixed inset-0 bg-black/70 transition-opacity duration-200",
          open ? "z-60 opacity-100 pointer-events-auto" : "z-0 opacity-0 pointer-events-none",
        ].join(" ")}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      >
        {/* Side menu */}
        <aside
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          className={[
            "fixed top-0 left-0 z-70 h-full w-56 sm:w-64 md:w-72 max-w-[85vw] bg-[#141115] shadow-lg",
            "transition-transform duration-300 ease-in-out",
            open ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
          role="dialog"
          aria-modal="true"
        >
          {/* Menu header */}
          <div className="flex items-center justify-start gap-2 sm:gap-4 ml-2 sm:ml-3 mt-2 sm:mt-3">
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className="icon-button p-1.5 sm:p-2"
              aria-label="Close menu"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
          {/* Menu items */}
          <nav className="px-2 ml-2 sm:ml-3 mt-6 sm:mt-8 md:mt-10">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block w-full rounded-md px-2 sm:px-3 py-2 sm:py-2.5 text-sm sm:text-base font-medium hover:bg-green-400 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </header>
  );
}
