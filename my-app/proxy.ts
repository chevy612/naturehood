import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const handleI18nRouting = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // Negotiate locale / rewrite first, then refresh Supabase session on that response.
  const response = handleI18nRouting(request);
  return updateSession(request, response);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
