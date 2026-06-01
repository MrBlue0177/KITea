"use client"

import Link from "next/link"
import { Analytics } from "@vercel/analytics/next"
import { Cookie } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { complianceConfig } from "@/lib/compliance"

const CONSENT_STORAGE_KEY = "kitea_cookie_consent_v1"

type ConsentPreferences = {
  essential: true
  preferences: boolean
  analytics: boolean
  decidedAt: string
}

function defaultConsent(): ConsentPreferences {
  return {
    essential: true,
    preferences: false,
    analytics: false,
    decidedAt: new Date().toISOString(),
  }
}

function readConsent(): ConsentPreferences | null {
  if (typeof window === "undefined") return null

  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ConsentPreferences>

    return {
      essential: true,
      preferences: Boolean(parsed.preferences),
      analytics: Boolean(parsed.analytics),
      decidedAt: typeof parsed.decidedAt === "string" ? parsed.decidedAt : new Date().toISOString(),
    }
  } catch {
    return null
  }
}

function saveConsent(preferences: ConsentPreferences) {
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(preferences))
  window.dispatchEvent(new CustomEvent("kitea-cookie-settings-opened", { detail: false }))
}

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentPreferences | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false)
  const [draft, setDraft] = useState<ConsentPreferences>(() => defaultConsent())

  const shouldShowBanner = isLoaded && !consent
  const shouldLoadAnalytics = Boolean(consent?.analytics && complianceConfig.features.analyticsEnabled)

  const categories = useMemo(() => complianceConfig.cookies, [])

  useEffect(() => {
    const stored = readConsent()
    setConsent(stored)
    if (stored) setDraft(stored)
    setIsLoaded(true)

    function handleOpenSettings() {
      const latest = readConsent() ?? defaultConsent()
      setDraft(latest)
      setIsCustomizeOpen(true)
    }

    window.addEventListener("kitea-open-cookie-settings", handleOpenSettings)
    return () => window.removeEventListener("kitea-open-cookie-settings", handleOpenSettings)
  }, [])

  function persist(next: ConsentPreferences) {
    saveConsent(next)
    setConsent(next)
    setDraft(next)
    setIsCustomizeOpen(false)
  }

  function acceptAll() {
    persist({
      essential: true,
      preferences: true,
      analytics: true,
      decidedAt: new Date().toISOString(),
    })
  }

  function rejectNonEssential() {
    persist(defaultConsent())
  }

  function saveCustom() {
    persist({ ...draft, essential: true, decidedAt: new Date().toISOString() })
  }

  return (
    <>
      {shouldLoadAnalytics && <Analytics />}

      {shouldShowBanner && (
        <section
          aria-label="Cookie consent"
          className="fixed inset-x-0 bottom-0 z-[60] border-t border-border/60 bg-background/95 p-4 shadow-2xl backdrop-blur-md sm:p-6"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-4 rounded-2xl border border-border/50 bg-card p-4 shadow-sm sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-3">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Cookie className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <h2 className="text-base font-semibold text-foreground">Cookie preferences</h2>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                  We use essential cookies for security and core functionality. Optional cookies for preferences and analytics stay disabled unless you consent. Read our <Link href="/privacy-policy" className="underline underline-offset-4 hover:text-foreground">Privacy Policy</Link>.
                </p>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[28rem]">
              <Button type="button" onClick={acceptAll}>Accept all</Button>
              <Button type="button" variant="outline" onClick={rejectNonEssential}>Reject</Button>
              <Button type="button" variant="ghost" onClick={() => setIsCustomizeOpen(true)}>Customize</Button>
            </div>
          </div>
        </section>
      )}

      <Dialog open={isCustomizeOpen} onOpenChange={setIsCustomizeOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage cookie settings</DialogTitle>
            <DialogDescription>
              Choose which optional cookie categories KITea may use. Essential cookies are always active because the website cannot work securely without them.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {categories.map((category) => (
              <div key={category.id} className="flex flex-col gap-3 rounded-xl border border-border/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1 pr-0 sm:pr-6">
                  <h3 className="font-medium text-foreground">{category.label}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">{category.description}</p>
                </div>
                <Switch
                  checked={category.required ? true : draft[category.id]}
                  disabled={category.required}
                  aria-label={`Toggle ${category.label}`}
                  onCheckedChange={(checked) =>
                    setDraft((current) => ({
                      ...current,
                      [category.id]: checked,
                    }))
                  }
                />
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button type="button" variant="outline" onClick={rejectNonEssential}>Reject non-essential</Button>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="ghost" onClick={saveCustom}>Save choices</Button>
              <Button type="button" onClick={acceptAll}>Accept all</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function ManageCookieSettingsButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event("kitea-open-cookie-settings"))}
    >
      Cookie Settings
    </button>
  )
}
