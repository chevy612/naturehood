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
          <div className="mx-auto w-full max-w-7xl mt-8 sm:mt-12 md:mt-16 lg:mt-20 flex flex-col items-center justify-center">
            <label className="text-sm text-gray-400 font-light mb-3">Sign up as</label>
            <div className="flex justify-center space-x-4 sm:space-x-5 md:space-x-6 px-4 sm:px-0 my-1">
              <Link href="/signup?role=athlete">
                <button className="btn btn-primary h-7 sm:h-9 md:h-10 lg:h-12 w-24 sm:w-32 md:w-40 lg:w-48 text-xs sm:text-sm md:text-base lg:text-lg shadow-md hover:shadow-lg transition-shadow duration-150 font-inter">
                  an Athlete
                </button>
              </Link>
              <Link href="/signup?role=brand">
                <button className="btn btn-second h-7 sm:h-9 md:h-10 lg:h-12 w-24 sm:w-32 md:w-40 lg:w-48 text-xs sm:text-sm md:text-base lg:text-lg shadow-md hover:shadow-lg transition-shadow duration-150 font-inter bg-optical-white">
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