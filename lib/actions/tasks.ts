"use server"

import { auth } from "@/auth"
import { db } from "@/db"
import { tasks } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { parseEstimate } from "@/lib/utils/time"

function revalidateTasks() {
  revalidatePath("/", "layout")
}

function parseDateStr(str: string): Date {
  const [y, m, d] = str.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
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
    dueDate: dueDateStr ? parseDateStr(dueDateStr) : null,
    estimatedDuration: estimateStr ? parseEstimate(estimateStr) : null,
  })

  revalidateTasks()
}

export async function toggleTask(id: string, completed: boolean) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db
    .update(tasks)
    .set({
      completed,
      completedAt: completed ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)))

  revalidateTasks()
}

export async function updateTaskDueDate(id: string, dueDateStr: string | null) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const dueDate = dueDateStr ? parseDateStr(dueDateStr) : null

  await db
    .update(tasks)
    .set({ dueDate, updatedAt: new Date() })
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

export async function deleteTask(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db
    .delete(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)))

  revalidateTasks()
}
