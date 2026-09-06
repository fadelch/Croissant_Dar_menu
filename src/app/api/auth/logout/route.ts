import { NextResponse } from "next/server";

import { destroyAdminSession } from "@/lib/auth/session";
import { hasAllowedOrigin, OriginConfigurationError } from "@/lib/security/request-origin";

export async function POST(request: Request) {
  try {
    if (!hasAllowedOrigin(request)) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }
  } catch (error) {
    if (error instanceof OriginConfigurationError) {
      console.error("Authentication origin validation is not configured correctly.");
      return NextResponse.json(
        { error: "Authentication is temporarily unavailable." },
        { status: 503 },
      );
    }

    throw error;
  }

  await destroyAdminSession();

  return NextResponse.json({ success: true });
}
