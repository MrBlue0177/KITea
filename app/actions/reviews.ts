"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/auth"
import { checkReviewSubmissionRateLimit } from "@/lib/reviews/rate-limit"
import { reviewFormSchema, type ReviewFormValues } from "@/lib/reviews/schema"
import {
  semesterLabel,
  toReviewFormValues,
  type ReviewListItem,
} from "@/lib/reviews/serialize"
import { getPrisma } from "@/lib/prisma"

export type ReviewFormOption = {
  id: string
  label: string
}

export type ReviewFormOptions = {
  modules: ReviewFormOption[]
  semesters: ReviewFormOption[]
}

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

async function requireUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

export async function getReviewFormOptions(): Promise<ReviewFormOptions> {
  const prisma = getPrisma()

  const [modules, semesters] = await Promise.all([
    prisma.module.findMany({
      select: { id: true, moduleNumber: true, moduleName: true },
      orderBy: { moduleNumber: "asc" },
    }),
    prisma.semester.findMany({
      select: { id: true, name: true, year: true },
      orderBy: [{ year: "desc" }, { name: "asc" }],
    }),
  ])

  return {
    modules: modules.map((module) => ({
      id: module.id,
      label: `${module.moduleNumber} — ${module.moduleName}`,
    })),
    semesters: semesters.map((semester) => ({
      id: semester.id,
      label: semesterLabel(semester.name, semester.year),
    })),
  }
}

export async function getMyReviews(): Promise<ReviewListItem[]> {
  const userId = await requireUserId()
  if (!userId) return []

  const prisma = getPrisma()
  const reviews = await prisma.review.findMany({
    where: { userId },
    include: {
      module: { select: { moduleNumber: true, moduleName: true } },
      semesterTaken: { select: { name: true, year: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  return reviews.map((review) => ({
    id: review.id,
    moduleId: review.moduleId,
    moduleNumber: review.module.moduleNumber,
    moduleName: review.module.moduleName,
    semesterLabel: semesterLabel(
      review.semesterTaken.name,
      review.semesterTaken.year
    ),
    overallRating: Number(review.overallRating),
    summary: review.summary,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  }))
}

export async function getReviewForEdit(
  reviewId: string
): Promise<{ review: ReviewFormValues; moduleLabel: string } | null> {
  const userId = await requireUserId()
  if (!userId) return null

  const prisma = getPrisma()
  const review = await prisma.review.findFirst({
    where: { id: reviewId, userId },
    include: {
      module: { select: { moduleNumber: true, moduleName: true } },
    },
  })

  if (!review) return null

  return {
    review: toReviewFormValues(review),
    moduleLabel: `${review.module.moduleNumber} — ${review.module.moduleName}`,
  }
}

function mapReviewData(values: ReviewFormValues) {
  return {
    moduleId: values.moduleId,
    semesterTakenId: values.semesterTakenId,
    lecturerName: values.lecturerName ?? null,
    lecturerReview: values.lecturerReview ?? null,
    taName: values.taName ?? null,
    taReview: values.taReview ?? null,
    homeworkReview: values.homeworkReview ?? null,
    examReview: values.examReview ?? null,
    summary: values.summary,
    overallRating: values.overallRating,
    difficultyRating: values.difficultyRating,
    workloadRating: values.workloadRating,
  }
}

export async function createReview(
  input: ReviewFormValues
): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUserId()
  if (!userId) {
    return { success: false, error: "You must be signed in to submit a review." }
  }

  const parsed = reviewFormSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid form data.",
    }
  }

  const rateLimit = await checkReviewSubmissionRateLimit(userId)
  if (!rateLimit.allowed) {
    return { success: false, error: rateLimit.message }
  }

  const prisma = getPrisma()

  try {
    const review = await prisma.review.create({
      data: {
        userId,
        ...mapReviewData(parsed.data),
      },
    })

    revalidatePath("/my-reviews")
    revalidatePath("/write-review")

    return { success: true, data: { id: review.id } }
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error:
          "You already reviewed this module for that semester. Edit your existing review instead.",
      }
    }
    console.error("[createReview]", error)
    return { success: false, error: "Could not save your review. Please try again." }
  }
}

export async function updateReview(
  reviewId: string,
  input: ReviewFormValues
): Promise<ActionResult> {
  const userId = await requireUserId()
  if (!userId) {
    return { success: false, error: "You must be signed in to edit a review." }
  }

  const parsed = reviewFormSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid form data.",
    }
  }

  const prisma = getPrisma()
  const existing = await prisma.review.findFirst({
    where: { id: reviewId, userId },
    select: { id: true },
  })

  if (!existing) {
    return { success: false, error: "Review not found or you do not have access." }
  }

  try {
    await prisma.review.update({
      where: { id: reviewId },
      data: mapReviewData(parsed.data),
    })

    revalidatePath("/my-reviews")
    revalidatePath(`/write-review/${reviewId}/edit`)

    return { success: true }
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error: "Another review already exists for this module and semester.",
      }
    }
    console.error("[updateReview]", error)
    return { success: false, error: "Could not update your review. Please try again." }
  }
}

export async function deleteReview(reviewId: string): Promise<ActionResult> {
  const userId = await requireUserId()
  if (!userId) {
    return { success: false, error: "You must be signed in to delete a review." }
  }

  const prisma = getPrisma()
  const existing = await prisma.review.findFirst({
    where: { id: reviewId, userId },
    select: { id: true },
  })

  if (!existing) {
    return { success: false, error: "Review not found or you do not have access." }
  }

  try {
    await prisma.review.delete({ where: { id: reviewId } })
    revalidatePath("/my-reviews")
    return { success: true }
  } catch (error) {
    console.error("[deleteReview]", error)
    return { success: false, error: "Could not delete your review. Please try again." }
  }
}
