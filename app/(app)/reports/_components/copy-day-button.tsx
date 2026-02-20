"use client"

import { useState } from "react"

export interface DayTaskEntry {
  title: string
  completed: boolean
  trackedFormatted: string
  estimatedFormatted: string | null
}

interface Props {
  dayLabel: string
  totalFormatted: string
  tasks: DayTaskEntry[]
}

export function CopyDayButton({ dayLabel, totalFormatted, tasks }: Props) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const lines: string[] = [`📅 ${dayLabel} — ${totalFormatted}`, ""]
    for (const t of tasks) {
      const status = t.completed ? "✅" : "❌"
      const estimate = t.estimatedFormatted
        ? ` (план: ${t.estimatedFormatted})`
        : ""
      lines.push(`${status} ${t.title} — ${t.trackedFormatted}${estimate}`)
    }
    navigator.clipboard.writeText(lines.join("\n"))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
    >
      {copied ? "Скопировано ✓" : "Копировать"}
    </button>
  )
}
