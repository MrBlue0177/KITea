import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"

import { authConfig } from "@/auth.config"
import { getPrisma } from "@/lib/prisma"
import { getGoogleAuthEnv } from "@/lib/env"

const THIRTY_DAYS = 30 * 24 * 60 * 60

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth(
  () => {
    try {
      const env = getGoogleAuthEnv()

      // Set NEXTAUTH_URL for local development if not provided
      const nextAuthUrl = env.NEXTAUTH_URL || "http://localhost:3000"

      console.log("[Auth] Initializing with NEXTAUTH_URL:", nextAuthUrl)

      // Only include Google provider if credentials are available
      const providers = []
      if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
        providers.push(
          Google({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                prompt: "consent",
                access_type: "offline",
                response_type: "code",
              },
            },
          })
        )
      } else {
        console.warn("[Auth] Google OAuth credentials not provided. Google sign-in will not work.")
      }

      return {
        ...authConfig,
        adapter: PrismaAdapter(getPrisma()),
        session: {
          strategy: "jwt", // Switch to JWT to avoid edge runtime issues
          maxAge: THIRTY_DAYS,
          updateAge: 24 * 60 * 60,
        },
        providers,
        callbacks: {
          ...authConfig.callbacks,
          async jwt({ token, user, account }) {
            // Initial sign in
            if (user && account) {
              token.id = user.id
              token.email = user.email
              token.name = user.name
              token.image = user.image
            }
            return token
          },
          async session({ session, token }) {
            if (token && session.user) {
              session.user.id = token.id as string
              session.user.email = token.email as string
              session.user.name = token.name as string
              session.user.image = token.image as string
            }
            return session
          },
          redirect({ url, baseUrl }) {
            // Allows relative URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`
            // Allows URLs on the same origin
            if (new URL(url).origin === baseUrl) return url
            // Default to home page
            return baseUrl
          },
        },
        secret: env.NEXTAUTH_SECRET || "development-secret-change-in-production",
      }
    } catch (error) {
      console.error("[Auth] Initialization error:", error)
      throw error
    }
  }
)
