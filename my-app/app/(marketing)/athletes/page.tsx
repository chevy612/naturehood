"use client";

import {
  Container,
  Section,
  ReadableText,
  tokens,
  SectionHeader,
  ProfileCard,
  Grid,
} from "@/app/components/ui";

const BASE =
  "https://jkaucsreqaywqxjwvteh.supabase.co/storage/v1/object/public/public-media/athletes";

const athletes = [
  {
    name: "Candy Tsang",
    sport: "Mid-Distance Running",
    flag: "🇭🇰",
    photo: `${BASE}/candy_tsang.jpg`,
  },
  {
    name: "Jamie Kwok",
    sport: "Track",
    flag: "🇭🇰",
    photo: `${BASE}/jamie_kwok.jpg`,
  },
  {
    name: "CURATA Christian Jay Aslio",
    sport: "Weightlifting",
    flag: "🇭🇰🇵🇭",
    photo: `${BASE}/cj.jpg`,
  }
];

export default function AthletesPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Hero */}
      <Container>
        <div className="text-center max-w-160 mx-auto pt-16 pb-10 md:pt-24 md:pb-14">
          <SectionHeader content="Our Athletes" />
          <h1 className="text-[#141115] mb-5" 
              style={tokens.typography.h1}>
            Meet our athletes.
          </h1>
          <ReadableText className="text-[#6B6870]" size="sm">
            Athletes competing across trail running, track, weightlifting
            and more.
          </ReadableText>
        </div>
      </Container>

      {/* Grid */}
      <Section className="bg-[#f5f5f5] pt-4 pb-24">
        <Container>
            <Grid>
            {athletes.map((a) => (
              <ProfileCard
                key={a.name}
                layout="athlete"
                name={a.name}
                role={a.sport}
                photo={a.photo}
                country={a.flag}
              />
            ))}
          </Grid>
        </Container>
      </Section>
    </div>
  );
}
