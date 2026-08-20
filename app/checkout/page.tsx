import { auth } from '@/auth'
import { CheckoutClient } from './CheckoutClient'

export const dynamic = 'force-dynamic'

export default async function CheckoutPage() {
  const session = await auth()
  const user = session?.user as { name?: string; email?: string } | undefined

  const sessionEmail = user?.email?.endsWith('@pokecraft.internal') ? '' : (user?.email ?? '')
  const sessionName = user?.name ?? ''

  return <CheckoutClient sessionEmail={sessionEmail} sessionName={sessionName} />
}
