import { NextResponse } from "next/server"

import { getPrisma } from "@/lib/prisma"

export async function GET() {
  try {
    const prisma = getPrisma()
    
    // Get modules with review counts
    const modulesWithReviewCount = await prisma.module.findMany({
      include: {
        _count: {
          select: { reviews: true },
        },
      },
    })
    
    // Sort by review count and take top 6
    const sortedModules = modulesWithReviewCount
      .sort((a, b) => b._count.reviews - a._count.reviews)
      .slice(0, 6)
      .map((module) => ({
        moduleNumber: module.moduleNumber,
        moduleName: module.moduleName,
      }))
    
    // If no modules with reviews, return first 6 by module number
    if (sortedModules.length === 0 && modulesWithReviewCount.length > 0) {
      const fallbackModules = modulesWithReviewCount
        .slice(0, 6)
        .map((module) => ({
          moduleNumber: module.moduleNumber,
          moduleName: module.moduleName,
        }))
      
      return NextResponse.json({ modules: fallbackModules })
    }
    
    return NextResponse.json({ modules: sortedModules })
  } catch (error) {
    console.error("[GET /api/modules/popular]", error)
    return NextResponse.json(
      { error: "Failed to fetch popular modules", modules: [] },
      { status: 500 }
    )
  }
}