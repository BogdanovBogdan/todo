import { auth } from "@/auth"
import { db } from "@/db"
import { tasks } from "@/db/schema"
import { desc, eq } from "drizzle-orm"
import { TaskStoreInitializer } from "../_components/task-store-initializer"
import { InboxTaskList } from "./_components/inbox-task-list"

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

  const completedCount = allTasks.filter((t) => t.completed).length

  return (
    <>
      <TaskStoreInitializer tasks={allTasks} />
      <InboxTaskList
        showCompleted={showCompleted}
        completedTotalCount={completedCount}
      />
    </>
  )
}
