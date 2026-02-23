import Link from 'next/link';
import { Container, ButtonPrimary, ButtonSecondary } from '@/app/components/ui';
import { ReactNode } from 'react';


interface HeroTemplateProps {
  eyebrow?: string;               // Optional label above title
  title: string | ReactNode;      // Can include JSX for accent words
  subtitle: string;
  primaryCTA?: ReactNode;
  secondaryCTA?: ReactNode;
  backgroundVideo?: string;
  backgroundImage?: string;
  videoControls?: boolean;
  stats?: Array<{ value: string; label: string }>;  // Optional stats row
}

export default function HeroSection() {
  const videoURL = "https://jkaucsreqaywqxjwvteh.supabase.co/storage/v1/object/public/public-media/hero.mp4";

  return (
    <HeroTemplate
      title="Where athletes meet brands."
      subtitle="Naturehood connects dedicated athletes with forward-thinking brands to build creative projects that actually matter."
      backgroundVideo={videoURL}
      videoControls={false}
      primaryCTA={
        <div className="flex flex-col items-center w-full sm:w-auto gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/signup?role=athlete" className="w-full sm:w-auto">
              <ButtonPrimary className="w-full sm:w-auto">Join as Athlete</ButtonPrimary>
            </Link>
            <Link href="/signup?role=brand" className="w-full sm:w-auto">
              <ButtonSecondary variant='white' className="w-full sm:w-auto">Join as Brand</ButtonSecondary>
            </Link>
          </div>
        </div>
      }
    />
  );
}

export function HeroTemplate({
  eyebrow,
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
  backgroundVideo,
  backgroundImage,
  videoControls = false,
  stats,
}: HeroTemplateProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <section className="relative w-full flex h-[500px] md:h-[700px] lg:h-[900px] overflow-hidden bg-[#141115]">
      {/* Background Media */}
      {backgroundVideo && (
        <video
          src={backgroundVideo}
          autoPlay={!isDevelopment}
          loop
          muted
          playsInline
          controls={videoControls || isDevelopment}
          className="absolute inset-0 object-cover w-full h-full opacity-20"
        />
      )}
      {backgroundImage && !backgroundVideo && (
        <div
          className="absolute inset-0 w-full h-full opacity-40 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      {/* Accent Edge (optional design element) */}
      <div className="absolute top-0 left-0 w-1 h-full bg-[#C8F04D] z-10" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-start pt-20 sm:pt-28 md:pt-32 lg:pt-40 px-6 sm:px-8 md:px-12 lg:px-16">
        <Container>
          <div className="text-left max-w-4xl">

            {/* Eyebrow Label */}
            {eyebrow && (
              <p
                className="mb-5 md:mb-6"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '10px',
                  fontWeight: '600',
                  letterSpacing: '0.4em',
                  textTransform: 'uppercase',
                  color: '#C8F04D',
                }}
              >
                {eyebrow}
              </p>
            )}

            {/* Hero Title - Inter 900 ExtraBold */}
            <h1
              className="mb-7 md:mb-8"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 'clamp(2.75rem, 9vw, 6.25rem)',  // 44px - 100px
                fontWeight: '900',
                lineHeight: '0.95',
                letterSpacing: '-0.02em',
                color: '#F4F4F4',
              }}
            >
              {title}
            </h1>

            {/* Subtitle - DM Sans 400 */}
            <p
              className="mb-11 max-w-xl md:max-w-2xl"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 'clamp(0.9375rem, 2vw, 1.125rem)',  // 15px - 18px
                fontWeight: '400',
                lineHeight: '1.75',
                color: '#A09EA3',
              }}
            >
              {subtitle}
            </p>

            {/* CTAs */}
            {(primaryCTA || secondaryCTA) && (
              <div className="flex flex-col sm:flex-row gap-3 mb-14 md:mb-16">
                {primaryCTA}
                {secondaryCTA}
              </div>
            )}

            {/* Stats Row (optional) */}
            {stats && stats.length > 0 && (
              <div className="flex flex-wrap gap-8 md:gap-10 pt-8 border-t border-[#3A373C]">
                {stats.map((stat, i) => (
                  <div key={i}>
                    <div
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 'clamp(1.875rem, 4vw, 2.375rem)',  // 30px - 38px
                        fontWeight: '700',
                        lineHeight: '1',
                        letterSpacing: '-0.02em',
                        color: '#F5F5F5',
                        marginBottom: '0.25rem',
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '10px',
                        fontWeight: '500',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: '#6B6870',
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Container>
      </div>
    </section>
  );
}