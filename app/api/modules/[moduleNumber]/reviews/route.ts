import { NextRequest, NextResponse } from "next/server"

import { getPrisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleNumber: string }> }
) {
  const prisma = getPrisma()
  const { moduleNumber } = await params
  const { searchParams } = new URL(request.url)

  const sortBy = searchParams.get("sortBy") || "newest"
  const semesterId = searchParams.get("semesterId")

  try {
    const module = await prisma.module.findUnique({
      where: {
        moduleNumber: moduleNumber.toUpperCase(),
      },
    })

    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    let orderBy: any = { createdAt: "desc" }
    
    switch (sortBy) {
      case "oldest":
        orderBy = { createdAt: "asc" }
        break
      case "highest":
        orderBy = { overallRating: "desc" }
        break
      case "lowest":
        orderBy = { overallRating: "asc" }
        break
      case "newest":
      default:
        orderBy = { createdAt: "desc" }
        break
    }

    const where: any = {
      moduleId: module.id,
    }
    
    if (semesterId && semesterId !== "all") {
      where.semesterTakenId = semesterId
    }

    const reviews = await prisma.review.findMany({
      where,
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
      orderBy,
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Failed to fetch reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ moduleNumber: string }> }
) {
  const prisma = getPrisma()
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { moduleNumber } = await params

  try {
    const body = await request.json()
    
    const {
      semesterTakenId,
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

    if (!semesterTakenId || !overallRating || !difficultyRating || !workloadRating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const module = await prisma.module.findUnique({
      where: {
        moduleNumber: moduleNumber.toUpperCase(),
      },
    })

    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        moduleId: module.id,
        semesterTakenId,
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

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("Failed to create review:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}