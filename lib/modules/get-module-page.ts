import { cache } from "react"

import { semesterLabel } from "@/lib/reviews/serialize"
import type { ModulePageData, ModuleReviewItem } from "@/lib/modules/types"
import { getPrisma } from "@/lib/prisma"

const RATING_BUCKETS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]

function buildRatingDistribution(
  ratings: number[]
): { rating: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const bucket of RATING_BUCKETS) {
    counts.set(bucket.toFixed(1), 0)
  }
  for (const rating of ratings) {
    const key = (Math.round(rating * 2) / 2).toFixed(1)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return RATING_BUCKETS.map((bucket) => ({
    rating: bucket.toFixed(1),
    count: counts.get(bucket.toFixed(1)) ?? 0,
  }))
}

function average(values: number[]): number | null {
  if (values.length === 0) return null
  const sum = values.reduce((acc, value) => acc + value, 0)
  return Math.round((sum / values.length) * 10) / 10
}

export const getModulePageData = cache(
  async (
    moduleId: string,
    currentUserId?: string | null
  ): Promise<ModulePageData | null> => {
    const prisma = getPrisma()

    // Determine if it's an ID or moduleNumber (IDs are cuid format, moduleNumbers are like "MA-101")
    const isId = moduleId.length > 10 && /^[a-z0-9]+$/.test(moduleId)
    
    // Single query using the appropriate field
    const module = await prisma.module.findUnique({
      where: isId 
        ? { id: moduleId } 
        : { moduleNumber: moduleId.toUpperCase() },
      include: {
        semesters: { orderBy: [{ year: "desc" }, { name: "asc" }] },
        reviews: {
          include: {
            user: { select: { id: true, name: true, image: true } },
            semesterTaken: { select: { id: true, name: true, year: true } },
            helpfulVotes: { select: { userId: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!module) return null

    const overallRatings = module.reviews.map((review) =>
      Number(review.overallRating)
    )
    const difficultyRatings = module.reviews.map((review) =>
      Number(review.difficultyRating)
    )
    const workloadRatings = module.reviews.map((review) =>
      Number(review.workloadRating)
    )

    const reviews: ModuleReviewItem[] = module.reviews.map((review) => ({
      id: review.id,
      userId: review.userId,
      authorName: review.user.name ?? "Anonymous student",
      authorImage: review.user.image,
      semesterId: review.semesterTaken.id,
      semesterLabel: semesterLabel(
        review.semesterTaken.name,
        review.semesterTaken.year
      ),
      overallRating: Number(review.overallRating),
      difficultyRating: Number(review.difficultyRating),
      workloadRating: Number(review.workloadRating),
      summary: review.summary,
      lecturerName: review.lecturerName,
      lecturerReview: review.lecturerReview,
      taName: review.taName,
      taReview: review.taReview,
      homeworkReview: review.homeworkReview,
      examReview: review.examReview,
      helpfulCount: review.helpfulVotes.length,
      userHasVoted: currentUserId
        ? review.helpfulVotes.some((vote) => vote.userId === currentUserId)
        : false,
      createdAt: review.createdAt.toISOString(),
    }))

    return {
      id: module.id,
      moduleNumber: module.moduleNumber,
      moduleName: module.moduleName,
      description: module.description,
      semesters: module.semesters.map((semester) => ({
        id: semester.id,
        label: semesterLabel(semester.name, semester.year),
      })),
      stats: {
        reviewCount: module.reviews.length,
        averageRating: average(overallRatings),
        averageDifficulty: average(difficultyRatings),
        averageWorkload: average(workloadRatings),
        ratingDistribution: buildRatingDistribution(overallRatings),
      },
      reviews,
    }
  }
)
