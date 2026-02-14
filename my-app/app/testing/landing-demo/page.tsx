import Link from 'next/link';
import {
  HeroTemplate,
  FeatureSection,
  StatsSection,
  CTASection,
  Container,
  Section,
  ButtonPrimary,
  ButtonSecondary,
  ButtonAccent,
} from '@/app/components/basic/basic';
import { Zap, Users, TrendingUp, Shield, Award, Target } from 'lucide-react';

export default function LandingDemo() {
  return (
    <main>
      {/* ═══════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════ */}
      <HeroTemplate
        title="Empower Athletes. Amplify Brands."
        subtitle="Join the next generation of athlete-brand partnerships. Authentic collaborations that drive real results."
        backgroundVideo="https://jkaucsreqaywqxjwvteh.supabase.co/storage/v1/object/public/public-media/hero.mp4"
        primaryCTA={
          <Link href="/signup">
            <ButtonAccent>Get Started Free</ButtonAccent>
          </Link>
        }
        secondaryCTA={
          <Link href="/about">
            <ButtonSecondary>Learn More</ButtonSecondary>
          </Link>
        }
      />

      {/* ═══════════════════════════════════════════
          FEATURES SECTION
          ═══════════════════════════════════════════ */}
      <FeatureSection
        title="Why NatureHood?"
        subtitle="Everything you need to build authentic athlete-brand partnerships"
        columns={3}
        features={[
          {
            icon: <Zap size={32} />,
            title: 'Instant Connections',
            description: 'Match with brands and athletes that align with your values and goals in seconds.',
          },
          {
            icon: <Users size={32} />,
            title: 'Verified Community',
            description: 'Join a curated network of authentic athletes and trusted brands.',
          },
          {
            icon: <TrendingUp size={32} />,
            title: 'Track Performance',
            description: 'Monitor campaign metrics and ROI with real-time analytics.',
          },
          {
            icon: <Shield size={32} />,
            title: 'Secure Payments',
            description: 'Safe and transparent payment processing for all collaborations.',
          },
          {
            icon: <Award size={32} />,
            title: 'Portfolio Building',
            description: 'Showcase your work and build credibility in the athletic community.',
          },
          {
            icon: <Target size={32} />,
            title: 'Smart Matching',
            description: 'AI-powered recommendations connect you with the perfect partners.',
          },
        ]}
      />

      {/* ═══════════════════════════════════════════
          STATS SECTION
          ═══════════════════════════════════════════ */}
      <StatsSection
        stats={[
          { value: '10K+', label: 'Active Athletes' },
          { value: '500+', label: 'Brand Partners' },
          { value: '$2M+', label: 'Earnings Paid' },
          { value: '98%', label: 'Satisfaction Rate' },
        ]}
      />

      {/* ═══════════════════════════════════════════
          HOW IT WORKS (Custom Section)
          ═══════════════════════════════════════════ */}
      <Section className="bg-[#1E1B1F]">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
              How It Works
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-[#6B6870] max-w-2xl mx-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Three simple steps to start your collaboration journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Create Profile', desc: 'Sign up and build your athlete or brand profile in minutes.' },
              { step: '02', title: 'Find Matches', desc: 'Browse opportunities or get matched with perfect partners.' },
              { step: '03', title: 'Collaborate', desc: 'Connect, create content, and grow together.' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-6xl font-bold text-[#C8F04D] mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {item.step}
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-[#6B6870]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ═══════════════════════════════════════════
          TESTIMONIALS (Custom Section)
          ═══════════════════════════════════════════ */}
      <Section>
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
              Trusted by Athletes & Brands
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Chen', role: 'Trail Runner', quote: 'NatureHood connected me with brands that truly align with my values.' },
              { name: 'Peak Performance', role: 'Sports Brand', quote: 'We found authentic athletes who genuinely love our products.' },
              { name: 'Marcus Lee', role: 'Climber', quote: 'Finally earning from doing what I love. Game changer.' },
            ].map((item, i) => (
              <div key={i} className="bg-[#1E1B1F] p-8 rounded-lg">
                <p className="text-base text-[#F5F5F5] mb-6 italic" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  "{item.quote}"
                </p>
                <div className="border-t border-[#3A373C] pt-4">
                  <p className="text-sm font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {item.name}
                  </p>
                  <p className="text-xs text-[#6B6870]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {item.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ═══════════════════════════════════════════
          FINAL CTA SECTION
          ═══════════════════════════════════════════ */}
      <CTASection
        headline="Ready to Start Your Journey?"
        subtext="Join thousands of athletes and brands building the future of sports partnerships."
        variant="dark"
        primaryCTA={
          <Link href="/signup">
            <ButtonAccent>Sign Up Now</ButtonAccent>
          </Link>
        }
        secondaryCTA={
          <Link href="/contact">
            <ButtonSecondary>Contact Sales</ButtonSecondary>
          </Link>
        }
      />
    </main>
  );
}
