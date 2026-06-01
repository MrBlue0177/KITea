import { NextResponse } from "next/server"

import { getPrisma } from "@/lib/prisma"

export async function GET() {
  try {
    const prisma = getPrisma()
    
    // Get the 6 most recently created modules (ordered by id as proxy for creation time)
    let modules = await prisma.module.findMany({
      take: 6,
      orderBy: { id: "desc" },
      select: {
        moduleNumber: true,
        moduleName: true,
      },
    })
    
    // If no modules or very few, get first 6 by module number as fallback
    if (modules.length < 6) {
      const allModules = await prisma.module.findMany({
        take: 6,
        orderBy: { moduleNumber: "asc" },
        select: {
          moduleNumber: true,
          moduleName: true,
        },
      })
      
      // Merge with existing modules, avoiding duplicates
      const existingNumbers = new Set(modules.map(m => m.moduleNumber))
      const fallbackModules = allModules.filter(m => !existingNumbers.has(m.moduleNumber))
      modules = [...modules, ...fallbackModules].slice(0, 6)
    }
    
    return NextResponse.json({ modules })
  } catch (error) {
    console.error("[GET /api/modules/recent]", error)
    return NextResponse.json(
      { error: "Failed to fetch recent modules", modules: [] },
      { status: 500 }
    )
  }
}