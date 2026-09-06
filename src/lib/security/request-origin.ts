import "server-only";

import { z } from "zod";

const httpUrlSchema = z.url().refine((value) => {
  const protocol = new URL(value).protocol;

  return protocol === "http:" || protocol === "https:";
});

export class OriginConfigurationError extends Error {
  constructor() {
    super("The application origin is not configured correctly.");
    this.name = "OriginConfigurationError";
  }
}

function firstHeaderValue(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const commaIndex = value.indexOf(",");

  return (commaIndex === -1 ? value : value.slice(0, commaIndex)).trim();
}

function getExpectedOrigin(request: Request): string {
  const configuredUrl = process.env.APP_URL?.trim();

  if (configuredUrl) {
    const result = httpUrlSchema.safeParse(configuredUrl);

    if (!result.success) {
      throw new OriginConfigurationError();
    }

    return new URL(result.data).origin;
  }

  const host =
    firstHeaderValue(request.headers.get("x-forwarded-host")) ?? request.headers.get("host");
  const forwardedProtocol = firstHeaderValue(request.headers.get("x-forwarded-proto"));
  const protocol = forwardedProtocol ?? new URL(request.url).protocol.slice(0, -1);

  if (!host || (protocol !== "http" && protocol !== "https")) {
    throw new OriginConfigurationError();
  }

  const fallbackUrl = `${protocol}://${host}`;
  const result = httpUrlSchema.safeParse(fallbackUrl);

  if (!result.success || new URL(result.data).origin !== fallbackUrl) {
    throw new OriginConfigurationError();
  }

  return fallbackUrl;
}

export function hasAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");

  if (!origin) {
    return false;
  }

  try {
    return new URL(origin).origin === origin && origin === getExpectedOrigin(request);
  } catch (error) {
    if (error instanceof OriginConfigurationError) {
      throw error;
    }

    return false;
  }
}
