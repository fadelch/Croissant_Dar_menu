import "server-only";

import { randomUUID } from "node:crypto";
import { getDownloadURL } from "firebase-admin/storage";

import type { AdminIdentity } from "@/lib/auth/session";
import { getAdminStorage } from "@/lib/firebase/admin";
import {
  MAX_CATEGORY_IMAGE_BYTES,
  type CategoryImageMimeType,
} from "@/lib/uploads/category-image";
import { assertTrustedAdmin } from "@/services/categories/admin/authorization";

const IMAGE_EXTENSIONS: Record<CategoryImageMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type CategoryImageUploadErrorCode =
  | "empty"
  | "too-large"
  | "invalid-content"
  | "storage";

export class CategoryImageUploadError extends Error {
  constructor(readonly code: CategoryImageUploadErrorCode) {
    super(code);
    this.name = "CategoryImageUploadError";
  }
}

function startsWith(bytes: Uint8Array, signature: readonly number[]): boolean {
  return signature.every((value, index) => bytes[index] === value);
}

function hasValidSignature(bytes: Uint8Array, contentType: CategoryImageMimeType): boolean {
  if (contentType === "image/jpeg") {
    return startsWith(bytes, [0xff, 0xd8, 0xff]);
  }

  if (contentType === "image/png") {
    return startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  }

  return (
    bytes.length >= 12 &&
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(bytes.subarray(8), [0x57, 0x45, 0x42, 0x50])
  );
}

export async function uploadCategoryImage(
  admin: AdminIdentity,
  bytes: Uint8Array,
  contentType: CategoryImageMimeType,
): Promise<string> {
  assertTrustedAdmin(admin);

  if (bytes.length === 0) {
    throw new CategoryImageUploadError("empty");
  }

  if (bytes.length > MAX_CATEGORY_IMAGE_BYTES) {
    throw new CategoryImageUploadError("too-large");
  }

  if (!hasValidSignature(bytes, contentType)) {
    throw new CategoryImageUploadError("invalid-content");
  }

  const bucket = getAdminStorage().bucket();
  const objectPath = `category-images/${randomUUID()}.${IMAGE_EXTENSIONS[contentType]}`;
  const downloadToken = randomUUID();
  const imageFile = bucket.file(objectPath);

  try {
    await imageFile.save(Buffer.from(bytes), {
      resumable: false,
      contentType,
      metadata: {
        cacheControl: "public, max-age=31536000, immutable",
        metadata: { firebaseStorageDownloadTokens: downloadToken },
      },
    });
  } catch {
    console.error("Unable to store a category image.");
    throw new CategoryImageUploadError("storage");
  }

  return getDownloadURL(imageFile);
}
