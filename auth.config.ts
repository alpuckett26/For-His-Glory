import type { NextAuthConfig } from 'next-auth'

// Edge-safe auth config — no database imports, used by middleware
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/sign-in',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as string
      return session
    },
  },
  providers: [],
  session: { strategy: 'jwt' },
}
