import { z } from "zod"

const shouldSkipValidation = process.env.SKIP_ENV_VALIDATION?.toLowerCase() === "true"

// Runtime environment variables validation.
// We parse lazily (via `getEnv`) to avoid crashing during `next build` when
// env vars are not present yet (common in some CI/dev setups).
const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .optional()
      .default("development"),

    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

    // OAuth vars are validated only when auth is initialized, so Prisma
    // commands like `prisma generate` / `prisma migrate` don't require them.
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

    NEXTAUTH_URL: z.string().url().optional(),
    NEXTAUTH_SECRET: z.string().min(1).optional(),
  })
  .superRefine((val, ctx) => {
    // In production, NextAuth requires a secret.
    if (val.NODE_ENV === "production" && !val.NEXTAUTH_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["NEXTAUTH_SECRET"],
        message: "NEXTAUTH_SECRET is required in production",
      })
    }
  })

export type Env = z.infer<typeof envSchema>

let cached: Env | null = null

export function getEnv(): Env {
  if (cached) return cached
  if (shouldSkipValidation) return (process.env as unknown as Env)

  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("\n")
    throw new Error(`Invalid environment variables:\n${issues}`)
  }

  cached = parsed.data
  return cached
}

export function getGoogleAuthEnv() {
  const env = getEnv()

  const missing: string[] = []
  if (!env.GOOGLE_CLIENT_ID) missing.push("GOOGLE_CLIENT_ID")
  if (!env.GOOGLE_CLIENT_SECRET) missing.push("GOOGLE_CLIENT_SECRET")

  if (missing.length > 0) {
    console.warn(`[Auth] Missing Google OAuth environment variables: ${missing.join(", ")}. Google sign-in will not work.`)
    // Return env with empty strings to prevent crash during initialization
    return {
      ...env,
      GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID || "",
      GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET || "",
    }
  }

  return env
}

