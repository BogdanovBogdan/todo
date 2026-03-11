"use client"

import { Hourglass, Play } from "lucide-react"
import { TimerType, useTimer } from "./timer-context"

interface Props {
  taskId: string
  taskTitle: string
  type: TimerType
  alwaysVisible?: boolean
  disabled?: boolean
}

export function TimerButton({ taskId, taskTitle, type, alwaysVisible = false, disabled = false }: Props) {
  const { state, start } = useTimer()

  const isActive =
    state.taskId === taskId &&
    state.type === type &&
    state.status !== "idle"

  return (
    <button
      onClick={() => start(taskId, taskTitle, type)}
      disabled={disabled}
      title={type === "pomodoro" ? "Помодоро (25 мин)" : "Трекать время"}
      className={`flex-shrink-0 text-sm px-1.5 py-0.5 rounded transition-all ${
        disabled
          ? "opacity-30 cursor-not-allowed"
          : isActive
          ? "opacity-100 text-red-500 cursor-pointer"
          : alwaysVisible
          ? "opacity-100 text-gray-400 md:hover:text-red-400 md:hover:bg-red-50 cursor-pointer"
          : "opacity-0 group-hover:opacity-100 text-gray-400 md:hover:text-red-400 md:hover:bg-red-50 cursor-pointer"
      }`}
    >
      {type === "pomodoro" ? <Hourglass size={14} /> : <Play size={14} />}
    </button>
  )
}
