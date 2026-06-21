// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — NextAuth v5 Configuration
// Credentials provider only — email + bcrypt password.
// Role is embedded in the JWT and surfaced on session.user.role.
// ─────────────────────────────────────────────────────────────────────────────

import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectDB } from './mongodb'
import User from '@/models/User'
import type { UserRole } from '@/types'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        await connectDB()

        const user = await User.findOne({
          email: (credentials.email as string).toLowerCase().trim(),
        }).select('+password')

        if (!user) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )
        if (!isValid) return null

        // Return shape must match what jwt() callback receives as `user`
        return {
          id:    user._id.toString(),
          name:  user.name,
          email: user.email,
          role:  user.role as UserRole,
          department: user.department,
        }
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      // `user` is only present on initial sign-in — persist role into token
      if (user) token.role = (user as { role: UserRole }).role
      return token
    },

    session({ session, token }) {
      // Expose role, id, and department on the client-accessible session object
      if (session.user) {
        session.user.role = token.role as UserRole
        session.user.id   = token.sub as string
        session.user.department = token.department as string | undefined
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge:   8 * 60 * 60,  // 8 hours — a full working day
  },
})
