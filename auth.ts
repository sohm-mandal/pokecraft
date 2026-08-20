import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { sql } from '@/lib/db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      id: 'credentials',
      credentials: {
        username: { label: 'Username' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null
        const rows = await sql`
          SELECT * FROM site_users
          WHERE username = ${String(credentials.username)}
          AND password = ${String(credentials.password)}
          LIMIT 1
        `
        const user = rows[0] as { id: number; username: string; name: string; role: string } | undefined
        if (!user) return null
        return {
          id: String(user.id),
          name: user.name,
          email: `${user.username}@pokecraft.internal`,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          await sql`
            INSERT INTO users (id, name, email, image)
            VALUES (${user.id}, ${user.name ?? ''}, ${user.email}, ${user.image ?? null})
            ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, image = EXCLUDED.image
          `
        } catch (e) {
          console.error('Failed to upsert user:', e)
        }
      }
      return true
    },
    jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role ?? 'customer'
      return token
    },
    session({ session, token }) {
      if (session.user) (session.user as { role?: string }).role = token.role as string
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
