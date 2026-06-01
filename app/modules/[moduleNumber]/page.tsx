import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { auth } from "@/auth"
import { Footer } from "@/components/footer"
import { ModulePageContent } from "@/components/modules/module-page-content"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { getModulePageData } from "@/lib/modules/get-module-page"

export const dynamic = "force-dynamic"

type ModulePageProps = {
  params: Promise<{ moduleNumber: string }>
}

export async function generateMetadata({ params }: ModulePageProps) {
  const { moduleNumber } = await params
  const data = await getModulePageData(moduleNumber)

  if (!data) {
    return { title: "Module not found — KITea" }
  }

  return {
    title: `${data.moduleNumber} ${data.moduleName} — KITea`,
    description: `Reviews and ratings for ${data.moduleName} at KIT.`,
  }
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { moduleNumber } = await params
  const session = await auth()
  const data = await getModulePageData(moduleNumber, session?.user?.id)

  if (!data) {
    notFound()
  }

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-1 flex-col pt-28 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-2 mb-4 w-fit text-muted-foreground"
          >
            <Link href="/">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to search
            </Link>
          </Button>

          <ModulePageContent
            data={data}
            currentUserId={session?.user?.id}
            isAuthenticated={!!session?.user}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}
