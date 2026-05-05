'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'

export default function ThemeColorUpdater() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) return

    const updateColor = () => {
      const isDark = resolvedTheme === 'dark'
      meta.setAttribute('content', isDark ? '#0f172a' : '#f8f9fa')
    }

    updateColor()
  }, [resolvedTheme])

  return null
}
