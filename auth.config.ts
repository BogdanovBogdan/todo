import type { NextAuthConfig } from "next-auth"

// Lightweight config used in middleware (edge-compatible, no DB imports)
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isPublicPage = nextUrl.pathname === "/login"

      if (isPublicPage) return true
      if (isLoggedIn) return true

      return false // redirect to /login
    },
  },
  providers: [],
} satisfies NextAuthConfig
