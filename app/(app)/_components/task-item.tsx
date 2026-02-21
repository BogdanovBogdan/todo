"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { deleteTask, toggleTask, updateTaskDueDate, updateTaskEstimate } from "@/lib/actions/tasks"
import { TimerButton } from "./timer/timer-button"
import { DatePicker } from "./date-picker"
import { formatEstimate, parseEstimate } from "@/lib/utils/time"

interface Task {
  id: string
  title: string
  completed: boolean
  dueDate: Date | null
  estimatedDuration: number | null
}

function EstimatePicker({
  taskId,
  estimatedDuration,
}: {
  taskId: string
  estimatedDuration: number | null
}) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(
    estimatedDuration ? formatEstimate(estimatedDuration) : ""
  )
  const [isPending, startTransition] = useTransition()
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setTimeout(() => inputRef.current?.focus(), 0)
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onMouseDown)
    return () => document.removeEventListener("mousedown", onMouseDown)
  }, [open])

  function save() {
    const seconds = parseEstimate(value)
    startTransition(() => updateTaskEstimate(taskId, seconds))
    setOpen(false)
  }

  function clear() {
    setValue("")
    startTransition(() => updateTaskEstimate(taskId, null))
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className={`flex items-center gap-1 text-xs rounded-md px-2 py-1 border transition-colors ${
          estimatedDuration
            ? "border-purple-200 text-purple-600 bg-purple-50 hover:bg-purple-100"
            : "border-gray-200 text-gray-400 hover:bg-gray-50"
        }`}
      >
        <span>⏳</span>
        {estimatedDuration && (
          <span>{formatEstimate(estimatedDuration)}</span>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-xl border border-gray-200 shadow-xl p-3 w-44">
          <p className="text-xs text-gray-400 mb-2">Плановое время</p>
          <input
            ref={inputRef}
            type="time"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save()
              if (e.key === "Escape") setOpen(false)
            }}
            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-gray-400 mb-2"
          />
          <div className="flex items-center justify-between">
            {estimatedDuration ? (
              <button
                type="button"
                onClick={clear}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                Убрать
              </button>
            ) : <span />}
            <button
              type="button"
              onClick={save}
              className="text-xs bg-gray-900 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Сохранить
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function TaskItem({ task }: { task: Task }) {
  const [isPending, startTransition] = useTransition()

  function handleDateChange(date: Date | null) {
    startTransition(() => updateTaskDueDate(task.id, date))
  }

  return (
    <div
      className={`group border-b border-gray-100 last:border-0 transition-opacity ${
        isPending ? "opacity-40" : ""
      }`}
    >
      {/* Title row */}
      <div className="flex items-center gap-3 py-2.5">
        {/* Checkbox */}
        <button
          onClick={() => startTransition(() => toggleTask(task.id, !task.completed))}
          aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
          className={`w-[18px] h-[18px] rounded-full border-2 flex-shrink-0 transition-colors ${
            task.completed
              ? "bg-gray-300 border-gray-300"
              : "border-gray-300 hover:border-red-400"
          }`}
        />

        {/* Title */}
        <span
          className={`flex-1 min-w-0 text-sm ${
            task.completed ? "line-through text-gray-400" : "text-gray-800"
          }`}
        >
          {task.title}
        </span>

        {/* Desktop-only inline controls */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <div
            className="opacity-0 group-hover:opacity-100 transition-opacity data-[has-estimate=true]:opacity-100"
            data-has-estimate={!!task.estimatedDuration}
          >
            <EstimatePicker taskId={task.id} estimatedDuration={task.estimatedDuration} />
          </div>
          <div
            className="opacity-0 group-hover:opacity-100 transition-opacity data-[has-date=true]:opacity-100"
            data-has-date={!!task.dueDate}
          >
            <DatePicker value={task.dueDate} onChange={handleDateChange} />
          </div>
          <TimerButton taskId={task.id} taskTitle={task.title} type="stopwatch" />
          <TimerButton taskId={task.id} taskTitle={task.title} type="pomodoro" />
          <button
            onClick={() => startTransition(() => deleteTask(task.id))}
            aria-label="Delete task"
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-xl leading-none transition-opacity"
          >
            ×
          </button>
        </div>

        {/* Mobile delete */}
        <button
          onClick={() => startTransition(() => deleteTask(task.id))}
          aria-label="Delete task"
          className="md:hidden text-gray-300 hover:text-red-400 text-xl leading-none flex-shrink-0 transition-colors"
        >
          ×
        </button>
      </div>

      {/* Mobile controls row */}
      <div className="flex md:hidden items-center gap-2 pb-2.5 pl-[30px] flex-wrap">
        <EstimatePicker taskId={task.id} estimatedDuration={task.estimatedDuration} />
        <DatePicker value={task.dueDate} onChange={handleDateChange} />
        <TimerButton taskId={task.id} taskTitle={task.title} type="stopwatch" />
        <TimerButton taskId={task.id} taskTitle={task.title} type="pomodoro" />
      </div>
    </div>
  )
}
