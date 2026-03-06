"use client";

import Image from "next/image";
import { Container, Section, ReadableText, Stack, tokens, SectionHeader, ProfileCard } from "@/app/components/ui";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#141115]">
      {/* Hero */}
      <Section
        className="relative pt-32 pb-16 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://jkaucsreqaywqxjwvteh.supabase.co/storage/v1/object/public/public-media/backgrounds/fung-bow.jpg')" }}
      >
        {/* dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60" />

        <Container className="relative z-10">
          <div className="max-w-3xl">
            <SectionHeader color="green" content="About Us"/>
            <h1
              className="text-white mb-6"
              style={tokens.typography.h1}
            >
              We are problem solvers.
            </h1>
            <ReadableText className="text-white/70" size="lg">
              We build solutions that help athletes and brands unlock value in the sports ecosystem. We start with creative projects, then scale into apps and systems that accelerate the sports economy in Hong Kong and beyond.
            </ReadableText>
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

          <div className="flex flex-col gap-10 max-w-3xl mx-auto">
            <ProfileCard
              layout="horizontal"
              mode="dark"
              role={["Sprinter", "Content"]}
              name="Colin Cheung"
              description={'I’ve been running track since I was 10, and it’s become a core part of who I am. I founded Naturehood to help athletes (including myself) build personal brands so they can earn what they deserve and sustain a long-term career outside the 9–5 path.'}
              photo="https://jkaucsreqaywqxjwvteh.supabase.co/storage/v1/object/public/public-media/founders/colin-color.png"
            />
            <ProfileCard
              layout="horizontal"
              mode="dark"
              name="Chevy Cheung"
              role={["Sprinter", "Tech"]}
              description={'I was motivated to start Naturehood after something that happened during my internship at an investment bank. I told my manager I was a sprinter, and he asked, “Can you make money from that?” That question stayed with me. It showed how undervalued sport is in Hong Kong — and it became the reason I started building a platform that helps athletes create real commercial opportunities.'}
              photo="https://jkaucsreqaywqxjwvteh.supabase.co/storage/v1/object/public/public-media/founders/chevy-color.webp"
            />
            <ProfileCard
              layout="horizontal"
              mode="dark"
              name="Justin Choi"
              role={["Runner", "Business"]}
              description={'I’m a sports lover, and I’ve seen that many sports communities in Hong Kong aren’t very engaging or well-structured. I enjoy taking on challenges, so I founded Naturehood to help change that. Since launching last year, the more my team and I have built, the more meaningful this project has become. My hope is that Naturehood will create real impact for local athletes and sports communities.'}
              photo="https://jkaucsreqaywqxjwvteh.supabase.co/storage/v1/object/public/public-media/founders/justin-color.png"
            />
          </div>
        </Container>
      </Section>


      {/* More Coming Soon */}
      <Section className="relative overflow-hidden py-16 sm:py-20">
        {/* Background image */}
        <Image
          src="https://jkaucsreqaywqxjwvteh.supabase.co/storage/v1/object/public/public-media/backgrounds/candy-run.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority={false}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#141115]/70" />

        {/* Content */}
        <Container className="relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#C8F04D]/10 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#C8F04D] animate-pulse" />
            </div>
            <h2
              className="text-[#E8E8E8] mb-4"
              style={tokens.typography.h2}
            >
              More is coming soon
            </h2>
            <ReadableText className="text-[#E8E8E8]">
              We&apos;re just getting started. Stay tuned as we share more of our
              journey, our team, and what we&apos;re building for athletes and brands
              across Hong Kong and beyond.
            </ReadableText>
          </div>
        </Container>
      </Section>
    </div>
  );
}
