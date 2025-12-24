import Clock from "./components/clock.js";
import EmailSubscribe from "./components/email.js";
import StickyBar from "./navigation/sticky";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col justify-start gap-6">
      <StickyBar />
      <HeroSection />
      <IntroSection />
      <EmailSubscribe />
      <Clock />
    </div>
  );
}

{
  /* hero section */
}
function HeroSection() {
  return (
    <section className="mx-0 my-0 mb-0 w-full flex bg-red-200">
      <img
        src="/image/Colin BW.webp"
        alt="Hero Image"
        className=" object-cover w-full h-[600px] md:h-[900px]"
      />
    </section>
  );
}

  function IntroSection() {
    const title = "ATHLETES as BRANDS";
    const description =
      "Naturehood supports athletes in developing content, personal branding, and digital presence—empowering them to compete not only on the track, but also in the digital space.";

    return (
      <section className="flex flex-col items-center justify-center text-center px-5 md:px-10 lg:px-40 py-10">
        <h1 className="text-[1000] md:text-[150] font-mono font-[750] mb-6">{title}</h1>
        <body className="text-lg md:text-xl font-mono font-medium max-w-4xl">
          {description}
        </body>
      </section>
    );
  }

