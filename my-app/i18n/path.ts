import { routing, type AppLocale } from "./routing";

/** Strip a leading locale prefix (e.g. /zh-Hant/home → /home). */
export function stripLocalePrefix(pathname: string): {
  locale: AppLocale;
  pathname: string;
} {
  for (const locale of routing.locales) {
    if (locale === routing.defaultLocale) continue;
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      const rest = pathname.slice(locale.length + 1) || "/";
      return { locale, pathname: rest };
    }
  }
  return { locale: routing.defaultLocale, pathname };
}

/** Prefix pathname with locale when needed (as-needed strategy). */
export function withLocalePrefix(pathname: string, locale: AppLocale): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (locale === routing.defaultLocale) return path;
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}
