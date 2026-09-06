import { z } from "zod";

export const adminLoginSchema = z.strictObject({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const sessionRequestSchema = z.strictObject({
  idToken: z.string().min(1).max(10_000),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
