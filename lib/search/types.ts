export type ModuleSearchResult = {
  id: string
  moduleNumber: string
  moduleName: string
  highlightedModuleNumber?: string
  highlightedModuleName?: string
  averageRating: number | null
  averageDifficulty: number | null
  reviewCount: number
  score?: number
}
