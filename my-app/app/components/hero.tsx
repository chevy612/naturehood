

export default function HeroSection() {
  const videoURL = "https://jkaucsreqaywqxjwvteh.supabase.co/storage/v1/object/public/public-media/hero.mp4";
  return (
    <>
      <section className="mx-0 my-0 mb-0 w-full flex relative">
        <video
          src={videoURL}
          autoPlay
          loop
          muted
          playsInline
          className="object-cover w-full h-[500px] md:h-[900px] opacity-50"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 lg:gap-8 mx-auto w-full max-w-7xl">
            <div className="text-center ">
              <p className="font-extrabold text-lg sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl whitespace-nowrap">
                Performance
              </p>
            </div>
            <div className="text-center ">
              <p className="font-extrabold text-lg sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl whitespace-nowrap">
                Storytelling
              </p>
            </div>
            <div className="text-center ">
              <p className="font-extrabold text-lg sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl whitespace-nowrap">
                Opportunity
              </p>
            </div>
            <div className="col-span-3 text-center mt-2 sm:mt-3 md:mt-5 lg:mt-5">
              <p className="font-bold text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl whitespace-nowrap">
                - All in one place
              </p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1/3 flex flex-col items-center justify-start">
          <button className="btn btn-primary mt-6 sm:mt-8 md:mt-10 text-sm sm:text-base md:text-lg px-4 text-amber-">
            Join Us Now
          </button>
          </div>
        </div>
      </section>
    </>
  );
}