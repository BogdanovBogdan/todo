"use client"

import { TimerType, useTimer } from "./timer-context"

interface Props {
  taskId: string
  taskTitle: string
  type: TimerType
  alwaysVisible?: boolean
}

export function TimerButton({ taskId, taskTitle, type, alwaysVisible = false }: Props) {
  const { state, start } = useTimer()

  const isActive =
    state.taskId === taskId &&
    state.type === type &&
    state.status !== "idle"

  return (
    <button
      onClick={() => start(taskId, taskTitle, type)}
      title={type === "pomodoro" ? "Помодоро (25 мин)" : "Трекать время"}
      className={`flex-shrink-0 text-sm px-1.5 py-0.5 rounded transition-all cursor-pointer ${
        isActive
          ? "opacity-100 text-red-500"
          : alwaysVisible
          ? "opacity-100 text-gray-400 md:hover:text-red-400 md:hover:bg-red-50"
          : "opacity-0 group-hover:opacity-100 text-gray-400 md:hover:text-red-400 md:hover:bg-red-50"
      }`}
    >
      {type === "pomodoro" ? "🍅" : "▶"}
    </button>
  )
}
