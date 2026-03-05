import { auth } from "@/auth"
import { db } from "@/db"
import { tasks } from "@/db/schema"
import { and, desc, eq, lt } from "drizzle-orm"
import { cookies } from "next/headers"
import { TaskStoreInitializer } from "../_components/task-store-initializer"
import { TodayColumns } from "./_components/today-columns"

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

  const completedCount = todayTasks.filter((t) => t.completed).length

  return (
    <>
      <TaskStoreInitializer tasks={[...overdueTasks, ...todayTasks]} />
      <TodayColumns
        todayStr={todayStr}
        showCompleted={showCompleted}
        completedTotalCount={completedCount}
      />
    </>
  )
}
