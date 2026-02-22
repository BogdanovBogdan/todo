"use client"

import { useEffect } from "react"
import { saveUserTimezone } from "@/lib/actions/users"

export function DateSync() {
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const today = new Intl.DateTimeFormat("en-CA").format(new Date())

    document.cookie = `local_today=${today}; path=/; max-age=86400; SameSite=Lax`

    const existingTz = decodeURIComponent(
      document.cookie
        .split("; ")
        .find((r) => r.startsWith("user_tz="))
        ?.split("=")[1] ?? ""
    )
    document.cookie = `user_tz=${encodeURIComponent(tz)}; path=/; max-age=86400; SameSite=Lax`

    if (existingTz !== tz) saveUserTimezone(tz)
  }, [])

  return null
}
