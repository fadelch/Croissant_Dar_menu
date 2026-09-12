import { type NextRequest, NextResponse } from "next/server";

import {
  defaultLocale,
  isLocale,
  localeCookieMaxAgeSeconds,
  localeCookieName,
} from "@/i18n/routing";

export function GET(request: NextRequest) {
  const requestedLocale = request.nextUrl.searchParams.get("locale") ?? undefined;
  const locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;
  const returnTo = request.nextUrl.searchParams.get("returnTo");
  const safeReturnTo = returnTo?.startsWith("/") && !returnTo.startsWith("//")
    ? returnTo
    : "/";
  // Keep the redirect relative so preview hosts, LAN testing addresses, and
  // reverse proxies do not accidentally send the user to a different host.
  const response = new NextResponse(null, {
    status: 303,
    headers: { Location: safeReturnTo },
  });

  response.cookies.set(localeCookieName, locale, {
    httpOnly: true,
    maxAge: localeCookieMaxAgeSeconds,
    path: "/",
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
  });

  return response;
}
