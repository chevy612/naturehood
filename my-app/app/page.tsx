
import Clock from "./components/clock.js";
import EmailSubscribe from "./components/email.js";
import StickyBar from "./navigation/sticky";


export default function Page() {
  return (
      <div className="min-h-screen flex flex-col justify-start gap-6">
        <StickyBar />
        <HeroSection />
        <EmailSubscribe />
        <Clock />
      </div>
  );
}

{/* hero section */}
function HeroSection(){
  return (
    <section className="mx-auto w-full max-w-6xl h-[70vh] min-h-[520px]">
      <img src ='/image/Colin BW.webp' alt= 'Hero Image' className="h-full w-full object-cover"/>
    </section>
  )
}