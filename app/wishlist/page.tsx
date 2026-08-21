import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { WishlistClient } from './WishlistClient'

export const dynamic = 'force-dynamic'

export default async function WishlistPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  return <WishlistClient />
}
