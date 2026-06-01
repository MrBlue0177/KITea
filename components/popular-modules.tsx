"use client"

import { useEffect, useState } from "react"
import { ModuleCard, ModuleCardSkeleton } from "./module-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function PopularModules() {
  const [isLoading, setIsLoading] = useState(true)
  const [recentModules, setRecentModules] = useState<any[]>([])
  const [popularModules, setPopularModules] = useState<any[]>([])
  const [hasReviews, setHasReviews] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        // Check if there are any reviews in the system
        const reviewsResponse = await fetch('/api/reviews/exists')
        const reviewsData = await reviewsResponse.json()
        setHasReviews(reviewsData.hasReviews || false)

        // Only fetch modules if there are reviews
        if (reviewsData.hasReviews) {
          const response = await fetch('/api/modules/recent')
          const data = await response.json()
          setRecentModules(data.modules || [])
          
          const popularResponse = await fetch('/api/modules/popular')
          const popularData = await popularResponse.json()
          setPopularModules(popularData.modules || [])
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Don't render anything if there are no reviews
  if (!hasReviews && !isLoading) {
    return null
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="text-base font-medium text-muted-foreground uppercase tracking-wide mb-8 sm:text-lg">
          Recent &amp; Popular Modules
        </h2>

        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="recent" className="text-base">Recent</TabsTrigger>
            <TabsTrigger value="popular" className="text-base">Popular</TabsTrigger>
          </TabsList>

          <TabsContent value="recent">
            <div className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading
                ? [...Array(6)].map((_, i) => <ModuleCardSkeleton key={i} />)
                : recentModules.length > 0
                  ? recentModules.map((module) => (
                      <ModuleCard 
                        key={module.moduleNumber} 
                        name={module.moduleName}
                        number={module.moduleNumber}
                        difficulty="Medium" 
                      />
                    ))
                  : <p className="text-muted-foreground text-center py-8 col-span-full">No recent modules found</p>
                }
            </div>
          </TabsContent>

          <TabsContent value="popular">
            <div className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading
                ? [...Array(6)].map((_, i) => <ModuleCardSkeleton key={i} />)
                : popularModules.length > 0
                  ? popularModules.map((module) => (
                      <ModuleCard 
                        key={module.moduleNumber} 
                        name={module.moduleName}
                        number={module.moduleNumber}
                        difficulty="Medium"
                      />
                    ))
                  : <p className="text-muted-foreground text-center py-8 col-span-full">No popular modules found</p>
                }
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
