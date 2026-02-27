"use client"

import { useTransition } from "react"
import { DatePicker } from "@/app/(app)/_components/date-picker"
import { rescheduleOverdueTasks } from "@/lib/actions/tasks"

interface Props {
  todayStr: string
}

export function RescheduleButton({ todayStr }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleDateChange(date: string | null) {
    if (!date) return
    startTransition(() => rescheduleOverdueTasks(date, todayStr))
  }

  return (
    <div className={isPending ? "opacity-50 pointer-events-none" : ""}>
      <DatePicker value={null} onChange={handleDateChange} placeholder="Reschedule all" />
    </div>
  )
}
