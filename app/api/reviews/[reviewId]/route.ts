import { NextRequest, NextResponse } from "next/server"

import { getPrisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const prisma = getPrisma()
  const { reviewId } = await params

  try {
    const review = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        semesterTaken: {
          select: {
            id: true,
            name: true,
            year: true,
          },
        },
      },
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    return NextResponse.json(review)
  } catch (error) {
    console.error("Failed to fetch review:", error)
    return NextResponse.json({ error: "Failed to fetch review" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const prisma = getPrisma()
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { reviewId } = await params

  try {
    const existingReview = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    })

    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    if (existingReview.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    
    const {
      lecturerName,
      lecturerReview,
      taName,
      taReview,
      homeworkReview,
      examReview,
      summary,
      overallRating,
      difficultyRating,
      workloadRating,
    } = body

    const review = await prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        lecturerName,
        lecturerReview,
        taName,
        taReview,
        homeworkReview,
        examReview,
        summary,
        overallRating,
        difficultyRating,
        workloadRating,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        semesterTaken: {
          select: {
            id: true,
            name: true,
            year: true,
          },
        },
      },
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error("Failed to update review:", error)
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const prisma = getPrisma()
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { reviewId } = await params

  try {
    const existingReview = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    })

    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    if (existingReview.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.review.delete({
      where: {
        id: reviewId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete review:", error)
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 })
  }
}