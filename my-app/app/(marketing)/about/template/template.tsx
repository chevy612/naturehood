"use client";

import { Container, Section, ReadableText, Stack, tokens } from "@/app/components/ui";
import { MediaImage, MediaSplit, MediaGrid } from "@/app/components/media";

// ─────────────────────────────────────────────
// FOUNDER / TEAM PROFILE DATA
// Replace with actual founder images and info
// ─────────────────────────────────────────────

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  imageSrc: string;
  expertise?: string[];
}

const founders: TeamMember[] = [
  {
    name: "Chevy Cheung",
    role: "Co-Founder & CEO",
    bio: "Athlete turned entrepreneur. With over 10 years in competitive sports, they understand firsthand the challenges athletes face in building their personal brand and securing meaningful partnerships.",
    imageSrc: "",
    expertise: ["Athlete Relations", "Business Strategy", "Brand Partnerships"]
  },
  {
    name: "Colin Cheung",
    role: "Co-Founder & Creative Director",
    bio: "Award-winning creative director with extensive experience working with global brands. They bring a unique perspective on how to craft authentic stories that resonate with both athletes and audiences.",
    imageSrc: "",
    expertise: ["Creative Direction", "Content Production", "Brand Identity"]
  },
];

const team: TeamMember[] = [
  {
    name: "Team Member 1",
    role: "Head of Partnerships",
    bio: "Connecting brands with athletes who align with their values and vision.",
    imageSrc: "",
  },
  {
    name: "Team Member 2",
    role: "Lead Producer",
    bio: "Bringing collaboration concepts to life through compelling visual storytelling.",
    imageSrc: "",
  },
  {
    name: "Team Member 3",
    role: "Community Manager",
    bio: "Building and nurturing the Naturehood community of athletes and brands.",
    imageSrc: "",
  },
];

