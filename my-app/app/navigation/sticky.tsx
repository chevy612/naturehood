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
    <div className="sticky top-0 z-50 py-5 bg-[#141115] flex flex-row items-center justify-between">
      <img
        src="/naturehood.svg"
        alt="NATUREHOOD Logo"
        height={100}
        width={240}
        className="ml-5"
      />

      {/* Button appears when sticky */}
      {isSticky && <button className={"btn-primary mr-5"}>Join us</button>}
    </div>
  );
}
