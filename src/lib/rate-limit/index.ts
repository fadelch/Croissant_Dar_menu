import "server-only";

import { RATE_LIMIT_POLICIES } from "@/lib/rate-limit/config";
import { configuredRateLimiter } from "@/lib/rate-limit/limiter";

export { getClientIp } from "@/lib/rate-limit/client-ip";
export { createRateLimitHeaders, RateLimitUnavailableError } from "@/lib/rate-limit/limiter";

export const authSessionLimiter = configuredRateLimiter(RATE_LIMIT_POLICIES.authSession);
