"use client"

import { useState, useTransition } from "react"
import { toggleTask } from "@/lib/actions/tasks"
import { useTimer } from "./timer/timer-context"
import { TaskModal } from "./task-modal"
import { isToday, isTomorrow, isYesterday, format } from "date-fns"

interface Task {
  id: string
  title: string
  description: string | null
  completed: boolean
  dueDate: Date | null
  estimatedDuration: number | null
}

function formatDate(date: Date): string {
  if (isToday(date)) return "Сегодня"
  if (isTomorrow(date)) return "Завтра"
  if (isYesterday(date)) return "Вчера"
  return format(date, "d MMM")
}

export function TaskItem({ task }: { task: Task }) {
  const [isPending, startTransition] = useTransition()
  const [modalOpen, setModalOpen] = useState(false)
  const { state } = useTimer()

  const isTracking = state.taskId === task.id && state.status !== "idle"

  return (
    <>
      <div
        className={`border-b border-gray-100 last:border-0 transition-opacity ${
          isPending ? "opacity-40" : ""
        }`}
      >
        <div
          className="flex items-start gap-3 py-3 cursor-pointer"
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
              {isTracking && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <TaskModal task={task} onClose={() => setModalOpen(false)} />
      )}
    </>
  )
}
