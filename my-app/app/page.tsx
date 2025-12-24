import Clock from "./components/clock.js";
import EmailSubscribe from "./components/email.js";
import StickyBar from "./navigation/sticky";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col justify-start gap-6 mb-6">
      <StickyBar />
      <HeroSection />
      <IntroSection />
      <EmailSubscribe />
    </div>
  );
}

{
  /* hero section */
}
function HeroSection() {
  return (
    <>
    <section className="mx-0 my-0 mb-0 w-full flex">
      <img
        src="/image/Colin BW.webp"
        alt="Hero Image"
        className=" object-cover w-full h-[600px] md:h-[900px]"
      />
    </section>
    </>
  );
}

  function IntroSection() {
    const title = "ATHLETES as BRANDS";
    const description =
      "Naturehood supports athletes in developing content, personal branding, and digital presence—empowering them to compete not only on the track, but also in the digital space.";

    return (
      <>
      <section className="flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-10 lg:px-40 py-8 md:py-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-mono font-[750] mb-4 md:mb-6 leading-tight">
          {title}
        </h1>
        <p className="text-base sm:text-lg md:text-xl font-mono font-medium max-w-4xl px-2">
          {description}
        </p>
      </section>
      </>
    );
  }

