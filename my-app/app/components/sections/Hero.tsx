import Link from 'next/link';
import { HeroTemplate, ButtonPrimary, ButtonSecondary } from '@/app/components/basic/basic';

export default function HeroSection() {
  const videoURL = "https://jkaucsreqaywqxjwvteh.supabase.co/storage/v1/object/public/public-media/hero.mp4";

  return (
    <HeroTemplate
      title="Where athletes meet brands."
      subtitle="Naturehood connects dedicated athletes with forward-thinking brands to build creative projects that actually matter."
      backgroundVideo={videoURL}
      videoControls={false}
      primaryCTA={
        <div className="flex flex-col items-center w-full sm:w-auto gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/signup?role=athlete" className="w-full sm:w-auto">
              <ButtonPrimary className="w-full sm:w-auto">Join as Athlete</ButtonPrimary>
            </Link>
            <Link href="/signup?role=brand" className="w-full sm:w-auto">
              <ButtonSecondary variant='white' className="w-full sm:w-auto">Join as Brand</ButtonSecondary>
            </Link>
          </div>
        </div>
      }
    />
  );
}