import "server-only";

import { randomUUID } from "node:crypto";
import { getDownloadURL } from "firebase-admin/storage";

import type { AdminIdentity } from "@/lib/auth/session";
import { getAdminStorage } from "@/lib/firebase/admin";
import {
  isMenuItemImageMimeType,
  MAX_MENU_ITEM_IMAGE_BYTES,
  type MenuItemImageMimeType,
} from "@/lib/uploads/menu-item-image";
import { menuItemIdSchema } from "@/lib/validations/menu-item";
import { assertTrustedMenuAdmin } from "@/services/menu/admin/authorization";
import { MenuItemImageError } from "@/services/menu/admin/errors";

const IMAGE_EXTENSIONS: Record<MenuItemImageMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type StoredMenuItemImage = {
  imageUrl: string;
  imageStoragePath: string;
};

function startsWith(bytes: Uint8Array, signature: readonly number[]): boolean {
  return signature.every((value, index) => bytes[index] === value);
}

function hasValidSignature(bytes: Uint8Array, contentType: MenuItemImageMimeType): boolean {
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

function isOwnedImagePath(menuItemId: string, storagePath: string): boolean {
  const prefix = `menu-items/${menuItemId}/`;

  if (!storagePath.startsWith(prefix)) {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:jpg|png|webp)$/.test(
    storagePath.slice(prefix.length),
  );
}

export async function uploadMenuItemImage(
  admin: AdminIdentity,
  menuItemId: string,
  image: File,
): Promise<StoredMenuItemImage> {
  assertTrustedMenuAdmin(admin);
  const validMenuItemId = menuItemIdSchema.parse(menuItemId);

  if (image.size === 0) {
    throw new MenuItemImageError("empty");
  }

  if (image.size > MAX_MENU_ITEM_IMAGE_BYTES) {
    throw new MenuItemImageError("too-large");
  }

  if (!isMenuItemImageMimeType(image.type)) {
    throw new MenuItemImageError("unsupported-type");
  }

  const bytes = new Uint8Array(await image.arrayBuffer());

  if (!hasValidSignature(bytes, image.type)) {
    throw new MenuItemImageError("invalid-content");
  }

  const imageStoragePath = `menu-items/${validMenuItemId}/${randomUUID()}.${IMAGE_EXTENSIONS[image.type]}`;
  const imageFile = getAdminStorage().bucket().file(imageStoragePath);
  const downloadToken = randomUUID();

  try {
    await imageFile.save(Buffer.from(bytes), {
      resumable: false,
      contentType: image.type,
      metadata: {
        cacheControl: "public, max-age=31536000, immutable",
        metadata: { firebaseStorageDownloadTokens: downloadToken },
      },
    });
    const imageUrl = await getDownloadURL(imageFile);

    return { imageUrl, imageStoragePath };
  } catch {
    await imageFile.delete({ ignoreNotFound: true }).catch(() => undefined);
    console.error("Unable to store a menu item image.");
    throw new MenuItemImageError("storage");
  }
}

export async function removeOwnedMenuItemImage(
  admin: AdminIdentity,
  menuItemId: string,
  storagePath: string | undefined,
): Promise<void> {
  assertTrustedMenuAdmin(admin);

  if (!storagePath) {
    return;
  }

  const validMenuItemId = menuItemIdSchema.safeParse(menuItemId);

  if (!validMenuItemId.success || !isOwnedImagePath(validMenuItemId.data, storagePath)) {
    console.warn("Skipped cleanup for an invalid menu item image path.");
    return;
  }

  try {
    await getAdminStorage().bucket().file(storagePath).delete({ ignoreNotFound: true });
  } catch {
    console.warn("Unable to clean up an owned menu item image.");
  }
}
