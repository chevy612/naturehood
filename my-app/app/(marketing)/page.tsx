import {
  HeroSection,
  ConceptSection,
  TrackAthleteSection,
  WhatWeDoSection,
  EmailSubscribe,
} from "@/app/components/sections";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <HeroSection />
      <ConceptSection />
      <TrackAthleteSection />
      <WhatWeDoSection />
      <EmailSubscribe />
    </div>
  );
}
