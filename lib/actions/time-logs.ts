"use server"

import { auth } from "@/auth"
import { db } from "@/db"
import { timeLogs } from "@/db/schema"

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
