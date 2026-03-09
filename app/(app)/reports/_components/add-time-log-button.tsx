"use client"

import { useState } from "react"
import { AddTimeLogModal } from "./add-time-log-modal"

interface Task {
  id: string
  title: string
}

interface Props {
  tasks: Task[]
  todayStr: string
}

export function AddTimeLogButton({ tasks, todayStr }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
      >
        + Add entry
      </button>
      {open && (
        <AddTimeLogModal
          tasks={tasks}
          todayStr={todayStr}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
