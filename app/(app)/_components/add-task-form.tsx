"use client"

import { useRef, useState } from "react"
import { createTask } from "@/lib/actions/tasks"
import { useTaskStore } from "@/lib/stores/task-store"
import { parseEstimate } from "@/lib/utils/time"
import { DatePicker } from "./date-picker"

export function AddTaskForm({ defaultDate }: { defaultDate?: string | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const [dueDate, setDueDate] = useState<string | null>(defaultDate ?? null)
  const [hasError, setHasError] = useState(false)
  // Bumping this key forces the title input to remount with a new defaultValue
  const [inputKey, setInputKey] = useState(0)
  const retryTitle = useRef("")
  const inputRef = useRef<HTMLInputElement>(null)

  function close() {
    setIsOpen(false)
    setDueDate(defaultDate ?? null)
    setHasError(false)
    retryTitle.current = ""
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const title = (formData.get("title") as string)?.trim()
    if (!title) return

    const submittedDueDate = dueDate
    if (submittedDueDate) {
      formData.set("dueDate", submittedDueDate)
    } else {
      formData.delete("dueDate")
    }

    const estimateStr = formData.get("estimate") as string | null
    const tempId = crypto.randomUUID()

    useTaskStore.getState().addTask({
      id: tempId,
      title,
      description: null,
      completed: false,
      dueDate: submittedDueDate,
      estimatedDuration: estimateStr ? parseEstimate(estimateStr) : null,
    })

    close()

    createTask(formData).catch(() => {
      useTaskStore.getState().deleteTask(tempId)
      retryTitle.current = title
      setDueDate(submittedDueDate)
      setHasError(true)
      setInputKey((k) => k + 1) // remount input with prefilled title
      setIsOpen(true)
      setTimeout(() => inputRef.current?.focus(), 0)
    })
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true)
          setTimeout(() => inputRef.current?.focus(), 0)
        }}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 py-2 transition-colors cursor-pointer"
      >
        <span className="text-lg leading-none">+</span> Add task
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-gray-200 rounded-xl p-3 mt-2"
    >
      {hasError && (
        <p className="text-xs text-red-500 mb-2">
          Failed to save — check your connection.
        </p>
      )}
      <input
        key={inputKey}
        ref={inputRef}
        name="title"
        defaultValue={retryTitle.current}
        placeholder="Task name"
        autoFocus
        required
        className="w-full text-sm text-gray-800 placeholder-gray-400 outline-none"
        onKeyDown={(e) => e.key === "Escape" && close()}
        onChange={() => hasError && setHasError(false)}
      />

      <div className="flex items-center gap-2 mt-3 mb-3">
        <DatePicker value={dueDate} onChange={setDueDate} />

        <div className="flex items-center gap-1 text-xs rounded-md px-2 py-1 border border-gray-200 text-gray-400 focus-within:border-gray-400 transition-colors">
          <span>⏳</span>
          <input
            type="time"
            name="estimate"
            className="outline-none text-gray-700 bg-transparent"
          />
        </div>
      </div>

      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={close}
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </form>
  )
}
