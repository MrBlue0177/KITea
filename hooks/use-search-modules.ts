"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface SearchResult {
  id: string
  moduleNumber: string
  moduleName: string
  highlightedModuleNumber?: string
  highlightedModuleName?: string
}

interface SearchResponse {
  results: SearchResult[]
  error?: string
}

interface UseSearchModulesOptions {
  debounceMs?: number
  minQueryLength?: number
}

interface UseSearchModulesReturn {
  results: SearchResult[]
  isLoading: boolean
  error: string | null
  search: (query: string) => void
  clear: () => void
}

export function useSearchModules(
  options: UseSearchModulesOptions = {}
): UseSearchModulesReturn {
  const { debounceMs = 250, minQueryLength = 2 } = options

  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Cleanup function to cancel pending requests
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const search = useCallback((query: string) => {
    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const trimmedQuery = query.trim()

    // Clear results if query is too short
    if (!trimmedQuery || trimmedQuery.length < minQueryLength) {
      setResults([])
      setError(null)
      setIsLoading(false)
      return
    }

    // Set loading state
    setIsLoading(true)
    setError(null)

    // Debounce the search request
    debounceTimerRef.current = setTimeout(async () => {
      try {
        // Create new abort controller for this request
        abortControllerRef.current = new AbortController()

        const response = await fetch(
          `/api/search/modules?q=${encodeURIComponent(trimmedQuery)}`,
          {
            signal: abortControllerRef.current.signal,
          }
        )

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`[useSearchModules] API error ${response.status}:`, errorText)
          
          if (response.status === 404) {
            throw new Error("Search service not available")
          }
          if (response.status === 500) {
            throw new Error("Search service is temporarily unavailable. Please try again.")
          }
          throw new Error(`Search failed (status: ${response.status})`)
        }

        const data: SearchResponse = await response.json()

        if (data.error) {
          setError(data.error)
          setResults([])
        } else {
          setResults(data.results)
          setError(null)
        }
      } catch (err) {
        // Ignore abort errors (from request cancellation)
        if (err instanceof Error && err.name === "AbortError") {
          return
        }

        const errorMessage =
          err instanceof Error ? err.message : "Search failed. Please try again."
        console.error("[useSearchModules] Search failed:", err)
        setError(errorMessage)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, debounceMs)
  }, [debounceMs, minQueryLength])

  const clear = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setResults([])
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    results,
    isLoading,
    error,
    search,
    clear,
  }
}