// ─────────────────────────────────────────────
// ABOUT PAGE
// ─────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <Section className="bg-[#141115] text-white pt-32 pb-20">
        <Container>
          <Stack spacing={8}>
            <p 
              className="text-[#C8F04D]"
              style={tokens.typography.label}
            >
              About Naturehood
            </p>
            <h1 
              className="text-white"
              style={tokens.typography.h1}
            >
              Redefining how athletes and brands collaborate
            </h1>
            <ReadableText className="text-white/80 max-w-[65ch]" size="lg">
              We're a team of former athletes, creative directors, and brand strategists
              who believe in the untapped value of athlete identity beyond competition results.
            </ReadableText>
          </Stack>
        </Container>
      </Section>

      {/* Mission Section */}
      <Section>
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p style={tokens.typography.label}>Our Mission</p>
              <h2 
                className="mt-4 mb-6"
                style={tokens.typography.h2}
              >
                Performance meets storytelling
              </h2>
              <Stack spacing={6}>
                <ReadableText>
                  Competitive athletes dedicate years to training, discipline, and performance—yet
                  their value is often reduced to results, rankings, or medals alone.
                </ReadableText>
                <ReadableText>
                  Outside competition, many athletes struggle to sustain their careers or express
                  who they are beyond the sport. Their effort, mindset, and daily commitment remain
                  largely unseen.
                </ReadableText>
                <ReadableText>
                  Naturehood exists to change that. We believe athletes are more than results. Their
                  journey, identity, and way of living carry cultural, creative, and commercial value—when
                  told with intention.
                </ReadableText>
              </Stack>
            </div>
            <MediaImage
              src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200&h=800&fit=crop"
              alt="Team collaboration"
              aspectRatio="4/3"
            />
          </div>
        </Container>
      </Section>

      {/* What We Do Section */}
      <Section className="bg-[#F5F5F5] py-16 sm:py-20 md:py-24 lg:py-28">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p style={tokens.typography.label}>What We Do</p>
            <h2 
              className="mt-4 mb-6"
              style={tokens.typography.h2}
            >
              Full-service collaboration production
            </h2>
            <ReadableText className="max-w-[65ch] mx-auto">
              We don't just introduce athletes to brands — we plan, research, and produce
              the entire collaboration from start to finish.
            </ReadableText>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8">
              <div className="w-12 h-12 bg-[#C8F04D] flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-[#141115]">1</span>
              </div>
              <h3 
                className="mb-3"
                style={tokens.typography.h3}
              >
                Strategic Matching
              </h3>
              <ReadableText>
                We connect athletes with brands based on authentic alignment—not just follower count.
                Values, aesthetics, and audience matter.
              </ReadableText>
            </div>

            <div className="bg-white p-8">
              <div className="w-12 h-12 bg-[#C8F04D] flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-[#141115]">2</span>
              </div>
              <h3 
                className="mb-3"
                style={tokens.typography.h3}
              >
                Creative Direction
              </h3>
              <ReadableText>
                Our team develops concepts that showcase the athlete's identity while serving
                the brand's goals. Authentic storytelling that resonates.
              </ReadableText>
            </div>

            <div className="bg-white p-8">
              <div className="w-12 h-12 bg-[#C8F04D] flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-[#141115]">3</span>
              </div>
              <h3 
                className="mb-3"
                style={tokens.typography.h3}
              >
                Content Production
              </h3>
              <ReadableText>
                From shoot planning to final delivery, we handle all production logistics.
                Professional quality, start to finish.
              </ReadableText>
            </div>
          </div>
        </Container>
      </Section>

      {/* Founders Section */}
      <Section className="py-16 sm:py-20 md:py-24 lg:py-28">
        <Container>
          <div className="text-center mb-16">
            <p style={tokens.typography.label}>Leadership</p>
            <h2 
              className="mt-4"
              style={tokens.typography.h2}
            >
              Meet the founders
            </h2>
          </div>

          <Stack spacing={12}>
            {founders.map((founder, index) => (
              <MediaSplit
                key={index}
                imageSrc={founder.imageSrc}
                imageAlt={founder.name}
                imagePosition={index % 2 === 0 ? "left" : "right"}
                aspectRatio="1/1"
              >
                <Stack spacing={6}>
                  <div>
                    <h3 style={tokens.typography.h3}>{founder.name}</h3>
                    <p 
                      className="text-[#6B6870] mt-2"
                      style={tokens.typography.label}
                    >
                      {founder.role}
                    </p>
                  </div>
                  <ReadableText>{founder.bio}</ReadableText>
                  {founder.expertise && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {founder.expertise.map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-[#F5F5F5] text-xs font-semibold uppercase tracking-wider text-[#141115]"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </Stack>
              </MediaSplit>
            ))}
          </Stack>
        </Container>
      </Section>

      {/* Team Section */}
      <Section className="bg-[#F5F5F5] py-16 sm:py-20 md:py-24 lg:py-28">
        <Container>
          <div className="text-center mb-16">
            <p style={tokens.typography.label}>The Team</p>
            <h2 
              className="mt-4"
              style={tokens.typography.h2}
            >
              Working behind the scenes
            </h2>
          </div>

          <MediaGrid columns={3} gap="lg">
            {team.map((member, index) => (
              <div key={index} className="bg-white">
                <MediaImage
                  src={member.imageSrc}
                  alt={member.name}
                  aspectRatio="1/1"
                />
                <div className="p-6">
                  <h3 
                    className="text-xl mb-1"
                    style={tokens.typography.h3}
                  >
                    {member.name}
                  </h3>
                  <p 
                    className="text-[#6B6870] mb-3"
                    style={tokens.typography.label}
                  >
                    {member.role}
                  </p>
                  <ReadableText size="sm">{member.bio}</ReadableText>
                </div>
              </div>
            ))}
          </MediaGrid>
        </Container>
      </Section>

      {/* For Investors Section */}
      <Section className="py-16 sm:py-20 md:py-24 lg:py-28">
        <Container className="max-w-4xl">
          <div className="text-center">
            <p style={tokens.typography.label}>For Investors</p>
            <h2 
              className="mt-4 mb-6"
              style={tokens.typography.h2}
            >
              Building the future of athlete partnerships
            </h2>
            <Stack spacing={6} className="max-w-[65ch] mx-auto mb-8">
              <ReadableText>
                Naturehood is positioned at the intersection of sports, content creation,
                and brand marketing—a multi-billion dollar market that's rapidly evolving.
              </ReadableText>
              <ReadableText>
                We're not just a marketplace. We're a full-service production platform that
                creates tangible value for both athletes and brands through strategic
                collaboration and authentic storytelling.
              </ReadableText>
              <ReadableText>
                If you're interested in learning more about our vision, growth strategy,
                and investment opportunities, we'd love to connect.
              </ReadableText>
            </Stack>
            <a
              href="mailto:invest@naturehood.com"
              className="inline-block px-8 py-4 bg-[#141115] text-white font-semibold uppercase tracking-wider text-sm hover:bg-[#1E1B1F] transition-colors duration-200"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Get in touch
            </a>
          </div>
        </Container>
      </Section>
    </div>
  );
}

