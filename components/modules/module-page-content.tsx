"use client"

import { ModuleCharts } from "@/components/modules/module-charts"
import { ModuleHeader } from "@/components/modules/module-header"
import { ModuleReviewsSection } from "@/components/modules/module-reviews-section"
import { ModuleStatCards } from "@/components/modules/module-stat-cards"
import type { ModulePageData } from "@/lib/modules/types"

type ModulePageContentProps = {
  data: ModulePageData
  currentUserId?: string | null
  isAuthenticated: boolean
}

export function ModulePageContent({
  data,
  currentUserId,
  isAuthenticated,
}: ModulePageContentProps) {
  return (
    <div className="space-y-8">
      <ModuleHeader
        module={data}
        isAuthenticated={isAuthenticated}
      />

      <ModuleStatCards stats={data.stats} />

      <ModuleCharts stats={data.stats} />

      <ModuleReviewsSection
        moduleId={data.id}
        reviews={data.reviews}
        semesters={data.semesters}
        currentUserId={currentUserId}
      />
    </div>
  )
}
