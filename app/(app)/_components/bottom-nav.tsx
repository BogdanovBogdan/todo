"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/inbox", icon: "📥", label: "Inbox" },
  { href: "/today", icon: "📅", label: "Today" },
  { href: "/timer", icon: "⏱", label: "Таймер" },
  { href: "/reports", icon: "📊", label: "Отчёты" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 z-40 flex">
      {links.map(({ href, icon, label }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs transition-colors ${
              active ? "text-red-500" : "text-gray-500"
            }`}
          >
            <span className="text-xl leading-none">{icon}</span>
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
