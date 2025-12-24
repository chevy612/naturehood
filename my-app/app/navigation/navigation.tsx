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
    <header className="flex flex-row items-center justify-between bg-background">
      {/* Logo */}
      <div className="flex items-center justify-between px-0 ml-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/icon.svg" alt="Logo" width={60} height={60} priority />
        </Link>
      </div>

      {/* Right side icons */}
      <div className="flex items-center gap-4 mr-3" ref={menuRef}>
        {/* Shop */}
        <Link href="/account" className="icon-button" aria-label="Account">
          <User className="h-5 w-5" />
        </Link>
        {/* Menu */}
        <Link href="/cart" className="icon-button" aria-label="Shop">
          <ShoppingBag className="h-5 w-5" />
        </Link>
        {/* Menu toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="icon-button"
          aria-label="Menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
            "fixed top-0 right-0 z-70 h-full w-64 max-w-[85vw] bg-[#141115] shadow-lg",
            "transition-transform duration-300 ease-in-out",
            open ? "translate-x-0" : "translate-x-full",
          ].join(" ")}
          role="dialog"
          aria-modal="true"
        >
          {/* Menu header */}
          <div className="flex items-center justify-end gap-4 mr-3 mt-3 ">
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className="icon-button"
              aria-label="Close menu"
            >
              <X />
            </button>
          </div>
          {/* Menu items */}
          <nav className="px-2 mr-3 mt-10">
            <ul className="space-y-1 ">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block w-full rounded-md px-3 py-2 text-base font-medium  hover:bg-green-400"
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
