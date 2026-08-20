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
        const user = rows[0] as { id: number; username: string; email: string | null; name: string; role: string } | undefined
        if (!user) return null
        // Use the stored email column if available, otherwise fall back to a synthetic one
        const email = user.email ?? `${user.username}@pokecraft.internal`
        return {
          id: String(user.id),
          name: user.name,
          email,
          role: user.role,
        }
      },
    }),
    Credentials({
      id: 'otp',
      credentials: {
        email: { label: 'Email' },
        code: { label: 'OTP' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) return null
        const email = String(credentials.email).toLowerCase().trim()
        const code = String(credentials.code).trim()

        const rows = await sql`
          SELECT * FROM otps WHERE email = ${email} LIMIT 1
        `
        const otp = rows[0] as { email: string; code: string; expires_at: string } | undefined
        if (!otp) return null
        if (otp.code !== code) return null
        if (new Date(otp.expires_at) < new Date()) return null

        // Delete used OTP
        await sql`DELETE FROM otps WHERE email = ${email}`

        // Upsert guest user in site_users
        const existing = await sql`
          SELECT * FROM site_users WHERE username = ${email} LIMIT 1
        `
        let user = existing[0] as { id: number; username: string; name: string; role: string } | undefined
        if (!user) {
          const name = email.split('@')[0]
          const inserted = await sql`
            INSERT INTO site_users (username, password, name, role, email)
            VALUES (${email}, '', ${name}, 'guest', ${email})
            RETURNING *
          `
          user = inserted[0] as { id: number; username: string; email: string | null; name: string; role: string }
        }

        return {
          id: String(user.id),
          name: user.name,
          email: email,
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
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours — session expires after 8 hours
  },
  pages: {
    signIn: '/login',
  },
})
