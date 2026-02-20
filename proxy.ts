import { NextRequest, NextResponse } from "next/server"

// Auth is handled in app/(app)/layout.tsx via `await auth()`
// This proxy handles only basic routing redirects
export function proxy(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}
