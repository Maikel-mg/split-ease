"use client"

import { useMemo, type CSSProperties } from "react"

// Dependency-free confetti. People-coloured on purpose: green and red belong to
// money, so the party stays in the cool hues (see lib/member-color.ts).
const COLORS = [
  "var(--person-1)",
  "var(--person-2)",
  "var(--person-3)",
  "var(--person-4)",
  "var(--person-5)",
  "var(--person-6)",
  "var(--person-7)",
  "var(--person-8)",
]

// Seeded PRNG: the pieces must be identical on the server and on the client,
// otherwise React complains about a hydration mismatch on the inline styles.
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface CelebrationConfettiProps {
  pieces?: number
  /** Changes the layout without changing the animation. */
  seed?: number
}

export function CelebrationConfetti({ pieces = 80, seed = 20260922 }: CelebrationConfettiProps) {
  const items = useMemo(() => {
    const random = mulberry32(seed)

    return Array.from({ length: pieces }, (_, index) => {
      const size = 7 + random() * 9
      const round = random() > 0.7

      return {
        index,
        left: random() * 100,
        delay: random() * 0.9,
        duration: 2.6 + random() * 2.2,
        sway: (random() - 0.5) * 180,
        spin: 240 + random() * 420,
        size,
        round,
        color: COLORS[Math.floor(random() * COLORS.length)],
      }
    })
  }, [pieces, seed])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {items.map((piece) => (
        <span
          key={piece.index}
          className="celebration-confetti-piece"
          style={
            {
              left: `${piece.left}%`,
              width: piece.size,
              height: piece.round ? piece.size : piece.size * 0.42,
              backgroundColor: piece.color,
              borderRadius: piece.round ? "9999px" : "2px",
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              "--celebration-sway": `${piece.sway}px`,
              "--celebration-spin": `${piece.spin}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
