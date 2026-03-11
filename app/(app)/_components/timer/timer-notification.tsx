"use client"

import { AlarmClock } from "lucide-react"
import { useTimer } from "./timer-context"

export function TimerNotification() {
  const { state, dismissNotification } = useTimer()
  if (!state.timedOutTask) return null
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center justify-between gap-4">
      <p className="flex items-center gap-1.5 text-sm text-amber-800">
        <AlarmClock size={14} /> Timer for &ldquo;{state.timedOutTask}&rdquo; ran for over 24 hours and was stopped automatically
      </p>
      <button
        onClick={dismissNotification}
        className="text-amber-600 hover:text-amber-900 text-sm font-medium shrink-0"
      >
        Dismiss
      </button>
    </div>
  )
}
