"use server"

import { auth } from "@/auth"
import { db } from "@/db"
import { timeLogs } from "@/db/schema"
import { and, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

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
