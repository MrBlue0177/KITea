"use client"

import { useMemo, useState } from "react"
import { SlidersHorizontal } from "lucide-react"

import { ReviewCard } from "@/components/modules/review-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  filterReviewsBySemester,
  sortReviews,
} from "@/lib/modules/sort-reviews"
import type { ModulePageData, ReviewSortOption } from "@/lib/modules/types"

type ModuleReviewsSectionProps = {
  moduleId: string
  reviews: ModulePageData["reviews"]
  semesters: ModulePageData["semesters"]
  currentUserId?: string | null
}

const sortLabels: Record<ReviewSortOption, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  highest: "Highest rated",
  lowest: "Lowest rated",
  most_helpful: "Most helpful",
}

export function ModuleReviewsSection({
  moduleId,
  reviews,
  semesters,
  currentUserId,
}: ModuleReviewsSectionProps) {
  const [semesterFilter, setSemesterFilter] = useState<string>("all")
  const [sort, setSort] = useState<ReviewSortOption>("newest")

  const semesterOptions = useMemo(() => {
    const reviewSemesterIds = new Set(reviews.map((review) => review.semesterId))
    return semesters.filter((semester) => reviewSemesterIds.has(semester.id))
  }, [reviews, semesters])

  const displayedReviews = useMemo(() => {
    const filtered = filterReviewsBySemester(reviews, semesterFilter)
    return sortReviews(filtered, sort)
  }, [reviews, semesterFilter, sort])

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Student reviews</h2>
          <p className="text-sm text-muted-foreground">
            {displayedReviews.length} of {reviews.length} shown
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <Select value={semesterFilter} onValueChange={setSemesterFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All semesters</SelectItem>
                {semesterOptions.map((semester) => (
                  <SelectItem key={semester.id} value={semester.id}>
                    {semester.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={sort} onValueChange={(value) => setSort(value as ReviewSortOption)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(sortLabels) as ReviewSortOption[]).map((option) => (
                <SelectItem key={option} value={option}>
                  {sortLabels[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {displayedReviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {reviews.length === 0
              ? "No reviews yet. Be the first to share your experience."
              : "No reviews match this semester filter."}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {displayedReviews.map((review) => (
            <li
              key={review.id}
              className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
            >
              <ReviewCard
                review={review}
                moduleId={moduleId}
                currentUserId={currentUserId}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
