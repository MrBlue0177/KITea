import { NextRequest, NextResponse } from "next/server"

import { getPrisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleNumber: string }> }
) {
  const prisma = getPrisma()
  const { moduleNumber } = await params

  try {
    const module = await prisma.module.findUnique({
      where: {
        moduleNumber: moduleNumber.toUpperCase(),
      },
    })

    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    const reviews = await prisma.review.findMany({
      where: {
        moduleId: module.id,
      },
      select: {
        overallRating: true,
        difficultyRating: true,
        workloadRating: true,
      },
    })

    const totalReviews = reviews.length

    if (totalReviews === 0) {
      return NextResponse.json({
        totalReviews: 0,
        averageRating: null,
        averageDifficulty: null,
        averageWorkload: null,
      })
    }

    const sumOverall = reviews.reduce((sum: number, r: any) => sum + Number(r.overallRating), 0)
    const sumDifficulty = reviews.reduce((sum: number, r: any) => sum + Number(r.difficultyRating), 0)
    const sumWorkload = reviews.reduce((sum: number, r: any) => sum + Number(r.workloadRating), 0)

    return NextResponse.json({
      totalReviews,
      averageRating: sumOverall / totalReviews,
      averageDifficulty: sumDifficulty / totalReviews,
      averageWorkload: sumWorkload / totalReviews,
    })
  } catch (error) {
    console.error("Failed to fetch stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}