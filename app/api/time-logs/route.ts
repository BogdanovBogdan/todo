import { auth } from "@/auth"
import { db } from "@/db"
import { timeLogs } from "@/db/schema"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

  const body = await request.json()
  const { taskId, startTime, duration, type } = body

  if (!taskId || !startTime || !duration || duration < 1) {
    return new Response("Bad Request", { status: 400 })
  }

  await db.insert(timeLogs).values({
    taskId,
    userId: session.user.id,
    startTime: new Date(startTime),
    duration: Math.floor(duration),
    type: type === "pomodoro" ? "pomodoro" : "stopwatch",
  })

  return new Response("OK", { status: 200 })
}
