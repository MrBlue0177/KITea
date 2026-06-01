"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/auth"
import { getPrisma } from "@/lib/prisma"

type HelpfulResult =
  | { success: true; helpfulCount: number; userHasVoted: boolean }
  | { success: false; error: string }

export async function toggleReviewHelpful(
  reviewId: string,
  moduleId: string
): Promise<HelpfulResult> {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { success: false, error: "Sign in to mark reviews as helpful." }
  }

  const prisma = getPrisma()

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, moduleId: true, userId: true },
  })

  if (!review || review.moduleId !== moduleId) {
    return { success: false, error: "Review not found." }
  }

  if (review.userId === userId) {
    return { success: false, error: "You cannot upvote your own review." }
  }

  const existing = await prisma.reviewHelpful.findUnique({
    where: {
      reviewId_userId: { reviewId, userId },
    },
  })

  if (existing) {
    await prisma.reviewHelpful.delete({
      where: { id: existing.id },
    })
  } else {
    await prisma.reviewHelpful.create({
      data: { reviewId, userId },
    })
  }

  const helpfulCount = await prisma.reviewHelpful.count({
    where: { reviewId },
  })

  revalidatePath(`/modules/${moduleId}`)

  return {
    success: true,
    helpfulCount,
    userHasVoted: !existing,
  }
}
