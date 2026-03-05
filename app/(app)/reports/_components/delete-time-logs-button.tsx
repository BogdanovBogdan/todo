"use client"

import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { deleteTimeLogs } from "@/lib/actions/time-logs"
import { deleteTask } from "@/lib/actions/tasks"

interface Props {
  logIds: string[]
  taskId?: string
}

export function DeleteTimeLogsButton({ logIds, taskId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      if (logIds.length > 0) {
        await deleteTimeLogs(logIds)
      } else if (taskId) {
        await deleteTask(taskId)
      }
      router.refresh()
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className={`opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 cursor-pointer text-gray-300 hover:text-red-500 ${isPending ? "opacity-40" : ""}`}
      aria-label="Delete"
    >
      <Trash2 size={14} />
    </button>
  )
}
