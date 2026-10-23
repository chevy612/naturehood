import Image from "next/image";
import { ContentContainer } from "@/app/components/ui/container";
import { ButtonPrimary } from "@/app/components/ui/buttons";

type ProfilePhotoProps = {
  src: string;
  name: string;
  role: string;
  /** e.g. "50% 25%" — adjusts which area of the photo is visible */
  objectPosition?: string;
  /** 1 = no zoom, 1.2 = 20% closer (crops tighter). Hover adds a further 5%. */
  zoom?: number;
  /** width/height ratio, e.g. "2/3" (approved slot). Smaller = taller. Overrides the variant default. */
  aspectRatio?: string;
  /** extra classes on the outer element — e.g. responsive `order-*` for grid position */
  className?: string;
  variant?: "founder" | "athlete";
  /** when set, the whole card becomes a link to this Instagram profile */
  instagramUrl?: string;
};

function ProfilePhoto({
  src,
  name,
  role,
  objectPosition = "50% 50%",
  zoom = 1,
  aspectRatio,
  className = "",
  variant = "founder",
  instagramUrl,
}: ProfilePhotoProps) {
  const v =
    variant === "founder"
      ? {
          // NAT-7 approved slot: tall profile 2/3 (was 284/730)
          aspect: "2/3",
          rounded: "rounded-[30px]",
          // base render width (vw) per breakpoint, before zoom
          base: { mobile: 50, desktop: 25, breakpoint: 768 },
        }
      : {
          // NAT-7 approved slot: portrait card 4/5 (athlete / discover cards)
          aspect: "4/5",
          rounded: "rounded-2xl",
          base: { mobile: 100, desktop: 33, breakpoint: 640 },
        };

  // Factor the CSS zoom into `sizes` so next/image fetches a high-enough
  // resolution source (it can't see the transform: scale() on its own).
  // OVERSCAN also compensates for `object-cover`: a wide/landscape photo
  // dropped into a tall frame gets scaled up several times over, so the
  // pixels actually rendered are far larger than the frame width implies.
  const OVERSCAN = 4;
  const vw = (n: number) => Math.min(100, Math.ceil(n * zoom * OVERSCAN));
  const sizes = `(max-width: ${v.base.breakpoint}px) ${vw(
    v.base.mobile
  )}vw, ${vw(v.base.desktop)}vw`;

  const figure = (
    <figure
      className={`group relative overflow-hidden ${v.rounded} bg-[#F5F5F5] ${
        instagramUrl ? "" : className
      }`}
      style={{ aspectRatio: (aspectRatio ?? v.aspect).replace("/", " / ") }}
    >
      <Image
        src={src}
        alt={name}
        fill
        sizes={sizes}
        quality={100}
        style={{ objectPosition, transformOrigin: objectPosition, ["--zoom" as string]: zoom }}
        className="object-cover transition-transform duration-500 scale-[var(--zoom)] group-hover:scale-[calc(var(--zoom)*1.05)]"
      />
      {/* Caption: rendered only when named — the unnamed mosaic photos stay clean.
          Always visible on touch/mobile, hover-reveal from lg up. */}
      {name && (
        <figcaption className="absolute inset-0 flex items-end bg-gradient-to-t from-[#141115]/80 via-[#141115]/20 to-transparent opacity-100 transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100">
          <div
            className="p-4 sm:p-5"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <p className="text-[16px] font-semibold leading-tight text-white">
              {name}
            </p>
            {role && (
              <p
                className="mt-1.5 text-[11px] font-normal uppercase tracking-[0.04em] text-white/70"
                style={{ fontFamily: "'Sk Modernist', sans-serif" }}
              >
                {role}
              </p>
            )}
          </div>
        </figcaption>
      )}
    </figure>
  );

  if (instagramUrl) {
    return (
      <a
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={name ? `${name} on Instagram` : "Instagram"}
        className={`block ${className}`}
      >
        {figure}
      </a>
    );
  }

  return figure;
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Our Story */}
      <section className="pt-24 pb-10 md:pt-32 md:pb-0">
        <ContentContainer as="div" maxWidth="max-w-[1370px]">
          <div className="max-w-[900px] mx-auto">
            <h1 className="nh-h1 text-center mb-10">Our Story</h1>
            <div className="nh-body space-y-6">
              <p>
                Founded in 2025 by a community of Hong Kong track athletes,
                Naturehood was born out of a shared passion: to redefine how the
                world sees Track and Field.
              </p>
              <p>
                What started as a mission to broaden the public&apos;s appreciation
                for the sport quickly evolved into something larger. By
                highlighting local athletes and capturing the raw energy of Hong
                Kong&rsquo;s athletic meets, we built a unique narrative
                style&mdash;shaping track and field not just as a sport, but as a
                lifestyle and a cultural movement.
              </p>
              <p>
                Today, Naturehood continues to expand its network, bringing you
                behind the scenes to showcase the passion, grit, and culture of
                the athletic community.
              </p>
            </div>
          </div>
        </ContentContainer>
      </section>

      {/* Founders */}
      <section className="py-[50px] md:py-[80px]">
        <ContentContainer as="div" maxWidth="max-w-[1370px]">
          <h2 className="nh-h2 text-center mb-[30px]">Founders</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-[30px]">
            <ProfilePhoto
              src="https://vddlfdngjtcoxcyuvkbd.supabase.co/storage/v1/object/sign/Website/founder/chevy-1.png?token=eyJraWQiOiI3MWMxN2QwNS00NjExLTQyMmEtYmI1YS1jYjcyMzc1MGY0OTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJXZWJzaXRlL2ZvdW5kZXIvY2hldnktMS5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg5NjIxOTI0LCJleHAiOjQ5MTE2ODU5MjR9.49aLQLykq7n7HxePUz3n9KVQwCIuZhwkvS1035rL0og"
              name="Chevy Cheung"
              role="Product"
              objectPosition="36.5% 34%"
              zoom={2.5}
              className="md:order-2"
              instagramUrl="https://www.instagram.com/j.ccman/"
            />
            <ProfilePhoto
              src="https://vddlfdngjtcoxcyuvkbd.supabase.co/storage/v1/object/sign/Website/founder/colin-1.png?token=eyJraWQiOiI3MWMxN2QwNS00NjExLTQyMmEtYmI1YS1jYjcyMzc1MGY0OTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJXZWJzaXRlL2ZvdW5kZXIvY29saW4tMS5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg5NjIyMTkxLCJleHAiOjQ5MTE2ODYxOTF9.BcW9XU4XxsrCDvjvkxmxF_Vhi_0AIedGyIIwFSntous"
              name="Colin Cheung"
              role="Creative"
              objectPosition="91.5% 10%"
              zoom={1.0}
              className="md:order-3"
              instagramUrl="https://www.instagram.com/ccwcolin/"
            />
            <ProfilePhoto
              src="https://vddlfdngjtcoxcyuvkbd.supabase.co/storage/v1/object/sign/Website/founder/chevy-2.png?token=eyJraWQiOiI3MWMxN2QwNS00NjExLTQyMmEtYmI1YS1jYjcyMzc1MGY0OTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJXZWJzaXRlL2ZvdW5kZXIvY2hldnktMi5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg5NjIyNTM4LCJleHAiOjQ5MTE2ODY1Mzh9.mW8lqNxQlpOWNkaIOxlOB8h5uiJN-KU2hqAUJOiFrRI"
              name=""
              role=""
              objectPosition="40% 0%"
              zoom={1.6}
              className="md:order-1"
            />
            <ProfilePhoto
              src="https://vddlfdngjtcoxcyuvkbd.supabase.co/storage/v1/object/sign/Website/founder/colin-2.png?token=eyJraWQiOiI3MWMxN2QwNS00NjExLTQyMmEtYmI1YS1jYjcyMzc1MGY0OTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJXZWJzaXRlL2ZvdW5kZXIvY29saW4tMi5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg5NjI0NjY3LCJleHAiOjQ5MTE2ODg2Njd9.bWHQdxhcCT9iXw2tTtbTyVyO6zdeLxrgMFS6GGdvUBc"
              name= ""
              role=""
              objectPosition="70% 100%"
              zoom={1.15}
              className="md:order-4"
            />
          </div>
        </ContentContainer>
      </section>

      {/* Call to action */}
      <section className="py-12 md:py-16">
        <ContentContainer as="div" maxWidth="max-w-[1370px]">
          <div className="flex justify-center">
            <a
              href="mailto:hello@naturehoodofficial.com?subject=I%27d%20like%20more%20information&body=Hi%20Naturehood%20team%2C%0A%0AI%27d%20like%20to%20learn%20more%20about%20Naturehood.%0A%0AThanks%2C%0A"
              className="inline-block"
            >
              <ButtonPrimary>Talk to us</ButtonPrimary>
            </a>
          </div>
        </ContentContainer>
      </section>

      {/* Featuring Athletes */}
      <section id="featuring-athletes" className="scroll-mt-28 py-[50px] md:py-[80px] pb-24">
        <ContentContainer as="div" maxWidth="max-w-[1370px]">
          <h2 className="nh-h2 text-center mb-10">Featuring Athletes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-[30px]">
            <ProfilePhoto
              variant="athlete"
              src="/about/athlete-2.png"
              name="Alton Kwok"
              role="Sprinter"
              objectPosition="50% 30%"
              instagramUrl="https://www.instagram.com/altonkwok.track/"
            />
            <ProfilePhoto
              variant="athlete"
              src="/about/athlete-3.png"
              name="Jamie Kwok"
              role="Sprinter"
              objectPosition="100% 100%"
              instagramUrl="https://www.instagram.com/jamie.sprints/"
            />
            <ProfilePhoto
              variant="athlete"
              src="https://vddlfdngjtcoxcyuvkbd.supabase.co/storage/v1/object/sign/Website/featuring%20athletes/candy.png?token=eyJraWQiOiI3MWMxN2QwNS00NjExLTQyMmEtYmI1YS1jYjcyMzc1MGY0OTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJXZWJzaXRlL2ZlYXR1cmluZyBhdGhsZXRlcy9jYW5keS5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzkwMDg5NjQ3LCJleHAiOjQ5MTIxNTM2NDd9.hDq7tNva4_GBA5DvuR9sYb_oxCpqwyCDVuCNZ9xDYGo"
              name="Candy Tsang"
              role="Mid-Distance Runner"
              objectPosition="50% 25%"
              instagramUrl="https://www.instagram.com/hiutung.gameon/"
            />
          </div>
        </ContentContainer>
      </section>
    </div>
  );
}
