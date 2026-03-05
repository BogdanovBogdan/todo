import { auth } from "@/auth"
import { db } from "@/db"
import { tasks, timeLogs } from "@/db/schema"
import { getDayBoundsUTC, toLocalDateStr, formatInTz } from "@/lib/utils/tz"
import { and, eq, gte, inArray, lt, sql } from "drizzle-orm"
import { cookies } from "next/headers"
import Link from "next/link"
import { CopyDayButton } from "./_components/copy-day-button"
import { EditableTaskDuration } from "./_components/editable-task-duration"
import { TaskTitleButton } from "../_components/task-title-button"

type Period = "week" | "last-week" | "month"

function eachLocalDay(startStr: string, endStr: string): string[] {
  const result: string[] = []
  let cur = startStr
  while (cur <= endStr) {
    result.push(cur)
    const [y, m, d] = cur.split("-").map(Number)
    const next = new Date(y, m - 1, d + 1)
    cur = new Intl.DateTimeFormat("en-CA").format(next)
  }
  return result
}

function getPeriodRange(
  period: Period,
  tz: string,
  todayStr: string
): { start: Date; end: Date; startStr: string; endStr: string } {
  const [ty, tm, td] = todayStr.split("-").map(Number)
  const todayDate = new Date(ty, tm - 1, td)
  const dow = todayDate.getDay() // 0=Sun..6=Sat
  const mondayOffset = (dow + 6) % 7 // days since Monday

  switch (period) {
    case "week": {
      const monDate = new Date(ty, tm - 1, td - mondayOffset)
      const sunDate = new Date(ty, tm - 1, td - mondayOffset + 6)
      const startStr = new Intl.DateTimeFormat("en-CA").format(monDate)
      const endStr = new Intl.DateTimeFormat("en-CA").format(sunDate)
      return {
        start: getDayBoundsUTC(startStr, tz).start,
        end: getDayBoundsUTC(endStr, tz).end,
        startStr,
        endStr,
      }
    }
    case "last-week": {
      const monDate = new Date(ty, tm - 1, td - mondayOffset - 7)
      const sunDate = new Date(ty, tm - 1, td - mondayOffset - 1)
      const startStr = new Intl.DateTimeFormat("en-CA").format(monDate)
      const endStr = new Intl.DateTimeFormat("en-CA").format(sunDate)
      return {
        start: getDayBoundsUTC(startStr, tz).start,
        end: getDayBoundsUTC(endStr, tz).end,
        startStr,
        endStr,
      }
    }
    case "month": {
      const startStr = `${ty}-${String(tm).padStart(2, "0")}-01`
      const lastDay = new Date(ty, tm, 0).getDate()
      const endStr = `${ty}-${String(tm).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`
      return {
        start: getDayBoundsUTC(startStr, tz).start,
        end: getDayBoundsUTC(endStr, tz).end,
        startStr,
        endStr,
      }
    }
  }
}

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

