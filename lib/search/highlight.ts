/**
 * Highlights matching text within a string using HTML mark tags.
 * Only highlights complete word boundaries to avoid partial word matches.
 *
 * @param text - The original text to highlight
 * @param query - The search query to match against
 * @returns The text with highlighted matches wrapped in mark tags
 */
export function highlightMatch(text: string, query: string): string {
  if (!query || !text) return text

  const queryLower = query.toLowerCase()
  const textLower = text.toLowerCase()

  // Split query into words for multi-word highlighting
  const queryWords = queryLower
    .split(/\s+/)
    .filter((w) => w.length >= 2)

  if (queryWords.length === 0) return text

  // Find all match positions for each word
  const matches: Array<{ start: number; end: number; word: string }> = []

  for (const word of queryWords) {
    let index = textLower.indexOf(word)
    while (index !== -1) {
      // Check if it's a complete word boundary
      const wordStart = index === 0 || /\s/.test(textLower[index - 1])
      const wordEnd =
        index + word.length === textLower.length ||
        /\s/.test(textLower[index + word.length])

      if (wordStart && wordEnd) {
        matches.push({
          start: index,
          end: index + word.length,
          word: text.slice(index, index + word.length),
        })
      }

      index = textLower.indexOf(word, index + 1)
    }
  }

  if (matches.length === 0) return text

  // Sort matches by start position and merge overlapping ones
  matches.sort((a, b) => a.start - b.start)

  const merged: Array<{ start: number; end: number }> = []
  for (const match of matches) {
    if (
      merged.length === 0 ||
      match.start > merged[merged.length - 1].end
    ) {
      merged.push({ start: match.start, end: match.end })
    } else {
      // Merge overlapping matches
      merged[merged.length - 1].end = Math.max(
        merged[merged.length - 1].end,
        match.end
      )
    }
  }

  // Build the highlighted string
  let result = ""
  let lastEnd = 0

  for (const match of merged) {
    // Add text before the match
    result += text.slice(lastEnd, match.start)

    // Add the highlighted match
    result += `<mark class="bg-primary/15 text-primary font-medium rounded-sm px-0.5">${text.slice(match.start, match.end)}</mark>`

    lastEnd = match.end
  }

  // Add remaining text
  result += text.slice(lastEnd)

  return result
}