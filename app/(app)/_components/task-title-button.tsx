"use client"

import { useState } from "react"
import { fetchTask } from "@/lib/actions/tasks"
import { useTaskStore } from "@/lib/stores/task-store"
import { TaskModal } from "./task-modal"

interface Props {
  taskId: string
  taskTitle: string
  className?: string
}

export function TaskTitleButton({ taskId, taskTitle, className }: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  async function handleClick() {
    const inStore = useTaskStore.getState().tasks.find((t) => t.id === taskId)
    if (!inStore) {
      const task = await fetchTask(taskId)
      if (task) useTaskStore.getState().addTask(task)
    }
    setModalOpen(true)
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={className ?? "text-sm text-gray-800 truncate flex-1 min-w-0 text-left hover:text-gray-600 transition-colors cursor-pointer"}
      >
        {taskTitle}
      </button>
      {modalOpen && (
        <TaskModal taskId={taskId} onClose={() => setModalOpen(false)} />
      )}
    </>
  )
}
