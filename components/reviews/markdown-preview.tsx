"use client"

import { cn } from "@/lib/utils"

type MarkdownPreviewProps = {
  content: string
  className?: string
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function inlineFormat(text: string) {
  let html = escapeHtml(text)
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>")
  html = html.replace(/`(.+?)`/g, "<code>$1</code>")
  html = html.replace(
    /\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline underline-offset-2">$1</a>'
  )
  return html
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  if (!content.trim()) {
    return (
      <p className={cn("text-sm text-muted-foreground italic", className)}>
        Nothing to preview yet.
      </p>
    )
  }

  const blocks = content.split(/\n\n+/)

  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none space-y-3 text-foreground",
        className
      )}
    >
      {blocks.map((block, index) => {
        const trimmed = block.trim()
        if (!trimmed) return null

        if (trimmed.startsWith("### ")) {
          return (
            <h3
              key={index}
              className="text-sm font-semibold"
              dangerouslySetInnerHTML={{
                __html: inlineFormat(trimmed.slice(4)),
              }}
            />
          )
        }

        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={index}
              className="text-base font-semibold"
              dangerouslySetInnerHTML={{
                __html: inlineFormat(trimmed.slice(3)),
              }}
            />
          )
        }

        if (trimmed.startsWith("- ")) {
          const items = trimmed.split("\n").filter((line) => line.startsWith("- "))
          return (
            <ul key={index} className="list-disc space-y-1 pl-5 text-sm">
              {items.map((item, itemIndex) => (
                <li
                  key={itemIndex}
                  dangerouslySetInnerHTML={{
                    __html: inlineFormat(item.slice(2)),
                  }}
                />
              ))}
            </ul>
          )
        }

        return (
          <p
            key={index}
            className="text-sm leading-relaxed text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed) }}
          />
        )
      })}
    </div>
  )
}
