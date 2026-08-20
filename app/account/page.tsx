import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AccountClient } from './AccountClient'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const isGoogleUser = !session.user.email?.endsWith('@pokecraft.internal')
  const sessionEmail = isGoogleUser ? (session.user.email ?? '') : ''

  return (
    <AccountClient
      name={session.user.name ?? ''}
      image={session.user.image ?? null}
      sessionEmail={sessionEmail}
    />
  )
}
