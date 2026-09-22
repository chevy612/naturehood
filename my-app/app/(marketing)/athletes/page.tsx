"use client";

import { ContentContainer } from "@/app/components/ui/container";
import { Grid } from "@/app/components/ui/container";
import { ProfileCard } from "@/app/components/ui/profile-card";

const BASE =
  "https://jkaucsreqaywqxjwvteh.supabase.co/storage/v1/object/public/public-media/athletes";

const athletes = [
  {
    name: "Candy Tsang",
    sport: "Mid-Distance Running",
    flag: "\u{1F1ED}\u{1F1F0}",
    photo: `${BASE}/candy_tsang.jpg`,
  },
  {
    name: "Jamie Kwok",
    sport: "Track",
    flag: "\u{1F1ED}\u{1F1F0}",
    photo: `${BASE}/jamie_kwok.jpg`,
  },
  {
    name: "CURATA Christian Jay Aslio",
    sport: "Weightlifting",
    flag: "\u{1F1ED}\u{1F1F0}\u{1F1F5}\u{1F1ED}",
    photo: `${BASE}/cj.jpg`,
  }
];

export default function AthletesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <ContentContainer as="div" className="pt-32 pb-10 md:pt-40 md:pb-14">
        <div className="text-center max-w-2xl mx-auto">
          <p className="nh-label text-[#6B6870] mb-4">
            Our Athletes
          </p>
          <h1 className="nh-h1 text-black mb-5">
            Meet our athletes.
          </h1>
          <p className="nh-body text-[#6B6870]">
            Athletes competing across trail running, track, weightlifting
            and more.
          </p>
        </div>
      </ContentContainer>

      {/* Grid */}
      <ContentContainer as="div" className="pb-24">
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
      </ContentContainer>
    </div>
  );
}
