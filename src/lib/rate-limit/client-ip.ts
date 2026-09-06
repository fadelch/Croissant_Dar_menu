import "server-only";

import { isIP } from "node:net";

export const UNKNOWN_CLIENT_IP = "unknown-client";

const MAX_IP_LENGTH = 64;

type RequestWithHeaders = {
  headers: { get(name: string): string | null };
};

function removeOptionalPort(value: string): string {
  if (value.startsWith("[")) {
    const closingBracket = value.indexOf("]");

    if (closingBracket > 0) {
      const suffix = value.slice(closingBracket + 1);

      if (suffix === "" || /^:\d+$/.test(suffix)) {
        return value.slice(1, closingBracket);
      }
    }
  }

  const colonCount = (value.match(/:/g) ?? []).length;

  if (colonCount === 1) {
    const [address, port] = value.split(":");

    if (address && port && /^\d+$/.test(port)) {
      return address;
    }
  }

  return value;
}

function normalizeIp(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim().toLowerCase();

  if (!trimmed || trimmed.length > MAX_IP_LENGTH || trimmed.includes("%")) {
    return null;
  }

  const candidate = removeOptionalPort(trimmed);
  const version = isIP(candidate);

  if (version === 4) {
    return candidate;
  }

  if (version === 6) {
    try {
      return new URL(`http://[${candidate}]/`).hostname.slice(1, -1);
    } catch {
      return null;
    }
  }

  return null;
}

function firstForwardedValue(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const commaIndex = value.indexOf(",");

  return commaIndex === -1 ? value : value.slice(0, commaIndex);
}

/**
 * Uses the first x-forwarded-for value, then x-real-ip. These headers are only
 * trustworthy when the deployment proxy replaces untrusted client values.
 */
export function getClientIp(request: RequestWithHeaders): string {
  return (
    normalizeIp(firstForwardedValue(request.headers.get("x-forwarded-for"))) ??
    normalizeIp(request.headers.get("x-real-ip")) ??
    UNKNOWN_CLIENT_IP
  );
}
