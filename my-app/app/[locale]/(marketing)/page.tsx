import type { Metadata } from "next";
import {
  HeroSection,
  WhatWeDoSection,
  FinalCTASection,
} from "@/app/components/sections";

export const metadata: Metadata = {
  description: "Build for athletes and teams to achieve ambition goals.",
};

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <HeroSection />
      <WhatWeDoSection />
      <FinalCTASection />
    </div>
  );
}
