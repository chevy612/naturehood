import { HeroSection, IntroSection, HowWeWorkSection, EmailSubscribe } from "@/app/components/sections";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col justify-start gap-6">
      <HeroSection />
      <IntroSection />
      <HowWeWorkSection />
      <EmailSubscribe />
    </div>
  );
}








