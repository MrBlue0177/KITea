import { getPrisma } from "@/lib/prisma"

const DAILY_REVIEW_LIMIT = 10
const MIN_SECONDS_BETWEEN_SUBMISSIONS = 60

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; message: string }

export async function checkReviewSubmissionRateLimit(
  userId: string
): Promise<RateLimitResult> {
  const prisma = getPrisma()
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const [recentCount, lastReview] = await Promise.all([
    prisma.review.count({
      where: { userId, createdAt: { gte: oneDayAgo } },
    }),
    prisma.review.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ])

  if (recentCount >= DAILY_REVIEW_LIMIT) {
    return {
      allowed: false,
      message: `You can submit up to ${DAILY_REVIEW_LIMIT} reviews per day. Try again tomorrow.`,
    }
  }

  if (lastReview) {
    const secondsSince =
      (Date.now() - lastReview.createdAt.getTime()) / 1000
    if (secondsSince < MIN_SECONDS_BETWEEN_SUBMISSIONS) {
      const wait = Math.ceil(MIN_SECONDS_BETWEEN_SUBMISSIONS - secondsSince)
      return {
        allowed: false,
        message: `Please wait ${wait} seconds before submitting another review.`,
      }
    }
  }

  return { allowed: true }
}
