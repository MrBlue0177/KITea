import { NextRequest, NextResponse } from "next/server"

import { getPrisma } from "@/lib/prisma"
import { highlightMatch } from "@/lib/search/highlight"

const MAX_QUERY_LENGTH = 80
const MIN_QUERY_LENGTH = 2
const MAX_RESULTS = 10

interface SearchResult {
  id: string
  moduleNumber: string
  moduleName: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")?.trim().slice(0, MAX_QUERY_LENGTH) ?? ""

    if (!query || query.length < MIN_QUERY_LENGTH) {
      return NextResponse.json({ results: [] })
    }

    let prisma
    try {
      prisma = getPrisma()
    } catch (dbError) {
      console.error("[GET /api/search/modules] Database connection error:", dbError)
      return NextResponse.json(
        {
          results: [],
          error: "Database connection failed. Please try again.",
        },
        { status: 503 }
      )
    }

    // Simple, reliable search using Prisma
    const modules = await prisma.module.findMany({
      where: {
        OR: [
          {
            moduleNumber: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            moduleName: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        moduleNumber: true,
        moduleName: true,
      },
      take: MAX_RESULTS,
    })

    // Add highlighting
    const results = modules.map((module) => {
      try {
        return {
          id: module.id,
          moduleNumber: module.moduleNumber,
          moduleName: module.moduleName,
          highlightedModuleNumber: highlightMatch(module.moduleNumber, query),
          highlightedModuleName: highlightMatch(module.moduleName, query),
        }
      } catch (highlightError) {
        console.error("[GET /api/search/modules] Highlight error:", highlightError)
        // Fallback to non-highlighted version
        return {
          id: module.id,
          moduleNumber: module.moduleNumber,
          moduleName: module.moduleName,
          highlightedModuleNumber: module.moduleNumber,
          highlightedModuleName: module.moduleName,
        }
      }
    })

    return NextResponse.json({ results })
  } catch (error) {
    console.error("[GET /api/search/modules] Search error:", error)
    return NextResponse.json(
      {
        results: [],
        error: "Search is temporarily unavailable. Please try again.",
      },
      { status: 500 }
    )
  }
}