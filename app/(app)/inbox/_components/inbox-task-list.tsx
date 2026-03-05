"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useTaskStore } from "@/lib/stores/task-store"
import { TaskItem } from "../../_components/task-item"
import { AddTaskForm } from "../../_components/add-task-form"

interface Props {
  showCompleted: boolean
  completedTotalCount: number
}

function InboxTaskListInner({ showCompleted, completedTotalCount }: Props) {
  const tasks = useTaskStore((s) => s.tasks)

  const visibleTasks = showCompleted ? tasks : tasks.filter((t) => !t.completed)

  return (
    <div className="max-w-2xl w-full min-w-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Inbox</h1>
        {completedTotalCount > 0 && (
          <Link
            href={showCompleted ? "/inbox" : "/inbox?showCompleted=1"}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {showCompleted
              ? "Hide completed"
              : `Show completed (${completedTotalCount})`}
          </Link>
        )}
      </div>

      <div>
        {visibleTasks.map((task) => (
          <TaskItem key={task.id} taskId={task.id} />
        ))}
        {visibleTasks.length === 0 && !showCompleted && (
          <p className="text-sm text-gray-400 py-4">No tasks. Add one below.</p>
        )}
      </div>

      <div className="mt-2">
        <AddTaskForm />
      </div>
    </div>
  )
}

export const InboxTaskList = dynamic(
  () => Promise.resolve(InboxTaskListInner),
  { ssr: false }
)
