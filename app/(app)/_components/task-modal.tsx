"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useTransition } from "react"
import {
  deleteTask,
  updateTaskDescription,
  updateTaskDueDate,
  updateTaskEstimate,
  updateTaskTitle,
} from "@/lib/actions/tasks"
import { getTaskTrackedTime } from "@/lib/actions/time-logs"
import { useTimer } from "./timer/timer-context"
import { TimerButton } from "./timer/timer-button"
import { DatePicker } from "./date-picker"
import { formatEstimate, parseEstimate } from "@/lib/utils/time"
import { formatSeconds } from "./timer/timer-context"

interface Task {
  id: string
  title: string
  description: string | null
  completed: boolean
  dueDate: Date | null
  estimatedDuration: number | null
}

interface Props {
  task: Task
  onClose: () => void
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
        className={`flex items-center gap-1 text-xs rounded-md px-2 py-1 border transition-colors cursor-pointer ${
          estimatedDuration
            ? "border-purple-200 text-purple-600 bg-purple-50 md:hover:bg-purple-100"
            : "border-gray-200 text-gray-400 md:hover:bg-gray-50"
        }`}
      >
        <span>⏳</span>
        {estimatedDuration ? (
          <span>{formatEstimate(estimatedDuration)}</span>
        ) : (
          <span>--:--</span>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-[60] bg-white rounded-xl border border-gray-200 shadow-xl p-3 w-44">
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
            ) : (
              <span />
            )}
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

export function TaskModal({ task, onClose }: Props) {
  const { state, start } = useTimer()
  const [isPending, startTransition] = useTransition()

  // Tracked time
  const [trackedBase, setTrackedBase] = useState<number | null>(null)
  useEffect(() => {
    getTaskTrackedTime(task.id).then(setTrackedBase)
  }, [task.id])

  const liveAdd =
    state.taskId === task.id &&
    state.status === "running" &&
    state.type === "stopwatch"
      ? state.seconds
      : 0
  const totalTracked = (trackedBase ?? 0) + liveAdd

  // Title editing
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(task.title)

  // Callback ref fires immediately when the textarea mounts — no flash
  const titleRefCallback = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return
    el.style.height = "1px"
    el.style.height = el.scrollHeight + "px"
    el.focus()
    el.setSelectionRange(el.value.length, el.value.length)
  }, [])

  function commitTitle() {
    if (titleValue.trim() && titleValue.trim() !== task.title) {
      startTransition(() => updateTaskTitle(task.id, titleValue))
    } else {
      setTitleValue(task.title)
    }
    setEditingTitle(false)
  }

  // Description editing
  const [editingDesc, setEditingDesc] = useState(false)
  const [descValue, setDescValue] = useState(task.description ?? "")
  const descRef = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    if (editingDesc) {
      const el = descRef.current
      if (!el) return
      el.style.height = "1px"
      el.style.height = el.scrollHeight + "px"
      el.focus()
    }
  }, [editingDesc])

  function commitDesc() {
    const trimmed = descValue.trim() || null
    if (trimmed !== (task.description ?? null)) {
      startTransition(() => updateTaskDescription(task.id, trimmed))
    }
    setEditingDesc(false)
  }

  // Date
  function handleDateChange(date: Date | null) {
    let dateStr: string | null = null
    if (date) {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, "0")
      const d = String(date.getDate()).padStart(2, "0")
      dateStr = `${y}-${m}-${d}`
    }
    startTransition(() => updateTaskDueDate(task.id, dateStr))
  }

  // Delete
  function handleDelete() {
    startTransition(async () => {
      await deleteTask(task.id)
      onClose()
    })
  }

  // Escape key & keyboard
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (editingTitle) {
          setTitleValue(task.title)
          setEditingTitle(false)
        } else if (editingDesc) {
          setDescValue(task.description ?? "")
          setEditingDesc(false)
        } else {
          onClose()
        }
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [editingTitle, editingDesc, task.title, task.description, onClose])

  // Format tracked time as h:mm:ss
  function formatTracked(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  const secondaryPanel = (
    <div className="flex flex-col gap-5">
      {/* Tracked time */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          ⏱ Трекинг
        </p>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-mono text-gray-700">
            {trackedBase === null ? "—" : formatTracked(totalTracked)}
          </span>
          {state.taskId === task.id && state.status === "running" && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <TimerButton
            taskId={task.id}
            taskTitle={titleValue}
            type="stopwatch"
            alwaysVisible
          />
          <TimerButton
            taskId={task.id}
            taskTitle={titleValue}
            type="pomodoro"
            alwaysVisible
          />
        </div>
      </div>

      {/* Due date */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          📅 Дата
        </p>
        <DatePicker value={task.dueDate} onChange={handleDateChange} />
      </div>

      {/* Estimate */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          ⏳ Оценка
        </p>
        <EstimatePicker
          taskId={task.id}
          estimatedDuration={task.estimatedDuration}
        />
      </div>

      {/* Delete */}
      <div className="mt-auto pt-2">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-sm text-red-400 hover:text-red-600 transition-colors disabled:opacity-50 cursor-pointer"
        >
          Удалить задачу
        </button>
      </div>
    </div>
  )

  const mainPanel = (
    <div className="flex flex-col gap-4 flex-1 min-w-0">
      {/* Title */}
      {editingTitle ? (
        <textarea
          ref={titleRefCallback}
          value={titleValue}
          rows={1}
          onChange={(e) => {
            setTitleValue(e.target.value)
            const el = e.target
            el.style.height = "1px"
            el.style.height = el.scrollHeight + "px"
          }}
          onBlur={commitTitle}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              commitTitle()
            }
            if (e.key === "Escape") {
              setTitleValue(task.title)
              setEditingTitle(false)
            }
          }}
          className="text-xl font-semibold text-gray-900 outline-none border-b border-gray-300 focus:border-gray-600 bg-transparent resize-none w-full overflow-y-auto"
          style={{ maxHeight: "9rem" }}
        />
      ) : (
        <h2
          onClick={() => setEditingTitle(true)}
          className="text-xl font-semibold text-gray-900 cursor-text hover:text-gray-700 transition-colors"
        >
          {titleValue}
        </h2>
      )}

      {/* Description */}
      {editingDesc ? (
        <textarea
          ref={descRef}
          value={descValue}
          onChange={(e) => {
            setDescValue(e.target.value)
            const el = e.target
            el.style.height = "1px"
            el.style.height = el.scrollHeight + "px"
          }}
          onBlur={commitDesc}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setDescValue(task.description ?? "")
              setEditingDesc(false)
            }
          }}
          placeholder="Добавить описание..."
          className="text-sm text-gray-600 outline-none border-b border-gray-300 focus:border-gray-600 bg-transparent resize-none w-full"
          style={{ minHeight: "calc(5 * 1.25rem + 1rem)" }}
        />
      ) : (
        <p
          onClick={() => setEditingDesc(true)}
          className={`text-sm cursor-text min-h-[60px] ${
            descValue
              ? "text-gray-600 hover:text-gray-800"
              : "text-gray-400 hover:text-gray-500"
          }`}
        >
          {descValue || "Добавить описание..."}
        </p>
      )}
    </div>
  )

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Desktop modal */}
      <div className="hidden md:flex fixed inset-0 z-50 items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <div className="flex items-center justify-end p-4 pb-0">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-xl leading-none transition-colors cursor-pointer"
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>

          <div className="flex gap-6 p-6 pt-2">
            {/* Main */}
            {mainPanel}

            {/* Secondary */}
            <div className="w-56 flex-shrink-0 border-l border-gray-100 pl-6">
              {secondaryPanel}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom sheet */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl animate-slide-up">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="p-5 flex flex-col gap-5 pb-8">
          {mainPanel}
          <div className="border-t border-gray-100 pt-4">
            {secondaryPanel}
          </div>
        </div>
      </div>
    </>
  )
}
