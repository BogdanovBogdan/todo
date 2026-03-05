"use server"

import { auth } from "@/auth"
import { db } from "@/db"
import { tasks } from "@/db/schema"
import { and, eq, lt, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { parseEstimate } from "@/lib/utils/time"

function revalidateTasks() {
  revalidatePath("/", "layout")
}

export async function fetchTask(id: string) {
  const session = await auth()
  if (!session?.user?.id) return null

  const row = await db.query.tasks.findFirst({
    where: and(eq(tasks.id, id), eq(tasks.userId, session.user.id)),
  })
  if (!row) return null

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? null,
    completed: row.completed,
    dueDate: row.dueDate ?? null,
    estimatedDuration: row.estimatedDuration ?? null,
  }
}

export async function createTask(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const title = (formData.get("title") as string)?.trim()
  const dueDateStr = formData.get("dueDate") as string | null
  const estimateStr = formData.get("estimate") as string | null

  if (!title) return

  await db.insert(tasks).values({
    userId: session.user.id,
    title,
    dueDate: dueDateStr || null,
    estimatedDuration: estimateStr ? parseEstimate(estimateStr) : null,
  })

  revalidateTasks()
}

export async function toggleTask(id: string, completed: boolean, todayStr?: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db
    .update(tasks)
    .set({
      completed,
      completedAt: completed ? new Date() : null,
      updatedAt: new Date(),
      // If completing an overdue task, move its dueDate to today
      ...(completed && todayStr
        ? {
            dueDate: sql`CASE WHEN ${tasks.dueDate} IS NOT NULL AND ${tasks.dueDate} < ${todayStr} THEN ${todayStr} ELSE ${tasks.dueDate} END`,
          }
        : {}),
    })
    .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)))

  revalidateTasks()
}

export async function updateTaskDueDate(id: string, dueDateStr: string | null) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db
    .update(tasks)
    .set({ dueDate: dueDateStr || null, updatedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)))

  revalidateTasks()
}

export async function updateTaskEstimate(id: string, estimatedDuration: number | null) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db
    .update(tasks)
    .set({ estimatedDuration, updatedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)))

  revalidateTasks()
}

export async function updateTaskTitle(id: string, title: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const trimmed = title.trim()
  if (!trimmed) return

  await db
    .update(tasks)
    .set({ title: trimmed, updatedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)))

  revalidateTasks()
}

export async function updateTaskDescription(id: string, description: string | null) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db
    .update(tasks)
    .set({ description: description?.trim() ?? null, updatedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)))

  revalidateTasks()
}

export async function deleteTask(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db
    .delete(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)))

  revalidateTasks()
}

export async function rescheduleOverdueTasks(newDate: string, todayStr: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db
    .update(tasks)
    .set({ dueDate: newDate, updatedAt: new Date() })
    .where(
      and(
        eq(tasks.userId, session.user.id),
        eq(tasks.completed, false),
        lt(tasks.dueDate, todayStr)
      )
    )

  revalidateTasks()
}
