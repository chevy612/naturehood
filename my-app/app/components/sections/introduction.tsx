"use client";
import { ButtonSecondary, Prose } from "@/app/components/ui";
import Link from "next/link";

export default function IntroSection() {
  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="py-12 sm:py-16 md:py-20 bg-[#f5f5f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="text-center">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#6B6870] mb-4"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Introduction
            </p>
            <h2
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#141115] mb-6"
              style={{
                fontFamily: "'Inter', sans-serif",
                lineHeight: "1.1",
                letterSpacing: "-0.02em",
              }}
            >
              What is Naturehood
            </h2>
          </div>

          <div className="flex justify-center">
            <div className="max-w-[55ch] text-left">
              <Prose className="mb-8">
                Naturehood is a startup that connects athletes and brands.
                We don't just introduce them — we plan, research, and produce the collaboration from start to finish.
                From creative direction to content production, we build projects that serve both the athlete's identity and the brand's goals.
              </Prose>
            </div>
          </div>

          <div className="flex justify-center">
            <Link href="/about">
              <ButtonSecondary>Meet us</ButtonSecondary>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
