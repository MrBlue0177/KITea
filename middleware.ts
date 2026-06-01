import NextAuth from "next-auth"

import { authConfig } from "@/auth.config"

export default NextAuth(authConfig).auth

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
