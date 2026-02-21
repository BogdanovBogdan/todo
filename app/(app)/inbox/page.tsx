import { auth } from "@/auth"
import { db } from "@/db"
import { tasks } from "@/db/schema"
import { desc, eq } from "drizzle-orm"
import Link from "next/link"
import { AddTaskForm } from "../_components/add-task-form"
import { TaskItem } from "../_components/task-item"

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ showCompleted?: string }>
}) {
  const { showCompleted: param } = await searchParams
  const showCompleted = param === "1"

  const session = await auth()
  const allTasks = await db.query.tasks.findMany({
    where: eq(tasks.userId, session!.user!.id!),
    orderBy: [desc(tasks.createdAt)],
  })

  const visibleTasks = showCompleted
    ? allTasks
    : allTasks.filter((t) => !t.completed)

  const completedCount = allTasks.filter((t) => t.completed).length

  return (
    <div className="max-w-2xl w-full min-w-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Inbox</h1>
        {completedCount > 0 && (
          <Link
            href={showCompleted ? "/inbox" : "/inbox?showCompleted=1"}
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
            No tasks. Add one below.
          </p>
        )}
      </div>

      <div className="mt-2">
        <AddTaskForm />
      </div>
    </div>
  )
}
