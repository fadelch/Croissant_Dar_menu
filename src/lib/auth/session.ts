import "server-only";

import type { DecodedIdToken } from "firebase-admin/auth";
import { cookies } from "next/headers";

import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_EXPIRES_IN_MS,
  adminSessionCookieOptions,
} from "@/lib/auth/config";
import { getAdminAuth } from "@/lib/firebase/admin";

const RECENT_SIGN_IN_MAX_AGE_SECONDS = 5 * 60;

export type AdminIdentity = {
  uid: string;
  email: string | null;
};

export type AdminSessionErrorCode = "invalid-token" | "not-admin" | "stale-authentication";

export class AdminSessionError extends Error {
  constructor(readonly code: AdminSessionErrorCode) {
    super(code);
    this.name = "AdminSessionError";
  }
}

function toAdminIdentity(token: DecodedIdToken): AdminIdentity {
  return {
    uid: token.uid,
    email: typeof token.email === "string" ? token.email : null,
  };
}

export async function createAdminSession(idToken: string): Promise<AdminIdentity> {
  let decodedToken: DecodedIdToken;

  try {
    decodedToken = await getAdminAuth().verifyIdToken(idToken, true);
  } catch {
    throw new AdminSessionError("invalid-token");
  }

  if (decodedToken.admin !== true) {
    throw new AdminSessionError("not-admin");
  }

  const authenticationAge = Math.floor(Date.now() / 1000) - decodedToken.auth_time;

  if (authenticationAge < 0 || authenticationAge > RECENT_SIGN_IN_MAX_AGE_SECONDS) {
    throw new AdminSessionError("stale-authentication");
  }

  const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
    expiresIn: ADMIN_SESSION_EXPIRES_IN_MS,
  });
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, sessionCookie, adminSessionCookieOptions);

  return toAdminIdentity(decodedToken);
}

export async function getAdminSession(): Promise<AdminIdentity | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedToken = await getAdminAuth().verifySessionCookie(sessionCookie, true);

    if (decodedToken.admin !== true) {
      return null;
    }

    return toAdminIdentity(decodedToken);
  } catch {
    return null;
  }
}

export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, "", {
    ...adminSessionCookieOptions,
    maxAge: 0,
  });
}
