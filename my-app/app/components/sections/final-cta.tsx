import Link from "next/link";
import { ContentContainer } from "@/app/components/ui/container";
import { ButtonPrimary } from "@/app/components/ui/buttons";

// Closing sign-up block — same action and label as the hero CTA, so the page
// asks for exactly one thing.
export default function FinalCTASection() {
  return (
    <section className="w-full bg-black mt-10 md:mt-[60px]">
      <ContentContainer as="div" className="py-16 md:py-24">
        <div className="max-w-xl mx-auto text-center flex flex-col items-center gap-6">
          <h2 className="nh-h2 text-white">Train smarter with your team</h2>
          <p
            className="text-white/60 text-[16px] max-w-md leading-relaxed"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Log training and meals with AI, and keep your coach in the loop.
          </p>
          <Link href="/signup" className="mt-2">
            <ButtonPrimary variant="white">Get started free</ButtonPrimary>
          </Link>
          <p
            className="text-white/50 text-[14px]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Already have an account?{" "}
            <Link href="/login" className="text-white underline-offset-4 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </ContentContainer>
    </section>
  );
}
