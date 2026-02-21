"use client"

import { useRef, useState, useTransition } from "react"
import { createTask } from "@/lib/actions/tasks"
import { DatePicker } from "./date-picker"

export function AddTaskForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [dueDate, setDueDate] = useState<Date | null>(new Date())
  const inputRef = useRef<HTMLInputElement>(null)

  function close() {
    setIsOpen(false)
    setDueDate(new Date())
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    // Inject dueDate from state (not from hidden input)
    if (dueDate) {
      const y = dueDate.getFullYear()
      const m = String(dueDate.getMonth() + 1).padStart(2, "0")
      const d = String(dueDate.getDate()).padStart(2, "0")
      formData.set("dueDate", `${y}-${m}-${d}`)
    } else {
      formData.delete("dueDate")
    }
    startTransition(async () => {
      await createTask(formData)
      close()
    })
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true)
          setTimeout(() => inputRef.current?.focus(), 0)
        }}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 py-2 transition-colors"
      >
        <span className="text-lg leading-none">+</span> Добавить задачу
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-gray-200 rounded-xl p-3 mt-2"
    >
      <input
        ref={inputRef}
        name="title"
        placeholder="Название задачи"
        autoFocus
        required
        className="w-full text-sm text-gray-800 placeholder-gray-400 outline-none"
        onKeyDown={(e) => e.key === "Escape" && close()}
      />

      <div className="flex items-center gap-2 mt-3 mb-3">
        {/* Date picker */}
        <DatePicker value={dueDate} onChange={setDueDate} />

        {/* Estimate input */}
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
        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={close}
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            Добавить
          </button>
        </div>
      </div>
    </form>

  )
}
