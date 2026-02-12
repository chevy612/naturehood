import Clock from "./components/clock";
import EmailSubscribe from "./components/email";
import HeroSection from "./components/hero";
import { IntroSection } from "./components/introduction";
import HowWeWorkSection from "./components/content";


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