const PERIOD_LABELS: Record<Period, string> = {
  week: "Week",
  "last-week": "Last week",
  month: "Month",
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const { period: raw } = await searchParams
  const period: Period =
    raw === "last-week" || raw === "month" ? raw : "week"

  const cookieStore = await cookies()
  const tz =
    decodeURIComponent(cookieStore.get("user_tz")?.value ?? "") || "UTC"
  const todayStr =
    cookieStore.get("local_today")?.value ??
    new Date().toISOString().slice(0, 10)

  const { start, end, startStr, endStr } = getPeriodRange(period, tz, todayStr)
  const session = await auth()

  const logs = await db
    .select({
      id: timeLogs.id,
      startTime: timeLogs.startTime,
      duration: timeLogs.duration,
      taskId: tasks.id,
      taskTitle: tasks.title,
      completed: tasks.completed,
    })
    .from(timeLogs)
    .innerJoin(tasks, eq(timeLogs.taskId, tasks.id))
    .where(
      and(
        eq(timeLogs.userId, session!.user!.id!),
        gte(timeLogs.startTime, start),
        lt(timeLogs.startTime, end)
      )
    )

  // ── All-time tracked + estimated per task ────────────────────────────────────
  const taskIds = [...new Set(logs.map((l) => l.taskId))]

  type AllTimeRow = { totalTracked: number; estimatedDuration: number | null }
  const allTimeByTask = new Map<string, AllTimeRow>()

  if (taskIds.length > 0) {
    const allTimeLogs = await db
      .select({
        taskId: timeLogs.taskId,
        totalTracked: sql<number>`sum(${timeLogs.duration})::int`,
        estimatedDuration: tasks.estimatedDuration,
      })
      .from(timeLogs)
      .innerJoin(tasks, eq(timeLogs.taskId, tasks.id))
      .where(
        and(
          eq(timeLogs.userId, session!.user!.id!),
          inArray(timeLogs.taskId, taskIds)
        )
      )
      .groupBy(timeLogs.taskId, tasks.estimatedDuration)

    for (const row of allTimeLogs) {
      allTimeByTask.set(row.taskId, {
        totalTracked: row.totalTracked,
        estimatedDuration: row.estimatedDuration ?? null,
      })
    }
  }

  // ── Aggregate by local day & task ────────────────────────────────────────────
  type TaskRow = { taskTitle: string; duration: number; completed: boolean; logIds: string[] }
  type DayData = { total: number; tasks: Map<string, TaskRow> }

  const allDayStrs = eachLocalDay(startStr, endStr)
  const dayMap = new Map<string, DayData>()
  for (const ds of allDayStrs) {
    dayMap.set(ds, { total: 0, tasks: new Map() })
  }

  for (const log of logs) {
    const key = toLocalDateStr(log.startTime, tz)
    const day = dayMap.get(key)
    if (!day) continue
    day.total += log.duration
    const existing = day.tasks.get(log.taskId)
    if (existing) {
      existing.duration += log.duration
      existing.logIds.push(log.id)
    } else {
      day.tasks.set(log.taskId, {
        taskTitle: log.taskTitle,
        duration: log.duration,
        completed: log.completed,
        logIds: [log.id],
      })
    }
  }

  const chartDays = allDayStrs.map((key) => ({
    key,
    total: dayMap.get(key)?.total ?? 0,
  }))

  const maxTotal = Math.max(...chartDays.map((d) => d.total), 1)
  const periodTotal = chartDays.reduce((s, d) => s + d.total, 0)
  const daysWithData = chartDays
    .filter((d) => d.total > 0)
    .sort((a, b) => (b.key > a.key ? 1 : -1))

  return (
    <div className="max-w-2xl w-full min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>

        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
          {(["week", "last-week", "month"] as Period[]).map((p, i) => (
            <Link
              key={p}
              href={`/reports?period=${p}`}
              className={`px-3 py-1.5 transition-colors ${i > 0 ? "border-l border-gray-200" : ""} ${
                period === p
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {PERIOD_LABELS[p]}
            </Link>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="mb-8">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
          Total for period
        </p>
        <p className="text-3xl font-mono font-semibold text-gray-900">
          {formatDuration(periodTotal)}
        </p>
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-8">
        <div className="flex items-end gap-1.5" style={{ height: 120 }}>
          {chartDays.map(({ key, total }) => {
            const pct = total > 0 ? Math.max(4, (total / maxTotal) * 100) : 0
            const isToday = key === todayStr
            return (
              <div
                key={key}
                className="flex-1 flex flex-col items-center gap-1.5"
              >
                <div className="w-full flex items-end" style={{ height: 96 }}>
                  {total > 0 && (
                    <div
                      title={formatDuration(total)}
                      className={`w-full rounded-t transition-all ${
                        isToday ? "bg-red-400" : "bg-gray-200 hover:bg-gray-300"
                      }`}
                      style={{ height: `${pct}%` }}
                    />
                  )}
                  {total === 0 && (
                    <div className="w-full h-0.5 bg-gray-100 rounded self-end" />
                  )}
                </div>
                <span
                  className={`text-[10px] leading-none ${
                    isToday ? "font-semibold text-red-500" : "text-gray-400"
                  }`}
                >
                  {formatInTz(getDayBoundsUTC(key, tz).start, tz, {
                    weekday: "short",
                  })}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Day breakdown */}
      {daysWithData.length === 0 ? (
        <p className="text-sm text-gray-400">
          No data for this period.
        </p>
      ) : (
        <div className="space-y-6">
          {daysWithData.map(({ key, total }) => {
            const taskList = Array.from(
              dayMap.get(key)!.tasks.entries()
            ).sort((a, b) => b[1].duration - a[1].duration)

            const dayLabel =
              key === todayStr
                ? "Today"
                : new Intl.DateTimeFormat("en-US", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  }).format(getDayBoundsUTC(key, tz).start)
            const totalFormatted = formatDuration(total)

            const copyTasks = taskList.map(([taskId, task]) => {
              const allTime = allTimeByTask.get(taskId)
              const estimated = allTime?.estimatedDuration ?? null
              const totalTracked = allTime?.totalTracked ?? 0
              const isDone =
                estimated !== null
                  ? totalTracked >= estimated * 0.9
                  : task.completed
              return {
                title: task.taskTitle,
                completed: isDone,
                trackedFormatted: formatDuration(task.duration),
                estimatedFormatted: estimated
                  ? formatDuration(estimated)
                  : null,
              }
            })

            return (
              <div key={key}>
                {/* Day header */}
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="text-sm font-semibold text-gray-700 capitalize truncate flex-1 min-w-0">
                    {dayLabel}
                  </span>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <CopyDayButton
                      dayLabel={dayLabel}
                      totalFormatted={totalFormatted}
                      tasks={copyTasks}
                    />
                    <span className="text-sm font-mono text-gray-500">
                      {totalFormatted}
                    </span>
                  </div>
                </div>

                {/* Task rows */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                  {taskList.map(([taskId, task]) => {
                    const allTime = allTimeByTask.get(taskId)
                    const estimated = allTime?.estimatedDuration ?? null
                    const totalTracked = allTime?.totalTracked ?? 0
                    const ratio = estimated ? totalTracked / estimated : null
                    const indicatorColor =
                      ratio === null
                        ? null
                        : ratio >= 1
                          ? "text-green-500"
                          : ratio >= 0.8
                            ? "text-orange-400"
                            : "text-red-500"
                    const isDone =
                      estimated !== null
                        ? totalTracked >= estimated * 0.9
                        : task.completed

                    return (
                      <div key={taskId} className="px-4 py-3">
                        {/* Title row */}
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base leading-none flex-shrink-0">
                            {isDone ? "✅" : "❌"}
                          </span>
                          <TaskTitleButton taskId={taskId} taskTitle={task.taskTitle} />
                          <EditableTaskDuration
                            logIds={task.logIds}
                            initialDuration={task.duration}
                          />
                        </div>
                        {/* Estimate indicator row */}
                        {estimated !== null && (
                          <div className="mt-1 pl-7">
                            <span
                              className={`text-xs font-mono ${indicatorColor}`}
                            >
                              {formatDuration(totalTracked)} /{" "}
                              {formatDuration(estimated)}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
