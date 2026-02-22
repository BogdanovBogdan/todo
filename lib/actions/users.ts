"use server"

import { auth } from "@/auth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function saveUserTimezone(timezone: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) return
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
  } catch {
    return
  }
  await db.update(users).set({ timezone }).where(eq(users.id, session.user.id))
}
