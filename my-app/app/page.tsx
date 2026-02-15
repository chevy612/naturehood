import Clock from "./components/clock";
import EmailSubscribe from "./components/email";  
import HeroSection from "./components/sections/Hero";
import { IntroSection } from "./components/introduction";
import HowWeWorkSection from "./components/sections/HowWeWork";


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






