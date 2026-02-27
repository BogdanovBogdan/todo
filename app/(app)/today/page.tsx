import { auth } from "@/auth"
import { db } from "@/db"
import { tasks } from "@/db/schema"
import { and, desc, eq, lt } from "drizzle-orm"
import { cookies } from "next/headers"
import Link from "next/link"
import { AddTaskForm } from "../_components/add-task-form"
import { TaskItem } from "../_components/task-item"
import { CopyTasksButton } from "./_components/copy-tasks-button"
import { RescheduleButton } from "./_components/reschedule-button"

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ showCompleted?: string }>
}) {
  const { showCompleted: param } = await searchParams
  const showCompleted = param === "1"

  const session = await auth()

  const cookieStore = await cookies()
  const todayStr =
    cookieStore.get("local_today")?.value ??
    new Date().toISOString().slice(0, 10)

  const overdueTasks = await db.query.tasks.findMany({
    where: and(
      eq(tasks.userId, session!.user!.id!),
      lt(tasks.dueDate, todayStr)
    ),
    orderBy: [desc(tasks.createdAt)],
  })

  const todayTasks = await db.query.tasks.findMany({
    where: and(
      eq(tasks.userId, session!.user!.id!),
      eq(tasks.dueDate, todayStr)
    ),
    orderBy: [desc(tasks.createdAt)],
  })

  const visibleOverdue = showCompleted
    ? overdueTasks
    : overdueTasks.filter((t) => !t.completed)

  const visibleToday = showCompleted
    ? todayTasks
    : todayTasks.filter((t) => !t.completed)

  const hasOverdue = visibleOverdue.length > 0

  const completedCount = [...overdueTasks, ...todayTasks].filter((t) => t.completed).length

  return (
    <div className={hasOverdue ? "max-w-5xl w-full min-w-0" : "max-w-2xl w-full min-w-0"}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Today</h1>
        <div className="flex items-center gap-4">
          {!hasOverdue && <CopyTasksButton tasks={todayTasks} todayStr={todayStr} />}
          {completedCount > 0 && (
            <Link
              href={showCompleted ? "/today" : "/today?showCompleted=1"}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {showCompleted ? "Hide completed" : `Show completed (${completedCount})`}
            </Link>
          )}
        </div>
      </div>

      <div className={hasOverdue ? "grid grid-cols-2 gap-8 items-start" : ""}>

        {hasOverdue && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wider">
                Overdue <span className="text-xs font-normal text-red-400">{visibleOverdue.length}</span>
              </h2>
              <RescheduleButton todayStr={todayStr} />
            </div>
            {visibleOverdue.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}

        <div>
          {hasOverdue && (
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Today <span className="text-xs font-normal text-gray-400">{visibleToday.length}</span>
              </h2>
              <CopyTasksButton tasks={todayTasks} todayStr={todayStr} />
            </div>
          )}
          {visibleToday.map((task) => (
            <TaskItem key={task.id} task={task} />
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
