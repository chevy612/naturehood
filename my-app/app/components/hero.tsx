import Link from 'next/link';

export default function HeroSection() {
  const videoURL = "https://jkaucsreqaywqxjwvteh.supabase.co/storage/v1/object/public/public-media/hero.mp4";
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return (
    <>
      <section className="mx-0 my-0 mb-0 w-full flex relative">
        <video
          src={videoURL}
          autoPlay={!isDevelopment}
          loop
          muted
          playsInline
          controls={isDevelopment}
          className="object-cover w-full h-[500px] md:h-[900px] opacity-20"
        />
        <div className="absolute inset-0 flex flex-col justify-start pt-[125px] md:pt-[225px] px-5">
          <div className="text-left mx-auto w-full max-w-7xl space-y-4 md:space-y-6">
            <h1 className="max-w-full md:max-w-4xl">
              The platform connect athletes and brands.
            </h1>
            <p className="text-gray-300 font-normal text-sm sm:text-base md:text-lg lg:text-xl max-w-xs sm:max-w-sm md:max-w-xl leading-relaxed">
              Build meaningful collaborations. Athletes earn through their identity. Brands gain authentic exposure.
            </p>
          </div>
          <div className="absolute bottom-70 left-0 right-0 flex flex-col items-center justify-center">
            <p className="text-sm text-gray-400 font-medium mb-3">You are</p>
            <div className="flex items-center justify-center space-x-4">
              <Link href="/signup?role=athlete">
                <button className="btn btn-primary w-44 text-sm sm:text-base md:text-lg">
                  an Athlete
                </button>
              </Link>
              <Link href="/signup?role=brand">
                <button className="btn btn-second w-44 text-sm sm:text-base md:text-lg">
                  a Brand
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}