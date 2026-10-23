import { getLocale } from "next-intl/server";
import { redirect as intlRedirect } from "./navigation";

/** Locale-aware redirect for Server Components / Server Actions (next-intl v4). */
export async function redirect(href: string): Promise<never> {
  const locale = await getLocale();
  return intlRedirect({ href, locale });
}
