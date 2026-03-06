"use client"

import { useState } from "react"

export interface DayTaskEntry {
  title: string
  completed: boolean
  trackedFormatted: string
  estimatedFormatted: string | null
}

interface Props {
  dateKey: string // YYYY-MM-DD
  totalFormatted: string
  tasks: DayTaskEntry[]
}

export function CopyDayButton({ dateKey, totalFormatted, tasks }: Props) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const [, mm, dd] = dateKey.split("-")
    const dateFormatted = `${dd}.${mm}`
    const lines: string[] = [`📅 ${dateFormatted} | ⏳ ${totalFormatted}`, ""]
    for (const t of tasks) {
      const status = t.completed ? "✅" : "❌"
      const estimatePart = t.estimatedFormatted ? ` (est: ${t.estimatedFormatted})` : ""
      const timePart = t.trackedFormatted !== "—" ? ` | ⏳ ${t.trackedFormatted}${estimatePart}` : ""
      lines.push(`• ${t.title}${timePart} ${status}`)
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
      {copied ? "Copied ✓" : "Copy"}
    </button>
  )
}
