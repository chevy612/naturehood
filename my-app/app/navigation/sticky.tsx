"use client";

import { useEffect, useState } from "react";

export default function StickyBar() {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (<Bar isSticky={isSticky} />);
}

function Bar({ isSticky = false }) {
  return (
    <div className="sticky top-0 z-50 py-3 md:py-5 bg-[#141115] flex flex-row items-center justify-between px-4 md:px-0">
      <img
        src="/naturehood.svg"
        alt="NATUREHOOD Logo"
        className="h-6 w-auto md:h-auto md:w-60 ml-0 md:ml-5"
      />

      {/* Button appears when sticky */}
      {isSticky && (
        <button className="btn-primary text-xs md:text-base px-3 py-1.5 md:px-4 md:py-2 mr-0 md:mr-5">
          Join us
        </button>
      )}
    </div>
  );
}
