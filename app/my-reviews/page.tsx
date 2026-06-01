import Link from "next/link"
import { Plus } from "lucide-react"

import { getMyReviews } from "@/app/actions/reviews"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { AuthGuard } from "@/components/auth/auth-guard"
import { MyReviewsList } from "@/components/reviews/my-reviews-list"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function MyReviewsPage() {
  const reviews = await getMyReviews()

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex min-h-screen flex-1 flex-col pt-28 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="mx-auto w-full max-w-6xl space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">My reviews</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Edit or delete reviews you&apos;ve submitted.
                </p>
              </div>
              <Button asChild className="shrink-0">
                <Link href="/write-review">
                  <Plus className="mr-1.5 h-4 w-4" />
                  New review
                </Link>
              </Button>
            </div>

            <MyReviewsList reviews={reviews} />
          </div>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  )
}
