export const MAX_MENU_ITEM_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_MENU_ITEM_IMAGE_LABEL = "2 MB";

export const MENU_ITEM_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type MenuItemImageMimeType = (typeof MENU_ITEM_IMAGE_MIME_TYPES)[number];

export function isMenuItemImageMimeType(value: string): value is MenuItemImageMimeType {
  return MENU_ITEM_IMAGE_MIME_TYPES.some((type) => type === value);
}
