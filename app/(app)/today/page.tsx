import { auth } from "@/auth"
import { db } from "@/db"
import { tasks } from "@/db/schema"
import { and, desc, eq, gte, lt } from "drizzle-orm"
import Link from "next/link"
import { AddTaskForm } from "../_components/add-task-form"
import { TaskItem } from "../_components/task-item"

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ showCompleted?: string }>
}) {
  const { showCompleted: param } = await searchParams
  const showCompleted = param === "1"

  const session = await auth()

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

  const allTasks = await db.query.tasks.findMany({
    where: and(
      eq(tasks.userId, session!.user!.id!),
      gte(tasks.dueDate, startOfDay),
      lt(tasks.dueDate, endOfDay)
    ),
    orderBy: [desc(tasks.createdAt)],
  })

  const visibleTasks = showCompleted
    ? allTasks
    : allTasks.filter((t) => !t.completed)

  const completedCount = allTasks.filter((t) => t.completed).length

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Today</h1>
        {completedCount > 0 && (
          <Link
            href={showCompleted ? "/today" : "/today?showCompleted=1"}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {showCompleted
              ? "Hide completed"
              : `Show completed (${completedCount})`}
          </Link>
        )}
      </div>

      <div>
        {visibleTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
        {visibleTasks.length === 0 && !showCompleted && (
          <p className="text-sm text-gray-400 py-4">
            No tasks due today.
          </p>
        )}
      </div>

      <div className="mt-2">
        <AddTaskForm />
      </div>
    </div>
  )
}
