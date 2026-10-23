import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { stripLocalePrefix, withLocalePrefix } from "@/i18n/path";
import type { AppLocale } from "@/i18n/routing";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

/**
 * Refresh the Supabase session and enforce auth redirects.
 * When an i18n response is provided, cookies are written onto it so locale
 * rewrites/redirects from next-intl are preserved.
 */
export async function updateSession(
  request: NextRequest,
  i18nResponse: NextResponse,
) {
  let response = i18nResponse;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              maxAge: options.maxAge ?? THIRTY_DAYS,
            }),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and getClaims().
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const { locale, pathname } = stripLocalePrefix(request.nextUrl.pathname);
  const localize = (path: string) =>
    withLocalePrefix(path, locale as AppLocale);

  const redirectTo = (path: string, next?: string) => {
    const url = request.nextUrl.clone();
    url.pathname = localize(path);
    if (next !== undefined) {
      url.search = "";
      url.searchParams.set("next", next);
    }
    const redirectResponse = NextResponse.redirect(url);
    // Preserve any auth cookies already written onto the i18n response.
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  };

  // app.naturehoodofficial.com — route to the platform regardless of path.
  // Share invites are exempt so /share/:token is not dropped.
  const host = request.headers.get("host") ?? "";
  const isSharePath = pathname === "/share" || pathname.startsWith("/share/");
  if (host.startsWith("app.") && !isSharePath) {
    const target =
      pathname === "/home" || pathname === "/login"
        ? null
        : user
          ? "/home"
          : "/login";
    if (target) return redirectTo(target);
  }

  const AUTH_PATHS = ["/login", "/signup"];
  if (user && AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    return redirectTo("/home");
  }

  const PROTECTED_PATHS = [
    "/dashboard",
    "/profile",
    "/settings",
    "/home",
    "/record",
    "/meals",
    "/events",
    "/account",
    "/my-team",
    "/share",
    "/personal",
  ];
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));

  if (!user && isProtected) {
    return redirectTo("/login", pathname + request.nextUrl.search);
  }

  return response;
}
