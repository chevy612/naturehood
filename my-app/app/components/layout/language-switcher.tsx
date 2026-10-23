"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { tokens } from "@/app/components/ui/tokens";

const LOCALE_ORDER: AppLocale[] = ["en", "zh-Hant", "zh-Hans"];

type Props = {
  /** Visual variant for marketing (light on dark nav) vs platform (dark UI). */
  variant?: "marketing" | "platform";
  className?: string;
};

export default function LanguageSwitcher({
  variant = "marketing",
  className = "",
}: Props) {
  const t = useTranslations("Locale");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();

  const onChange = (next: AppLocale) => {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  };

  const isMarketing = variant === "marketing";

  return (
    <label className={`inline-flex items-center gap-2 ${className}`}>
      <span className="sr-only">{t("switchAria")}</span>
      <select
        aria-label={t("switchAria")}
        value={locale}
        onChange={(e) => onChange(e.target.value as AppLocale)}
        className={
          isMarketing
            ? "appearance-none bg-white/10 hover:bg-white/15 text-white text-[13px] font-medium rounded-full pl-3 pr-7 py-1.5 border border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 cursor-pointer"
            : "appearance-none bg-[#1E1A1F] hover:bg-[#2A262B] text-[#F5F5F5] text-[12px] font-medium rounded-lg pl-2.5 pr-6 py-1.5 border border-[#3A373C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5F5F5]/40 cursor-pointer"
        }
        style={{ fontFamily: tokens.font.body }}
      >
        {LOCALE_ORDER.filter((code) =>
          (routing.locales as readonly string[]).includes(code),
        ).map((code) => (
          <option key={code} value={code} className="text-black">
            {t(code)}
          </option>
        ))}
      </select>
    </label>
  );
}
