import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

/**
 * Standalone Prisma client for CLI scripts (matches app adapter setup).
 */
export function createScriptPrisma() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env or .env.local before importing modules."
    )
  }

  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({
    adapter,
    log: process.env.IMPORT_VERBOSE === "1" ? ["error", "warn"] : ["error"],
  })
}
