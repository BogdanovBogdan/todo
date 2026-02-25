"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart2, CalendarCheck, Inbox, Timer } from "lucide-react"
import type { LucideIcon } from "lucide-react"

const links: { href: string; icon: LucideIcon; label: string }[] = [
  { href: "/inbox", icon: Inbox, label: "Inbox" },
  { href: "/today", icon: CalendarCheck, label: "Today" },
  { href: "/timer", icon: Timer, label: "Timer" },
  { href: "/reports", icon: BarChart2, label: "Reports" },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      {links.map(({ href, icon: Icon, label }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-gray-100 text-gray-900 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Icon size={16} strokeWidth={active ? 2.25 : 1.75} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
