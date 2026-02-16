"use client";

import { Container, Section, ReadableText, Stack, tokens } from "@/app/components/basic/basic";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#141115]">
      {/* Hero */}
      <Section className="bg-[#141115] pt-32 pb-16">
        <Container>
          <div className="max-w-3xl">
            <p
              className="text-[#C8F04D] mb-4"
              style={tokens.typography.label}
            >
              About Us
            </p>
            <h1
              className="text-white mb-6"
              style={tokens.typography.h1}
            >
              Three people. One shared obsession.
            </h1>
            <ReadableText className="text-white/70" size="lg">
              An athlete, an engineer, and an entrepreneur walked into
              a room — and never left until they had a plan.
            </ReadableText>
          </div>
        </Container>
      </Section>

      {/* Our Story */}
      <Section className="bg-[#E8E8E8] py-16 sm:py-20">
        <Container>
          <div className="max-w-3xl mx-auto">
            <p
              className="text-[#6B6870] mb-4"
              style={tokens.typography.label}
            >
              Our Story
            </p>
            <h2
              className="text-[#141115] mb-8"
              style={tokens.typography.h2}
            >
              We like solving complex problems
            </h2>

            <Stack spacing={6}>
              <ReadableText className="text-white/70">
                Naturehood was born from a simple observation: the sports industry
                in Hong Kong is full of untapped potential. Talented athletes go
                unnoticed. Passionate brands struggle to find authentic voices.
                The connections that should exist — don't.
              </ReadableText>
              <ReadableText className="text-white/70">
                We're three co-founders who come from very different worlds. One of
                us competed at the highest level and knows what it's like to chase
                performance while trying to build a career beyond the track. One of
                us is an engineer who sees systems, patterns, and opportunities
                where others see complexity. And one of us is an entrepreneur who's
                spent years building things from nothing.
              </ReadableText>
              <ReadableText className="text-white/70">
                What we share is a love for solving hard problems — and the belief
                that the best solutions come from people who actually care about the
                space they're working in.
              </ReadableText>
              <ReadableText className="text-white/70">
                We chose to start with sports in Hong Kong because it's what we
                know. It's where we train, where we compete, and where we've seen
                firsthand how much value is being left on the table. Athletes
                deserve better platforms. Brands deserve real partnerships. And Hong
                Kong's sporting community deserves the infrastructure to grow.
              </ReadableText>
            </Stack>
          </div>
        </Container>
      </Section>

      {/* The Team */}
      <Section className="bg-[#1E1B1F] py-16 sm:py-20">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p
              className="text-[#C8F04D] mb-4"
              style={tokens.typography.label}
            >
              The Founders
            </p>
            <h2
              className="text-white"
              style={tokens.typography.h2}
            >
              Built by people who get it
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Founder 1 — The Athlete */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#C8F04D] flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                    stroke="#141115"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3
                className="text-white mb-1"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "20px", fontWeight: "600" }}
              >
                The Athlete
              </h3>
              <p
                className="text-[#6B6870] text-[13px] leading-relaxed mt-3"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Knows the grind, the sacrifices, and the untold stories behind every performance.
              </p>
            </div>

            {/* Founder 2 — The Engineer */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#C8F04D] flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M16 18l6-6-6-6M8 6l-6 6 6 6"
                    stroke="#141115"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3
                className="text-white mb-1"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "20px", fontWeight: "600" }}
              >
                The Engineer
              </h3>
              <p
                className="text-[#6B6870] text-[13px] leading-relaxed mt-3"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Sees systems and structure where others see chaos. Builds the platform that makes it all work.
              </p>
            </div>

            {/* Founder 3 — The Entrepreneur */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#C8F04D] flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="#141115"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3
                className="text-white mb-1"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "20px", fontWeight: "600" }}
              >
                The Entrepreneur
              </h3>
              <p
                className="text-[#6B6870] text-[13px] leading-relaxed mt-3"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Turns vision into reality. Connects the dots between opportunity and execution.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Why Hong Kong */}
      <Section className="bg-[#141115] py-16 sm:py-20">
        <Container>
          <div className="max-w-3xl mx-auto">
            <p
              className="text-[#C8F04D] mb-4"
              style={tokens.typography.label}
            >
              Why Hong Kong
            </p>
            <h2
              className="text-white mb-8"
              style={tokens.typography.h2}
            >
              Starting where we know best
            </h2>
            <Stack spacing={6}>
              <ReadableText className="text-white/70">
                Hong Kong has world-class athletes, a thriving fitness culture,
                and brands eager to connect with authentic voices — but the
                infrastructure to bring them together hasn't existed. Until now.
              </ReadableText>
              <ReadableText className="text-white/70">
                This is where we train. This is where we build. And this is where
                Naturehood begins.
              </ReadableText>
            </Stack>
          </div>
        </Container>
      </Section>

      {/* More Coming Soon */}
      <Section className="bg-[#1E1B1F] py-16 sm:py-20">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#C8F04D]/10 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#C8F04D] animate-pulse" />
            </div>
            <h2
              className="text-white mb-4"
              style={tokens.typography.h2}
            >
              More is coming soon
            </h2>
            <ReadableText className="text-white/50">
              We're just getting started. Stay tuned as we share more of our
              journey, our team, and what we're building for athletes and brands
              across Hong Kong and beyond.
            </ReadableText>
          </div>
        </Container>
      </Section>
    </div>
  );
}
