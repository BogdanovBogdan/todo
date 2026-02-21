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
      className={`flex-shrink-0 text-sm transition-opacity ${
        isActive
          ? "opacity-100 text-red-500"
          : alwaysVisible
          ? "opacity-100 text-gray-400 hover:text-red-400"
          : "opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400"
      }`}
    >
      {type === "pomodoro" ? "🍅" : "▶"}
    </button>
  )
}
