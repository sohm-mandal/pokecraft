import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AccountClient } from './AccountClient'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  // Real email for Google users and OTP guests; @pokecraft.internal = staff account
  const sessionEmail = session.user.email?.endsWith('@pokecraft.internal')
    ? ''
    : (session.user.email ?? '')

  return (
    <AccountClient
      name={session.user.name ?? ''}
      image={session.user.image ?? null}
      sessionEmail={sessionEmail}
    />
  )
}
