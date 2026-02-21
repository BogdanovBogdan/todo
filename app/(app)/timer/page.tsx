import { auth } from "@/auth"
import { db } from "@/db"
import { tasks, timeLogs } from "@/db/schema"
import { addSeconds, format, isToday, isYesterday, startOfWeek } from "date-fns"
import { ru } from "date-fns/locale"
import { desc, eq } from "drizzle-orm"
import Link from "next/link"
import { EditableDuration } from "./_components/editable-duration"
import { LogActions } from "./_components/log-actions"

const DAYS_PER_PAGE = 3

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

function formatTimeRange(startTime: Date, duration: number): string {
  const end = addSeconds(startTime, duration)
  return `${format(startTime, "HH:mm")} — ${format(end, "HH:mm")}`
}

function formatDayLabel(date: Date): string {
  if (isToday(date)) return "Сегодня"
  if (isYesterday(date)) return "Вчера"
  return format(date, "EEE, d MMM", { locale: ru })
}

export default async function TimerPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>
}) {
  const { days: daysParam } = await searchParams
  const daysToShow = Math.max(
    DAYS_PER_PAGE,
    parseInt(daysParam ?? "") || DAYS_PER_PAGE
  )

  const session = await auth()

  const logs = await db
    .select({
      id: timeLogs.id,
      startTime: timeLogs.startTime,
      duration: timeLogs.duration,
      type: timeLogs.type,
      taskId: tasks.id,
      taskTitle: tasks.title,
    })
    .from(timeLogs)
    .innerJoin(tasks, eq(timeLogs.taskId, tasks.id))
    .where(eq(timeLogs.userId, session!.user!.id!))
    .orderBy(desc(timeLogs.startTime))
    .limit(500)

  // Group logs by calendar day
  type Log = (typeof logs)[number]
  const dayMap = new Map<string, { date: Date; logs: Log[]; total: number }>()

  for (const log of logs) {
    const key = format(log.startTime, "yyyy-MM-dd")
    if (!dayMap.has(key)) {
      dayMap.set(key, { date: log.startTime, logs: [], total: 0 })
    }
    const group = dayMap.get(key)!
    group.logs.push(log)
    group.total += log.duration
  }

  const allDays = Array.from(dayMap.values())
  const visibleDays = allDays.slice(0, daysToShow)
  const hasMore = allDays.length > daysToShow

  // Header stats
  const todayTotal = logs
    .filter((l) => isToday(l.startTime))
    .reduce((sum, l) => sum + l.duration, 0)

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekTotal = logs
    .filter((l) => l.startTime >= weekStart)
    .reduce((sum, l) => sum + l.duration, 0)

  return (
    <div className="max-w-2xl w-full min-w-0">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Таймер</h1>

      {/* Stats */}
      <div className="flex items-center gap-8 mb-8 pb-6 border-b border-gray-100">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Сегодня
          </p>
          <p className="text-2xl font-mono font-semibold text-gray-900">
            {formatDuration(todayTotal)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            За неделю
          </p>
          <p className="text-2xl font-mono font-semibold text-gray-900">
            {formatDuration(weekTotal)}
          </p>
        </div>
      </div>

      {/* Empty state */}
      {logs.length === 0 && (
        <p className="text-sm text-gray-400 py-4">
          Нет записей. Запусти таймер на любой задаче.
        </p>
      )}

      {/* Day groups */}
      <div className="space-y-6">
        {visibleDays.map(({ date, logs: dayLogs, total }) => (
          <div key={format(date, "yyyy-MM-dd")}>
            {/* Day header */}
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-sm font-semibold text-gray-700">
                {formatDayLabel(date)}
              </span>
              <span className="text-sm font-mono text-gray-500">
                {formatDuration(total)}
              </span>
            </div>

            {/* Entries */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
              {dayLogs.map((log) => (
                <div
                  key={log.id}
                  className="group flex items-center gap-3 px-4 py-3 min-w-0"
                >
                  <span className="text-sm flex-shrink-0">
                    {log.type === "pomodoro" ? "🍅" : "⏱"}
                  </span>

                  <span className="flex-1 min-w-0 text-sm text-gray-800 truncate">
                    {log.taskTitle}
                  </span>

                  <LogActions taskId={log.taskId} taskTitle={log.taskTitle} />

                  <span className="hidden md:block text-xs text-gray-400 flex-shrink-0 tabular-nums">
                    {formatTimeRange(log.startTime, log.duration)}
                  </span>

                  <EditableDuration logId={log.id} initialDuration={log.duration} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="mt-8 text-center">
          <Link
            href={`/timer?days=${daysToShow + DAYS_PER_PAGE}`}
            className="inline-block px-5 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Загрузить ещё
          </Link>
        </div>
      )}
    </div>
  )
}
