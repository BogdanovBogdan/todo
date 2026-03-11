"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Hourglass, Trash2 } from "lucide-react"
import { getTaskTrackedTime } from "@/lib/actions/time-logs"
import { useTaskStore } from "@/lib/stores/task-store"
import { useTimer } from "./timer/timer-context"
import { TimerButton } from "./timer/timer-button"
import { DatePicker } from "./date-picker"
import { formatEstimate, parseEstimate } from "@/lib/utils/time"

interface Props {
  taskId: string
  onClose: () => void
}

function EstimatePicker({
  taskId,
  estimatedDuration,
  disabled = false,
}: {
  taskId: string
  estimatedDuration: number | null
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(
    estimatedDuration ? formatEstimate(estimatedDuration) : ""
  )
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
    useTaskStore.getState().updateEstimate(taskId, seconds)
    setOpen(false)
  }

  function clear() {
    setValue("")
    useTaskStore.getState().updateEstimate(taskId, null)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className={`flex items-center gap-1 text-xs rounded-md px-2 py-1 border transition-colors ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        } ${
          estimatedDuration
            ? "border-purple-200 text-purple-600 bg-purple-50 md:hover:bg-purple-100"
            : "border-gray-200 text-gray-400 md:hover:bg-gray-50"
        }`}
      >
        <Hourglass size={12} />
        {estimatedDuration ? (
          <span>{formatEstimate(estimatedDuration)}</span>
        ) : (
          <span>--:--</span>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-[60] bg-white rounded-xl border border-gray-200 shadow-xl p-3 w-44">
          <p className="text-xs text-gray-400 mb-2">Planned time</p>
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
                Clear
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={save}
              className="text-xs bg-gray-900 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function TaskModal({ taskId, onClose }: Props) {
  const task = useTaskStore((s) => s.tasks.find((t) => t.id === taskId))
  const { state, stop } = useTimer()

  // Tracked time
  const [trackedBase, setTrackedBase] = useState<number | null>(null)
  useEffect(() => {
    getTaskTrackedTime(taskId).then(setTrackedBase)
  }, [taskId])

  // Title editing
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(task?.title ?? "")

  // Callback ref fires immediately when the textarea mounts — no flash
  const titleRefCallback = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return
    el.style.height = "1px"
    el.style.height = el.scrollHeight + "px"
    el.focus()
    el.setSelectionRange(el.value.length, el.value.length)
  }, [])

  // Description editing
  const [editingDesc, setEditingDesc] = useState(false)
  const [descValue, setDescValue] = useState(task?.description ?? "")
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

  // Escape key & keyboard
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (editingTitle) {
          setTitleValue(task?.title ?? "")
          setEditingTitle(false)
        } else if (editingDesc) {
          setEditingDesc(false)
        } else {
          onClose()
        }
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [editingTitle, editingDesc, task?.title, onClose])

  if (!task) {
    return (
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
    )
  }

  const liveAdd =
    state.taskId === task.id &&
    state.status === "running" &&
    state.type === "stopwatch"
      ? state.seconds
      : 0
  const totalTracked = (trackedBase ?? 0) + liveAdd

  function commitTitle() {
    if (titleValue.trim() && titleValue.trim() !== task!.title) {
      useTaskStore.getState().updateTitle(task!.id, titleValue)
    } else {
      setTitleValue(task!.title)
    }
    setEditingTitle(false)
  }

  function commitDesc() {
    const trimmed = descValue.trim() || null
    if (trimmed !== (task!.description ?? null)) {
      useTaskStore.getState().updateDescription(task!.id, trimmed)
    }
    setEditingDesc(false)
  }

  function handleDateChange(dateStr: string | null) {
    useTaskStore.getState().updateDueDate(task!.id, dateStr)
  }

  async function handleToggleComplete() {
    const next = !task!.completed
    if (next && state.taskId === task!.id && state.status !== "idle") {
      await stop()
    }
    useTaskStore.getState().toggleTask(task!.id, next)
  }

  function handleDelete() {
    useTaskStore.getState().deleteTask(task!.id)
    onClose()
  }

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
          Tracking
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
            disabled={task.completed}
          />
          <TimerButton
            taskId={task.id}
            taskTitle={titleValue}
            type="pomodoro"
            alwaysVisible
            disabled={task.completed}
          />
        </div>
      </div>

      {/* Due date */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Due date
        </p>
        <div className={task.completed ? "pointer-events-none opacity-50" : ""}>
          <DatePicker value={task.dueDate} onChange={handleDateChange} />
        </div>
      </div>

      {/* Estimate */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Estimate
        </p>
        <EstimatePicker
          taskId={task.id}
          estimatedDuration={task.estimatedDuration}
          disabled={task.completed}
        />
      </div>

      {/* Delete */}
      <div className="mt-auto pt-2">
        <button
          onClick={handleDelete}
          disabled={task.completed}
          aria-label="Delete task"
          className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )

  const mainPanel = (
    <div className="flex flex-col gap-4 flex-1 min-w-0">
      {/* Title */}
      {editingTitle ? (
        <div className="flex items-start gap-3">
          <button
            disabled
            aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
            className={`mt-1.5 w-[18px] h-[18px] rounded-full border-2 flex-shrink-0 opacity-30 cursor-not-allowed ${
              task.completed ? "bg-gray-300 border-gray-300" : "border-gray-300"
            }`}
          />
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
            className="text-xl font-semibold text-gray-900 outline-none border-b border-gray-300 focus:border-gray-600 bg-transparent resize-none flex-1 overflow-y-auto"
            style={{ maxHeight: "9rem" }}
          />
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <button
            onClick={handleToggleComplete}
            disabled={editingTitle || editingDesc}
            aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
            className={`mt-1.5 w-[18px] h-[18px] rounded-full border-2 flex-shrink-0 transition-colors ${
              editingTitle || editingDesc
                ? "opacity-30 cursor-not-allowed"
                : "cursor-pointer"
            } ${
              task.completed
                ? "bg-gray-300 border-gray-300"
                : "border-gray-300 hover:border-red-400"
            }`}
          />
          <h2
            onClick={() => !task.completed && setEditingTitle(true)}
            className={`text-xl font-semibold transition-colors ${
              task.completed
                ? "line-through text-gray-400 cursor-default"
                : "text-gray-900 cursor-text hover:text-gray-700"
            }`}
          >
            {titleValue}
          </h2>
        </div>
      )}

      {/* Description */}
      <div className="pl-[calc(18px+0.75rem)]">
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
                commitDesc()
              }
            }}
            placeholder="Add description..."
            className="text-sm text-gray-600 outline-none border-b border-gray-300 focus:border-gray-600 bg-transparent resize-none w-full"
            style={{ minHeight: "calc(5 * 1.25rem + 1rem)" }}
          />
        ) : (
          <p
            onClick={() => !task.completed && setEditingDesc(true)}
            className={`text-sm min-h-[60px] whitespace-pre-wrap ${
              task.completed
                ? "text-gray-400 cursor-default"
                : descValue
                ? "text-gray-600 hover:text-gray-800 cursor-text"
                : "text-gray-400 hover:text-gray-500 cursor-text"
            }`}
          >
            {descValue || "Add description..."}
          </p>
        )}
      </div>
    </div>
  )

  return createPortal(
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
              aria-label="Close"
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
    </>,
    document.body
  )
}
