"use client"

import { Hourglass, Play } from "lucide-react"
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
    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0">
      <button
        onClick={() => start(taskId, taskTitle, "stopwatch")}
        title="Продолжить трекать время"
        className={`w-6 h-6 rounded flex items-center justify-center text-xs transition-colors ${
          isStopwatchActive
            ? "text-red-500 bg-red-50"
            : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
        }`}
      >
        <Play size={12} />
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
        <Hourglass size={12} />
      </button>
    </div>
  )
}
