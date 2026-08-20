'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, Suspense } from 'react'

function PageLoaderInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const [completing, setCompleting] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevPath = useRef(pathname + searchParams.toString())

  // Intercept link clicks to start the loader immediately
  useEffect(() => {
    function onLinkClick(e: MouseEvent) {
      const target = (e.target as Element).closest('a')
      if (!target) return
      const href = target.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return
      if (target.getAttribute('target') === '_blank') return
      // Same-page anchor or external link — skip
      try {
        const url = new URL(href, window.location.href)
        if (url.origin !== window.location.origin) return
      } catch { return }
      startLoader()
    }

    document.addEventListener('click', onLinkClick)
    return () => document.removeEventListener('click', onLinkClick)
  }, [])

  function startLoader() {
    if (timerRef.current) clearInterval(timerRef.current)
    setCompleting(false)
    setVisible(true)
    setProgress(8)

    // Ease progress toward 85% while waiting
    let p = 8
    timerRef.current = setInterval(() => {
      p += (85 - p) * 0.06
      setProgress(p)
    }, 80)
  }

  function completeLoader() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    setCompleting(true)
    setProgress(100)
    setTimeout(() => { setVisible(false); setProgress(0); setCompleting(false) }, 400)
  }

  // Detect navigation completion (pathname / searchParams changed)
  useEffect(() => {
    const current = pathname + searchParams.toString()
    if (current !== prevPath.current) {
      prevPath.current = current
      completeLoader()
    }
  }, [pathname, searchParams])

  if (!visible) return null

  return (
    <>
      {/* Top progress bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
        height: '3px',
        background: 'transparent',
        pointerEvents: 'none',
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #C9906A, #E5B48A)',
          transition: completing ? 'width 0.25s ease-out' : 'width 0.08s ease',
          borderRadius: '0 2px 2px 0',
          boxShadow: '0 0 10px rgba(201,144,106,0.6)',
        }} />
      </div>

      {/* Subtle full-page overlay — dims without blocking */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9990,
        background: 'rgba(248,245,240,0.15)',
        pointerEvents: 'none',
        animation: 'loaderFadeIn 0.15s ease',
      }} />

      <style>{`
        @keyframes loaderFadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </>
  )
}

// useSearchParams needs Suspense boundary
export function PageLoader() {
  return (
    <Suspense fallback={null}>
      <PageLoaderInner />
    </Suspense>
  )
}
