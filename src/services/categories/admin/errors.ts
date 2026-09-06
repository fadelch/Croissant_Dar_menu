import "server-only";

export type CategoryServiceErrorCode =
  | "duplicate-slug"
  | "not-found"
  | "contains-menu-items"
  | "database";

export class CategoryServiceError extends Error {
  constructor(readonly code: CategoryServiceErrorCode) {
    super(code);
    this.name = "CategoryServiceError";
  }
}
