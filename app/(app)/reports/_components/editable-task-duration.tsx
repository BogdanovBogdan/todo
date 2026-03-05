"use client"

import { updateAggregatedDuration } from "@/lib/actions/time-logs"
import { useRef, useState, useTransition } from "react"

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

function parseDuration(value: string): number | null {
  const parts = value.trim().split(":")
  if (parts.length !== 3) return null
  const [h, m, s] = parts.map(Number)
  if ([h, m, s].some(isNaN)) return null
  if (m >= 60 || s >= 60) return null
  const total = h * 3600 + m * 60 + s
  return total >= 1 ? total : null
}

interface Props {
  logIds: string[]
  initialDuration: number
}

export function EditableTaskDuration({ logIds, initialDuration }: Props) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(formatDuration(initialDuration))
  const [duration, setDuration] = useState(initialDuration)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setValue(formatDuration(duration))
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function commit() {
    const parsed = parseDuration(value)
    if (parsed !== null && parsed !== duration) {
      startTransition(async () => {
        await updateAggregatedDuration(logIds, parsed)
        setDuration(parsed)
      })
    } else {
      setValue(formatDuration(duration))
    }
    setEditing(false)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") e.currentTarget.blur()
    else if (e.key === "Escape") {
      setValue(formatDuration(duration))
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={onKeyDown}
        className="text-sm font-mono text-gray-600 w-16 text-right tabular-nums bg-transparent border-b border-gray-300 focus:border-gray-600 outline-none"
        autoFocus
      />
    )
  }

  return (
    <button
      onClick={startEdit}
      disabled={isPending}
      className={`text-sm font-mono text-gray-600 flex-shrink-0 w-16 text-right tabular-nums hover:text-gray-900 transition-colors ${isPending ? "opacity-40" : ""}`}
    >
      {formatDuration(duration)}
    </button>
  )
}
