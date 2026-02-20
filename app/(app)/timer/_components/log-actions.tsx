"use client"

import { useTimer } from "../../_components/timer/timer-context"

interface Props {
  taskId: string
  taskTitle: string
}

export function LogActions({ taskId, taskTitle }: Props) {
  const { state, start } = useTimer()

  const isStopwatchActive =
    state.taskId === taskId &&
    state.type === "stopwatch" &&
    state.status !== "idle"

  const isPomodoroActive =
    state.taskId === taskId &&
    state.type === "pomodoro" &&
    state.status !== "idle"

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => start(taskId, taskTitle, "stopwatch")}
        title="Продолжить трекать время"
        className={`w-6 h-6 rounded flex items-center justify-center text-xs transition-colors ${
          isStopwatchActive
            ? "text-red-500 bg-red-50"
            : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
        }`}
      >
        ▶
      </button>
      <button
        onClick={() => start(taskId, taskTitle, "pomodoro")}
        title="Запустить помодоро"
        className={`w-6 h-6 rounded flex items-center justify-center text-xs transition-colors ${
          isPomodoroActive
            ? "text-red-500 bg-red-50"
            : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
        }`}
      >
        🍅
      </button>
    </div>
  )
}
