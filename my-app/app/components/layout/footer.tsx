import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { ContentContainer } from "@/app/components/ui/container";
import { Instagram, Youtube, Linkedin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import LanguageSwitcher from "@/app/components/layout/language-switcher";

const socialLinks = [
  {
    icon: Instagram,
    href: "https://instagram.com/naturehood.official",
    label: "Instagram",
  },
  {
    icon: Youtube,
    href: "https://www.youtube.com/@naturehood.official",
    label: "YouTube",
  },
  {
    icon: Linkedin,
    href: "https://linkedin.com/company/naturehood-official",
    label: "LinkedIn",
  },
];

export default async function Footer() {
  const t = await getTranslations("Footer");
  const currentYear = new Date().getFullYear();

  const legalLinks = [
    { label: t("privacy"), href: "/privacy" as const },
    { label: t("terms"), href: "/terms" as const },
    { label: t("cookies"), href: "/cookies" as const },
  ];

  return (
    <footer className="bg-black border-t border-white/10">
      <ContentContainer
        as="div"
        className="py-12 md:py-16"
        maxWidth="max-w-[1370px]"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          <div className="flex flex-col gap-4">
            <Link href="/" className="inline-block">
              <Image
                src="/naturehood.svg"
                alt="Naturehood"
                width={140}
                height={18}
                className="w-[140px] h-auto"
              />
            </Link>
            <p
              className="text-[13px] text-white/40 max-w-xs leading-relaxed"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {t("tagline")}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                aria-label={social.label}
              >
                <social.icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10">
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <p className="text-[12px] text-white/30">
              {t("rights", { year: currentYear })}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[12px] text-white/30 hover:text-white/60 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <LanguageSwitcher variant="marketing" />
              <span className="text-[12px] text-white/30">{t("madeIn")}</span>
            </div>
          </div>
        </div>
      </ContentContainer>
    </footer>
  );
}
