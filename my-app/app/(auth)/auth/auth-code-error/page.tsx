import Link from "next/link";

export default function AuthCodeError() {
  return (
    <div className="min-h-screen bg-[#141115] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <p
          className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#FF4D4D] mb-3"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Authentication Error
        </p>
        <h1
          className="text-[36px] sm:text-[44px] font-bold text-white leading-none mb-4"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Something went wrong
        </h1>
        <p
          className="text-[15px] text-[#6B6870] leading-relaxed mb-10"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          We couldn&apos;t complete the sign-in process. This can happen if the
          request expired or was cancelled. Please try again.
        </p>
        <Link
          href="/login"
          className="inline-block bg-white text-black px-8 py-3.5 rounded-full text-[14px] font-semibold hover:bg-white/90 transition-colors duration-200"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Back to Log In
        </Link>
      </div>
    </div>
  );
}
