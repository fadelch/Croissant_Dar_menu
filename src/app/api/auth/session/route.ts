import { NextResponse } from "next/server";

import { AdminSessionError, createAdminSession } from "@/lib/auth/session";
import {
  authSessionLimiter,
  createRateLimitHeaders,
  getClientIp,
  RateLimitUnavailableError,
} from "@/lib/rate-limit";
import { hasAllowedOrigin, OriginConfigurationError } from "@/lib/security/request-origin";
import { SESSION_REQUEST_MAX_BYTES, sessionRequestSchema } from "@/lib/validations/auth";

const RATE_LIMIT_ERROR = "Too many attempts. Please try again later.";
const SERVICE_UNAVAILABLE_ERROR = "Authentication is temporarily unavailable.";

function hasAcceptableContentLength(request: Request): boolean {
  const contentLength = request.headers.get("content-length");

  if (!contentLength) {
    return true;
  }

  return /^\d+$/.test(contentLength) && Number(contentLength) <= SESSION_REQUEST_MAX_BYTES;
}

export async function POST(request: Request) {
  try {
    if (!hasAllowedOrigin(request)) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }
  } catch (error) {
    if (error instanceof OriginConfigurationError) {
      console.error("Authentication origin validation is not configured correctly.");
      return NextResponse.json({ error: SERVICE_UNAVAILABLE_ERROR }, { status: 503 });
    }

    throw error;
  }

  let rateLimitResult;

  try {
    rateLimitResult = await authSessionLimiter.limit(`ip:${getClientIp(request)}`);
  } catch (error) {
    if (error instanceof RateLimitUnavailableError) {
      return NextResponse.json({ error: SERVICE_UNAVAILABLE_ERROR }, { status: 503 });
    }

    throw error;
  }

  const rateLimitHeaders = createRateLimitHeaders(rateLimitResult, !rateLimitResult.success);

  if (!rateLimitResult.success) {
    console.warn("Rate limit exceeded for auth session endpoint.");

    return NextResponse.json(
      { error: RATE_LIMIT_ERROR },
      { status: 429, headers: rateLimitHeaders },
    );
  }

  if (!hasAcceptableContentLength(request)) {
    return NextResponse.json(
      { error: "Request body is too large." },
      { status: 413, headers: rateLimitHeaders },
    );
  }

  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400, headers: rateLimitHeaders },
    );
  }

  const result = sessionRequestSchema.safeParse(requestBody);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400, headers: rateLimitHeaders },
    );
  }

  try {
    await createAdminSession(result.data.idToken);

    return NextResponse.json({ success: true }, { headers: rateLimitHeaders });
  } catch (error) {
    if (error instanceof AdminSessionError && error.code === "not-admin") {
      return NextResponse.json(
        { error: "You are not authorized to access the admin panel." },
        { status: 403, headers: rateLimitHeaders },
      );
    }

    if (error instanceof AdminSessionError && error.code === "stale-authentication") {
      return NextResponse.json(
        { error: "Please sign in again." },
        { status: 401, headers: rateLimitHeaders },
      );
    }

    return NextResponse.json(
      { error: "Unable to create an admin session." },
      { status: 401, headers: rateLimitHeaders },
    );
  }
}
