export const MAX_CATEGORY_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_CATEGORY_IMAGE_LABEL = "2 MB";

export const CATEGORY_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type CategoryImageMimeType = (typeof CATEGORY_IMAGE_MIME_TYPES)[number];

export function isCategoryImageMimeType(value: string): value is CategoryImageMimeType {
  return CATEGORY_IMAGE_MIME_TYPES.some((type) => type === value);
}
