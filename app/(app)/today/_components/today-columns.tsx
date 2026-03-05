"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useTaskStore } from "@/lib/stores/task-store"
import { TaskItem } from "../../_components/task-item"
import { AddTaskForm } from "../../_components/add-task-form"
import { CopyTasksButton } from "./copy-tasks-button"
import { RescheduleButton } from "./reschedule-button"

interface Props {
  todayStr: string
  showCompleted: boolean
  completedTotalCount: number
}

function TodayColumnsInner({ todayStr, showCompleted, completedTotalCount }: Props) {
  const tasks = useTaskStore((s) => s.tasks)

  const overdueTasks = tasks.filter((t) => t.dueDate != null && t.dueDate < todayStr)
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr)

  const visibleOverdue = overdueTasks.filter((t) => !t.completed)

  const visibleToday = showCompleted
    ? todayTasks
    : todayTasks.filter((t) => !t.completed)

  const hasOverdue = visibleOverdue.length > 0

  return (
    <div className={hasOverdue ? "max-w-5xl w-full min-w-0" : "max-w-2xl w-full min-w-0"}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Today</h1>
        <div className="flex items-center gap-4">
          {!hasOverdue && <CopyTasksButton tasks={todayTasks} todayStr={todayStr} />}
          {completedTotalCount > 0 && (
            <Link
              href={showCompleted ? "/today" : "/today?showCompleted=1"}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {showCompleted
                ? "Hide completed"
                : `Show completed (${completedTotalCount})`}
            </Link>
          )}
        </div>
      </div>

      <div className={hasOverdue ? "grid grid-cols-2 gap-8 items-start" : ""}>

        {hasOverdue && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wider">
                Overdue{" "}
                <span className="text-xs font-normal text-red-400">
                  {visibleOverdue.length}
                </span>
              </h2>
              <RescheduleButton todayStr={todayStr} />
            </div>
            {visibleOverdue.map((task) => (
              <TaskItem key={task.id} taskId={task.id} />
            ))}
          </div>
        )}

        <div>
          {hasOverdue && (
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Today{" "}
                <span className="text-xs font-normal text-gray-400">
                  {visibleToday.length}
                </span>
              </h2>
              <CopyTasksButton tasks={todayTasks} todayStr={todayStr} />
            </div>
          )}
          {visibleToday.map((task) => (
            <TaskItem key={task.id} taskId={task.id} />
          ))}
          {visibleToday.length === 0 && !showCompleted && (
            <p className="text-sm text-gray-400 py-4">No tasks due today.</p>
          )}
          <div className="mt-2">
            <AddTaskForm defaultDate={todayStr} />
          </div>
        </div>

      </div>
    </div>
  )
}

export const TodayColumns = dynamic(
  () => Promise.resolve(TodayColumnsInner),
  { ssr: false }
)
