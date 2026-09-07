import { NextResponse } from "next/server";

import {
  AdminAuthorizationError,
  requireAdminAction,
} from "@/lib/auth/require-admin";
import {
  createRateLimitHeaders,
  getClientIp,
  RateLimitUnavailableError,
  uploadLimiter,
} from "@/lib/rate-limit";
import { hasAllowedOrigin, OriginConfigurationError } from "@/lib/security/request-origin";
import {
  isCategoryImageMimeType,
  MAX_CATEGORY_IMAGE_BYTES,
  MAX_CATEGORY_IMAGE_LABEL,
} from "@/lib/uploads/category-image";
import {
  CategoryImageUploadError,
  uploadCategoryImage,
} from "@/services/categories/admin/upload-category-image";

export const runtime = "nodejs";

class RequestBodyTooLargeError extends Error {}

async function readRequestBody(request: Request): Promise<Uint8Array> {
  if (!request.body) {
    return new Uint8Array();
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    totalBytes += value.byteLength;

    if (totalBytes > MAX_CATEGORY_IMAGE_BYTES) {
      await reader.cancel();
      throw new RequestBodyTooLargeError();
    }

    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return body;
}

export async function POST(request: Request) {
  try {
    if (!hasAllowedOrigin(request)) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }
  } catch (error) {
    if (error instanceof OriginConfigurationError) {
      return NextResponse.json(
        { error: "Image uploads are temporarily unavailable." },
        { status: 503 },
      );
    }

    throw error;
  }

  let admin;

  try {
    admin = await requireAdminAction();
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      return NextResponse.json({ error: "Administrator access is required." }, { status: 401 });
    }

    throw error;
  }

  let rateLimitResult;

  try {
    rateLimitResult = await uploadLimiter.limit(
      `admin:${admin.uid}:ip:${getClientIp(request)}`,
    );
  } catch (error) {
    if (error instanceof RateLimitUnavailableError) {
      return NextResponse.json(
        { error: "Image uploads are temporarily unavailable." },
        { status: 503 },
      );
    }

    throw error;
  }

  const rateLimitHeaders = createRateLimitHeaders(rateLimitResult, !rateLimitResult.success);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many images were uploaded. Please wait before trying again." },
      { status: 429, headers: rateLimitHeaders },
    );
  }

  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim() ?? "";

  if (!isCategoryImageMimeType(contentType)) {
    return NextResponse.json(
      { error: "Choose a JPEG, PNG, or WebP image." },
      { status: 415, headers: rateLimitHeaders },
    );
  }

  const contentLength = request.headers.get("content-length");

  if (
    contentLength &&
    (!/^\d+$/.test(contentLength) || Number(contentLength) > MAX_CATEGORY_IMAGE_BYTES)
  ) {
    return NextResponse.json(
      { error: `The image must be ${MAX_CATEGORY_IMAGE_LABEL} or smaller.` },
      { status: 413, headers: rateLimitHeaders },
    );
  }

  try {
    const bytes = await readRequestBody(request);
    const imageUrl = await uploadCategoryImage(admin, bytes, contentType);

    return NextResponse.json({ imageUrl }, { headers: rateLimitHeaders });
  } catch (error) {
    if (
      error instanceof RequestBodyTooLargeError ||
      (error instanceof CategoryImageUploadError && error.code === "too-large")
    ) {
      return NextResponse.json(
        { error: `The image must be ${MAX_CATEGORY_IMAGE_LABEL} or smaller.` },
        { status: 413, headers: rateLimitHeaders },
      );
    }

    if (error instanceof CategoryImageUploadError && error.code === "empty") {
      return NextResponse.json(
        { error: "Choose an image before uploading." },
        { status: 400, headers: rateLimitHeaders },
      );
    }

    if (error instanceof CategoryImageUploadError && error.code === "invalid-content") {
      return NextResponse.json(
        { error: "The selected file content is not a valid image." },
        { status: 415, headers: rateLimitHeaders },
      );
    }

    return NextResponse.json(
      { error: "Unable to upload the image. Please try again." },
      { status: 503, headers: rateLimitHeaders },
    );
  }
}
