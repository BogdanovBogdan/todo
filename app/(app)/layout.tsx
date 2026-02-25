import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { BottomNav } from "./_components/bottom-nav"
import { SidebarNav } from "./_components/sidebar-nav"
import { DateSync } from "./_components/date-sync"
import { TimerBar } from "./_components/timer/timer-bar"
import { TimerNotification } from "./_components/timer/timer-notification"
import { TimerProvider } from "./_components/timer/timer-context"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <TimerProvider>
      <DateSync />
      <TimerNotification />
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar — desktop only */}
        <aside className="hidden md:flex md:flex-col w-56 border-r border-gray-200 bg-white px-3 py-6 flex-shrink-0">
          <div className="mb-6 px-3">
            <span className="text-sm font-semibold text-gray-900">
              {session.user.name}
            </span>
          </div>
          <SidebarNav />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 md:p-8 pb-36 md:pb-20 overflow-x-hidden">{children}</main>
      </div>

      <TimerBar />
      <BottomNav />
    </TimerProvider>
  )
}
