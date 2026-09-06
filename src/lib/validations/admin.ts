import { Timestamp } from "firebase/firestore";
import { z } from "zod";

import type { AdminDocument } from "@/types/admin";

export const adminDocumentSchema = z.strictObject({
  email: z.string().trim().email().max(320),
  displayName: z.string().trim().min(1).max(120).optional(),
  role: z.literal("admin"),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
}) satisfies z.ZodType<AdminDocument>;
