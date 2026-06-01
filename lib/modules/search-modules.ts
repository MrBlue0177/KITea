import { getPrisma } from "@/lib/prisma"
import { highlightMatch } from "@/lib/search/highlight"
import type { ModuleSearchResult } from "@/lib/search/types"

const MAX_RESULTS = 8
const MIN_QUERY_LENGTH = 2

interface SearchResultRow {
  id: string
  moduleNumber: string
  moduleName: string
  averageRating: number | null
  averageDifficulty: number | null
  reviewCount: number
  rank: number
}

export async function searchModules(
  query: string
): Promise<ModuleSearchResult[]> {
  const trimmed = query.trim()
  if (trimmed.length < MIN_QUERY_LENGTH) return []

  const prisma = getPrisma()

  try {
    // Use raw SQL for production-level search with PostgreSQL full-text search
    // This combines multiple search strategies for best results
    const results = await prisma.$queryRaw<SearchResultRow[]>`
      WITH module_stats AS (
        SELECT
          m.id,
          m."moduleNumber",
          m."moduleName",
          COALESCE(AVG(r."overallRating"), NULL) as "averageRating",
          COALESCE(AVG(r."difficultyRating"), NULL) as "averageDifficulty",
          COUNT(r.id) as "reviewCount"
        FROM "Module" m
        LEFT JOIN "Review" r ON m.id = r."moduleId"
        GROUP BY m.id, m."moduleNumber", m."moduleName"
      ),
      exact_matches AS (
        SELECT
          *,
          1000 as rank
        FROM module_stats
        WHERE LOWER("moduleNumber") = LOWER(${trimmed})
        LIMIT 1
      ),
      prefix_matches AS (
        SELECT
          *,
          500 as rank
        FROM module_stats
        WHERE LOWER("moduleNumber") LIKE LOWER(${trimmed + '%'})
        OR LOWER("moduleName") LIKE LOWER(${trimmed + '%'})
        LIMIT ${MAX_RESULTS}
      ),
      textsearch_matches AS (
        SELECT
          *,
          ts_rank(
            to_tsvector('english', coalesce("moduleName", '') || ' ' || coalesce("moduleNumber", '')),
            plainto_tsquery('english', ${trimmed})
          ) as rank
        FROM module_stats
        WHERE
          to_tsvector('english', coalesce("moduleName", '') || ' ' || coalesce("moduleNumber", ''))
          @@ plainto_tsquery('english', ${trimmed})
        ORDER BY rank DESC
        LIMIT ${MAX_RESULTS}
      ),
      fuzzy_matches AS (
        SELECT
          *,
          similarity("moduleNumber", ${trimmed}) * 100 as rank
        FROM module_stats
        WHERE "moduleNumber" % ${trimmed}
        ORDER BY similarity("moduleNumber", ${trimmed}) DESC
        LIMIT ${MAX_RESULTS * 2}
      )
      SELECT DISTINCT ON (id) *
      FROM (
        SELECT * FROM exact_matches
        UNION ALL
        SELECT * FROM prefix_matches
        UNION ALL
        SELECT * FROM textsearch_matches
        UNION ALL
        SELECT * FROM fuzzy_matches
      ) combined
      ORDER BY id, rank DESC
      LIMIT ${MAX_RESULTS}
    `

    // Sort final results by rank
    const sortedResults = results
      .sort((a, b) => b.rank - a.rank)
      .slice(0, MAX_RESULTS)

    return sortedResults.map((row) => ({
      id: row.id,
      moduleNumber: row.moduleNumber,
      moduleName: row.moduleName,
      highlightedModuleNumber: highlightMatch(row.moduleNumber, trimmed),
      highlightedModuleName: highlightMatch(row.moduleName, trimmed),
      averageRating: row.averageRating,
      averageDifficulty: row.averageDifficulty,
      reviewCount: row.reviewCount,
      score: row.rank,
    }))
  } catch (error) {
    console.error("[searchModules] PostgreSQL search error:", error)

    // Fallback to simple LIKE search if full-text search fails
    const fallbackResults = await prisma.$queryRaw<SearchResultRow[]>`
      WITH module_stats AS (
        SELECT
          m.id,
          m."moduleNumber",
          m."moduleName",
          COALESCE(AVG(r."overallRating"), NULL) as "averageRating",
          COALESCE(AVG(r."difficultyRating"), NULL) as "averageDifficulty",
          COUNT(r.id) as "reviewCount",
          CASE
            WHEN LOWER(m."moduleNumber") = LOWER(${trimmed}) THEN 1000
            WHEN LOWER(m."moduleNumber") LIKE LOWER(${trimmed + '%'}) THEN 500
            WHEN LOWER(m."moduleName") LIKE LOWER(${trimmed + '%'}) THEN 400
            WHEN LOWER(m."moduleNumber") LIKE LOWER(${'%' + trimmed + '%'}) THEN 200
            WHEN LOWER(m."moduleName") LIKE LOWER(${'%' + trimmed + '%'}) THEN 100
            ELSE 0
          END as rank
        FROM "Module" m
        LEFT JOIN "Review" r ON m.id = r."moduleId"
        WHERE
          LOWER(m."moduleNumber") LIKE LOWER(${'%' + trimmed + '%'})
          OR LOWER(m."moduleName") LIKE LOWER(${'%' + trimmed + '%'})
        GROUP BY m.id, m."moduleNumber", m."moduleName"
        HAVING CASE
          WHEN LOWER(m."moduleNumber") = LOWER(${trimmed}) THEN 1000
          WHEN LOWER(m."moduleNumber") LIKE LOWER(${trimmed + '%'}) THEN 500
          WHEN LOWER(m."moduleName") LIKE LOWER(${trimmed + '%'}) THEN 400
          WHEN LOWER(m."moduleNumber") LIKE LOWER(${'%' + trimmed + '%'}) THEN 200
          WHEN LOWER(m."moduleName") LIKE LOWER(${'%' + trimmed + '%'}) THEN 100
          ELSE 0
        END > 0
        ORDER BY rank DESC
        LIMIT ${MAX_RESULTS}
      `

    return fallbackResults.map((row) => ({
      id: row.id,
      moduleNumber: row.moduleNumber,
      moduleName: row.moduleName,
      highlightedModuleNumber: highlightMatch(row.moduleNumber, trimmed),
      highlightedModuleName: highlightMatch(row.moduleName, trimmed),
      averageRating: row.averageRating,
      averageDifficulty: row.averageDifficulty,
      reviewCount: row.reviewCount,
      score: row.rank,
    }))
  }
}