"use client"

import { useState, useTransition } from "react"
import { toggleTask } from "@/lib/actions/tasks"
import { useTimer } from "./timer/timer-context"
import { TaskModal } from "./task-modal"

function formatEstimate(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

interface Task {
  id: string
  title: string
  description: string | null
  completed: boolean
  dueDate: string | null
  estimatedDuration: number | null
}

function formatDate(str: string): string {
  const today = new Intl.DateTimeFormat("en-CA").format(new Date())
  const [ty, tm, td] = today.split("-").map(Number)
  const tomorrow = new Intl.DateTimeFormat("en-CA").format(
    new Date(ty, tm - 1, td + 1)
  )
  const yesterday = new Intl.DateTimeFormat("en-CA").format(
    new Date(ty, tm - 1, td - 1)
  )
  if (str === today) return "Today"
  if (str === tomorrow) return "Tomorrow"
  if (str === yesterday) return "Yesterday"
  const [y, m, d] = str.split("-").map(Number)
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(new Date(y, m - 1, d, 12))
}

export function TaskItem({ task }: { task: Task }) {
  const [isPending, startTransition] = useTransition()
  const [modalOpen, setModalOpen] = useState(false)
  const { state, start, stop } = useTimer()

  const isTracking = state.taskId === task.id && state.status !== "idle"

  return (
    <>
      <div
        className={`border-b border-gray-100 last:border-0 transition-opacity ${
          isPending ? "opacity-40" : ""
        }`}
      >
        <div
          className="flex items-start gap-3 py-3 cursor-pointer group"
          onClick={() => setModalOpen(true)}
        >
          {/* Checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              startTransition(() => toggleTask(task.id, !task.completed))
            }}
            aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
            className={`mt-0.5 w-[18px] h-[18px] rounded-full border-2 flex-shrink-0 transition-colors cursor-pointer ${
              task.completed
                ? "bg-gray-300 border-gray-300"
                : "border-gray-300 hover:border-red-400"
            }`}
          />

          <div className="flex-1 min-w-0">
            <p
              className={`text-sm line-clamp-3 ${
                task.completed ? "line-through text-gray-400" : "text-gray-800"
              }`}
            >
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                {task.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1">
              {task.dueDate && (
                <span className="text-xs text-gray-400">
                  {formatDate(task.dueDate)}
                </span>
              )}
              {task.estimatedDuration && (
                <span className="text-xs text-gray-400">
                  ⏳ {formatEstimate(task.estimatedDuration)}
                </span>
              )}
              {isTracking && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              )}
            </div>
          </div>

          {/* Timer button */}
          {!task.completed && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (isTracking) {
                  stop()
                } else {
                  start(task.id, task.title, "stopwatch")
                }
              }}
              aria-label={isTracking ? "Остановить таймер" : "Запустить таймер"}
              className={`flex-shrink-0 mt-0.5 w-7 h-7 flex items-center justify-center rounded-full transition-all cursor-pointer ${
                isTracking
                  ? "bg-red-50 text-red-500"
                  : "opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50"
              }`}
            >
              {isTracking ? (
                <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
              ) : (
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 translate-x-px">
                  <path d="M3 2.5l10 5.5-10 5.5V2.5z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {modalOpen && (
        <TaskModal task={task} onClose={() => setModalOpen(false)} />
      )}
    </>
  )
}
