"use server"

import { auth } from "@/auth"
import { db } from "@/db"
import { tasks } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { parseEstimate } from "@/lib/utils/time"

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
    dueDate: dueDateStr ? new Date(dueDateStr) : null,
    estimatedDuration: estimateStr ? parseEstimate(estimateStr) : null,
  })

  revalidatePath("/inbox")
  revalidatePath("/today")
}

export async function toggleTask(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const task = await db.query.tasks.findFirst({
    where: and(eq(tasks.id, id), eq(tasks.userId, session.user.id)),
  })

  if (!task) return

  await db
    .update(tasks)
    .set({
      completed: !task.completed,
      completedAt: !task.completed ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, id))

  revalidatePath("/inbox")
  revalidatePath("/today")
}

export async function updateTaskDueDate(id: string, dueDate: Date | null) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db
    .update(tasks)
    .set({ dueDate, updatedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)))

  revalidatePath("/inbox")
  revalidatePath("/today")
}

export async function updateTaskEstimate(id: string, estimatedDuration: number | null) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db
    .update(tasks)
    .set({ estimatedDuration, updatedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)))

  revalidatePath("/inbox")
  revalidatePath("/today")
}

export async function deleteTask(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db
    .delete(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)))

  revalidatePath("/inbox")
  revalidatePath("/today")
}
