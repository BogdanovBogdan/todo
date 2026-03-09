"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { saveTimeLog } from "@/lib/actions/time-logs"
import { DatePicker } from "@/app/(app)/_components/date-picker"
import { dateStrToLocal } from "@/lib/utils/tz"

interface Task {
  id: string
  title: string
}

interface AddTimeLogModalProps {
  tasks: Task[]
  todayStr: string // "YYYY-MM-DD" initial date
  onClose: () => void
}

function DurationPicker({
  value,
  onChange,
}: {
  value: number
  onChange: (seconds: number) => void
}) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(
    value > 0
      ? `${String(Math.floor(value / 3600)).padStart(2, "0")}:${String(Math.floor((value % 3600) / 60)).padStart(2, "0")}`
      : ""
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
    if (!inputValue) {
      onChange(0)
    } else {
      const parts = inputValue.split(":")
      const hours = parseInt(parts[0] ?? "0", 10) || 0
      const minutes = parseInt(parts[1] ?? "0", 10) || 0
      onChange(hours * 3600 + minutes * 60)
    }
    setOpen(false)
  }

  function clear() {
    setInputValue("")
    onChange(0)
    setOpen(false)
  }

  const displayLabel =
    value > 0
      ? `${Math.floor(value / 3600)}:${String(Math.floor((value % 3600) / 60)).padStart(2, "0")}`
      : "--:--"

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 text-xs rounded-md px-2 py-1 border transition-colors cursor-pointer ${
          value > 0
            ? "border-purple-200 text-purple-600 bg-purple-50 md:hover:bg-purple-100"
            : "border-gray-200 text-gray-400 md:hover:bg-gray-50"
        }`}
      >
        <span>⏳</span>
        <span>{displayLabel}</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-[60] bg-white rounded-xl border border-gray-200 shadow-xl p-3 w-44">
          <p className="text-xs text-gray-400 mb-2">Duration (optional)</p>
          <input
            ref={inputRef}
            type="time"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save()
              if (e.key === "Escape") setOpen(false)
            }}
            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-gray-400 mb-2"
          />
          <div className="flex items-center justify-between">
            {value > 0 ? (
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

export function AddTimeLogModal({ tasks, todayStr, onClose }: AddTimeLogModalProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [query, setQuery] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dateStr, setDateStr] = useState(todayStr)
  const [durationSeconds, setDurationSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase())
  )

  function handleTaskInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    setSelectedTask(null)
    setDropdownOpen(true)
  }

  function handleTaskFocus() {
    setDropdownOpen(true)
  }

  function handleTaskBlur() {
    setTimeout(() => {
      setDropdownOpen(false)
    }, 200)
  }

  function handleSelectTask(task: Task) {
    setSelectedTask(task)
    setQuery("")
    setDropdownOpen(false)
  }

  function handleSubmit() {
    if (!selectedTask) {
      setError("Please select a task")
      return
    }

    setError(null)
    const startTime = dateStrToLocal(dateStr)

    startTransition(async () => {
      await saveTimeLog({
        taskId: selectedTask.id,
        startTime,
        duration: durationSeconds,
        type: "stopwatch",
      })
      onClose()
    })
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" />
      <div
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Add report item entry
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            ✕
          </button>

          {/* Field 1: Task */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400 text-gray-900"
                placeholder="Search tasks..."
                value={selectedTask ? selectedTask.title : query}
                onChange={handleTaskInputChange}
                onFocus={handleTaskFocus}
                onBlur={handleTaskBlur}
              />
              {dropdownOpen && filtered.length > 0 && (
                <ul className="absolute bg-white rounded-xl border border-gray-200 shadow-xl max-h-48 overflow-y-auto z-10 w-full mt-1">
                  {filtered.map((task) => (
                    <li
                      key={task.id}
                      onMouseDown={() => handleSelectTask(task)}
                      className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      {task.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {error === "Please select a task" && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
          </div>

          {/* Field 2: Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <DatePicker
              value={dateStr}
              onChange={(val) => setDateStr(val ?? todayStr)}
            />
          </div>

          {/* Field 3: Duration */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration
            </label>
            <DurationPicker value={durationSeconds} onChange={setDurationSeconds} />
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
