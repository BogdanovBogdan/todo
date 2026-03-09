"use client"

import { useState, useTransition } from "react"
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

export function AddTimeLogModal({ tasks, todayStr, onClose }: AddTimeLogModalProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [query, setQuery] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dateStr, setDateStr] = useState(todayStr)
  const [hours, setHours] = useState("")
  const [minutes, setMinutes] = useState("")
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

    const h = hours === "" ? 0 : parseInt(hours, 10)
    const m = minutes === "" ? 0 : parseInt(minutes, 10)
    const durationSeconds = h * 3600 + m * 60

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
              Duration (optional)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={23}
                className="w-20 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400 text-gray-900"
                placeholder="0"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
              <span className="text-sm text-gray-500">h</span>
              <input
                type="number"
                min={0}
                max={59}
                className="w-20 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400 text-gray-900"
                placeholder="0"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              />
              <span className="text-sm text-gray-500">min</span>
            </div>
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
