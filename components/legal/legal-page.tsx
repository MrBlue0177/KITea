import type { ReactNode } from "react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

export function LegalPage({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 pb-16 pt-28 sm:px-6 lg:px-8 xl:px-12">
        <article className="mx-auto w-full max-w-4xl rounded-3xl border border-border/50 bg-card/80 p-6 shadow-sm backdrop-blur-sm sm:p-8 lg:p-10">
          <header className="mb-8 border-b border-border/50 pb-6">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Legal information
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {description}
            </p>
          </header>
          <div className="space-y-8 text-sm leading-7 text-muted-foreground sm:text-base">
            {children}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}

export function LegalSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
