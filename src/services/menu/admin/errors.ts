import "server-only";

export type MenuItemServiceErrorCode =
  | "not-found"
  | "category-not-found"
  | "database";

export class MenuItemServiceError extends Error {
  constructor(readonly code: MenuItemServiceErrorCode) {
    super(code);
    this.name = "MenuItemServiceError";
  }
}

export type MenuItemImageErrorCode =
  | "empty"
  | "too-large"
  | "unsupported-type"
  | "invalid-content"
  | "storage";

export class MenuItemImageError extends Error {
  constructor(readonly code: MenuItemImageErrorCode) {
    super(code);
    this.name = "MenuItemImageError";
  }
}
