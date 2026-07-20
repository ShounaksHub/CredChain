import { z } from "zod";

// ── Basic Common Types ──

export const walletAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address format (must be 42 hex chars starting with 0x)");

export const cidSchema = z
  .string()
  .min(20)
  .max(100)
  .regex(/^[a-zA-Z0-9]+$/, "Invalid CID format (alphanumeric only)");

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores");

export const signatureSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]+$/, "Invalid signature format");

export const timestampSchema = z.coerce
  .number()
  .int()
  .positive("Timestamp must be positive");

// ── Profile Payload Schema ──

export const achievementSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long").trim(),
  issuer: z.string().min(1, "Issuer is required").max(100, "Issuer is too long").trim(),
  date: z.string().min(1, "Date is required").max(50, "Date is too long").trim(),
}).strict();

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long").trim(),
  description: z.string().max(500, "Description is too long").trim().optional().default(""),
  tags: z.array(z.string().min(1).max(30).trim()).max(20, "Too many tags").default([]),
}).strict();

export const socialsSchema = z.object({
  github: z.string().max(100).trim().optional().default(""),
  linkedin: z.string().max(100).trim().optional().default(""),
  portfolio: z.string().max(200).trim().optional().default(""),
}).strict();

export const profileSchema = z.object({
  username: usernameSchema,
  fullName: z.string().min(1, "Full name is required").max(100, "Full name is too long").trim(),
  university: z.string().min(1, "University is required").max(100, "University is too long").trim(),
  department: z.string().min(1, "Department is required").max(100, "Department is too long").trim(),
  graduationYear: z.coerce.number().int().min(1950).max(2100),
  bio: z.string().max(500, "Bio is too long").trim().optional().default(""),
  skills: z.array(z.string().min(1).max(50).trim()).max(50, "Too many skills").default([]),
  achievements: z.array(achievementSchema).max(20, "Too many achievements").default([]),
  projects: z.array(projectSchema).max(20, "Too many projects").default([]),
  socials: socialsSchema.default({ github: "", linkedin: "", portfolio: "" }),
}).strict();

/**
 * Validates data against a schema and throws a structured error if invalid.
 * Uses generic parsing so we return proper 400 Bad Request messages.
 */
export function validateZod<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const messages = result.error.issues.map((err: any) => `${err.path.join(".")}: ${err.message}`).join("; ");
    throw new Error(`Validation Error: ${messages}`);
  }
  return result.data;
}
