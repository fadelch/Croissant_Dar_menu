import { NextResponse } from "next/server";

import { AdminSessionError, createAdminSession } from "@/lib/auth/session";
import { sessionRequestSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const result = sessionRequestSchema.safeParse(requestBody);

  if (!result.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    await createAdminSession(result.data.idToken);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AdminSessionError && error.code === "not-admin") {
      return NextResponse.json(
        { error: "You are not authorized to access the admin panel." },
        { status: 403 },
      );
    }

    if (error instanceof AdminSessionError && error.code === "stale-authentication") {
      return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
    }

    return NextResponse.json({ error: "Unable to create an admin session." }, { status: 401 });
  }
}
