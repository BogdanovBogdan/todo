"use client"

import { useTimer } from "./timer-context"

export function TimerNotification() {
  const { state, dismissNotification } = useTimer()
  if (!state.timedOutTask) return null
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center justify-between gap-4">
      <p className="text-sm text-amber-800">
        ⏰ Таймер для «{state.timedOutTask}» работал больше суток и был остановлен автоматически
      </p>
      <button
        onClick={dismissNotification}
        className="text-amber-600 hover:text-amber-900 text-sm font-medium shrink-0"
      >
        Закрыть
      </button>
    </div>
  )
}
