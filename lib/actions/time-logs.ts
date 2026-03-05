"use server"

import { auth } from "@/auth"
import { db } from "@/db"
import { timeLogs } from "@/db/schema"
import { and, eq, inArray, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

// Updates the total tracked duration for a set of logs belonging to one task+day.
// If one log: updates it directly. If multiple: adjusts the last log so that sum == newTotal.
export async function updateAggregatedDuration(logIds: string[], newTotal: number) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (newTotal < 1 || logIds.length === 0) return

  const rows = await db
    .select({ id: timeLogs.id, duration: timeLogs.duration })
    .from(timeLogs)
    .where(and(inArray(timeLogs.id, logIds), eq(timeLogs.userId, session.user.id)))

  if (rows.length === 0) return

  const targetId = rows.length === 1 ? rows[0].id : rows[rows.length - 1].id
  const sumOfOthers =
    rows.length === 1
      ? 0
      : rows.slice(0, -1).reduce((s, r) => s + r.duration, 0)
  const newDuration = Math.max(1, newTotal - sumOfOthers)

  await db
    .update(timeLogs)
    .set({ duration: newDuration })
    .where(and(eq(timeLogs.id, targetId), eq(timeLogs.userId, session.user.id)))

  revalidatePath("/", "layout")
}

export async function updateTimeLog(id: string, duration: number) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (duration < 1) return

  await db
    .update(timeLogs)
    .set({ duration })
    .where(and(eq(timeLogs.id, id), eq(timeLogs.userId, session.user.id)))

  revalidatePath("/", "layout")
}

export async function getTaskTrackedTime(taskId: string): Promise<number> {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const result = await db
    .select({ total: sql<number>`coalesce(sum(${timeLogs.duration}), 0)` })
    .from(timeLogs)
    .where(and(eq(timeLogs.taskId, taskId), eq(timeLogs.userId, session.user.id)))

  return Number(result[0]?.total ?? 0)
}

export async function saveTimeLog(data: {
  taskId: string
  startTime: Date
  duration: number // seconds
  type: "pomodoro" | "stopwatch"
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (data.duration < 1) return

  await db.insert(timeLogs).values({
    taskId: data.taskId,
    userId: session.user.id,
    startTime: data.startTime,
    duration: data.duration,
    type: data.type,
  })
}
