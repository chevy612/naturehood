"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { tokens } from "@/app/components/ui/tokens";

const CONSENT_KEY = "nh-cookie-consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#3A373C]/60 bg-[#141115]/95 backdrop-blur-sm"
      role="dialog"
      aria-label="Cookie notice"
      style={{ fontFamily: tokens.font.body }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-[#6B6870] leading-relaxed">
          We use essential cookies to keep you signed in.{" "}
          <Link href="/cookies" className="text-[#C8F04D] hover:underline">
            Cookie Policy
          </Link>
        </p>
        <button
          onClick={accept}
          className="shrink-0 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-black bg-[#C8F04D] hover:bg-[#d4f56a] transition-colors"
          style={{ fontFamily: tokens.font.heading }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
