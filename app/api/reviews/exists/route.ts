import { NextResponse } from "next/server"

import { getPrisma } from "@/lib/prisma"

export async function GET() {
  try {
    const prisma = getPrisma()
    
    // Check if there are any reviews in the system
    const reviewCount = await prisma.review.count()
    
    return NextResponse.json({ 
      hasReviews: reviewCount > 0,
      count: reviewCount 
    })
  } catch (error) {
    console.error("[GET /api/reviews/exists]", error)
    return NextResponse.json(
      { hasReviews: false, count: 0 },
      { status: 500 }
    )
  }
}