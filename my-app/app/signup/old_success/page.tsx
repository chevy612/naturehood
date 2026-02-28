import Image from 'next/image';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6 w-full max-w-md mx-auto px-4">
          <div className="bg-[#f5f5f5] border border-gray-600 rounded-lg w-full">
            <div className="px-6 py-6 flex flex-col gap-1.5">
              <h2 className="text-2xl font-semibold text-center">Thank you for signing up!</h2>
              <p className="text-sm text-center text-gray-500">Check your email to confirm</p>
            </div>
            <div className="px-6 pb-6 flex flex-col items-center gap-4">
              <p className="text-sm text-gray-500 text-center">
                You&apos;ve successfully signed up. Please check your email to confirm your account
                before signing in.
              </p>
              <Link
                href="/home"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
              >
                Explore now
                <span className="text-lg">›</span>
              </Link>
            </div>
            <div className="flex justify-center mb-4">
              <Image
                src="/naturehood_black.svg"
                alt="Naturehood"
                width={280}
                height={50}
                priority
                className="w-30 max-w-75"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
