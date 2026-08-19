import type { Metadata } from 'next'
import { Playfair_Display, Jost } from 'next/font/google'
import Link from 'next/link'
import Script from 'next/script'
import './globals.css'

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
})

const jost = Jost({
  variable: '--font-jost',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PokéCraft — Handmade Pokémon Crochet Plushies',
  description: 'Handcrafted Pokémon crochet plushies made with love. Ships across India.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${jost.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#F8F5F0] text-[#1A1A18] font-sans antialiased">
        <header className="sticky top-0 z-50 bg-[#F8F5F0]/90 backdrop-blur border-b border-[#E5DDD4]">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="font-serif text-xl tracking-tight">
              PokéCraft
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              <Link href="/shop" className="hover:text-[#C9906A] transition-colors">
                Shop
              </Link>
              <Link href="/cart" className="hover:text-[#C9906A] transition-colors">
                Cart
              </Link>
            </nav>
            <Link
              href="/cart"
              className="flex items-center gap-2 text-sm font-medium border border-[#1A1A18] px-4 py-2 rounded-full hover:bg-[#1A1A18] hover:text-[#F8F5F0] transition-colors"
            >
              🛒 Cart
            </Link>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-[#E5DDD4] mt-16 py-8 text-center text-sm text-[#6B6560]">
          © {new Date().getFullYear()} PokéCraft. Made with love in India.
        </footer>

        <Script
          id="razorpay-checkout"
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}
