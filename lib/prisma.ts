import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

// Avoid creating multiple PrismaClient instances during hot reloads in dev.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

let prismaSingleton: PrismaClient | undefined = undefined

export function getPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma
  if (prismaSingleton) return prismaSingleton

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("Missing DATABASE_URL. Set it in your .env.local file.")
  }

  const adapter = new PrismaPg({ connectionString })

  const created = new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  })

  prismaSingleton = created
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = created
  }

  return created
}

