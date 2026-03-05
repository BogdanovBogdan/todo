"use client"

import { useEffect } from "react"
import { useTaskStore } from "@/lib/stores/task-store"
import type { Task } from "@/lib/types/task"

export function TaskStoreInitializer({ tasks }: { tasks: Task[] }) {
  // No deps array: runs after every RSC re-render so fresh server data syncs to store
  useEffect(() => {
    useTaskStore.getState().setTasks(tasks)
  })
  return null
}
