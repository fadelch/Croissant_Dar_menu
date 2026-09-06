import "server-only";

export const ADMIN_SESSION_COOKIE_NAME = "croissant_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;
export const ADMIN_SESSION_EXPIRES_IN_MS = ADMIN_SESSION_MAX_AGE_SECONDS * 1000;

export const adminSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  priority: "high" as const,
};
