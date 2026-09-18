"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { hasSeenTour, markTourSeen, TOUR_EVENT } from "@/lib/tour/tour-runtime"
import type { TourId, TourStep } from "@/lib/tour/tour-types"

interface AppTourProps {
  id: TourId
  steps: TourStep[]
  /** Start automatically the first time (per device) the tour is mounted. */
  autoStart?: boolean
  /** Small delay so the screen finishes laying out before measuring elements. */
  startDelay?: number
}

const SPOTLIGHT_PADDING = 6
const SPOTLIGHT_RADIUS = 14
const POPOVER_GAP = 12
const POPOVER_WIDTH = 340
const MOBILE_BREAKPOINT = 640
const BACKDROP_COLOR = "rgba(15, 23, 42, 0.72)"

/**
 * Lightweight, dependency-free coach-mark tour.
 *
 * Mobile-first: the popover is anchored to the bottom of the screen (so it never
 * fights with small viewports or the on-screen keyboard) while the target keeps
 * its spotlight. On desktop it is positioned next to the target.
 */
export function AppTour({ id, steps, autoStart = true, startDelay = 700 }: AppTourProps) {
  const [mounted, setMounted] = useState(false)
  const [active, setActive] = useState(false)
  const [index, setIndex] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  const stepsRef = useRef(steps)
  const activeStepsRef = useRef<TourStep[]>([])
  const popoverRef = useRef<HTMLDivElement | null>(null)

  stepsRef.current = steps

  useEffect(() => {
    setMounted(true)
  }, [])

  const measure = useCallback(() => {
    if (!active) return
    const step = activeStepsRef.current[index]
    const el = step?.target ? document.querySelector<HTMLElement>(step.target) : null
    setRect(el ? el.getBoundingClientRect() : null)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
  }, [active, index])

  const finish = useCallback(() => {
    markTourSeen(id)
    setActive(false)
    setRect(null)
  }, [id])

  const next = useCallback(() => {
    if (index >= activeStepsRef.current.length - 1) {
      finish()
      return
    }
    setIndex(index + 1)
  }, [index, finish])

  const prev = useCallback(() => {
    setIndex((current) => Math.max(0, current - 1))
  }, [])

  const start = useCallback(() => {
    // Skip steps whose target is not on screen (e.g. validation tabs on a
    // private group), so the tour adapts to whatever the group looks like.
    const resolved = stepsRef.current.filter(
      (step) => !step.target || document.querySelector(step.target),
    )
    if (resolved.length === 0) return
    activeStepsRef.current = resolved
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    setIndex(0)
    setActive(true)
  }, [])

  useEffect(() => {
    const onRequest = (event: Event) => {
      if ((event as CustomEvent<TourId>).detail === id) start()
    }
    window.addEventListener(TOUR_EVENT, onRequest)

    let timer: ReturnType<typeof setTimeout> | undefined
    if (autoStart && !hasSeenTour(id)) {
      timer = setTimeout(start, startDelay)
    }

    return () => {
      if (timer) clearTimeout(timer)
      window.removeEventListener(TOUR_EVENT, onRequest)
    }
  }, [autoStart, id, start, startDelay])

  // Scroll the target into view, then measure once the smooth scroll settles.
  useEffect(() => {
    if (!active) return
    const step = activeStepsRef.current[index]
    const el = step?.target ? document.querySelector<HTMLElement>(step.target) : null
    if (el) el.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" })

    const timers = [setTimeout(measure, 0), setTimeout(measure, 350)]
    return () => timers.forEach(clearTimeout)
  }, [active, index, measure])

  // Keep the spotlight glued to the target while the user scrolls or rotates.
  useEffect(() => {
    if (!active) return
    let frame = 0
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }
    window.addEventListener("scroll", schedule, true)
    window.addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule, true)
      window.removeEventListener("resize", schedule)
    }
  }, [active, measure])

  useEffect(() => {
    if (!active) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish()
      else if (event.key === "ArrowRight") next()
      else if (event.key === "ArrowLeft") prev()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [active, finish, next, prev])

  useEffect(() => {
    if (active) popoverRef.current?.focus()
  }, [active, index])

  const total = activeStepsRef.current.length
  const step = activeStepsRef.current[index]
  const isLast = index === total - 1

  const popoverStyle = useMemo<React.CSSProperties>(() => {
    if (typeof window === "undefined") return {}

    if (isMobile) {
      return {
        position: "fixed",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(100vw - 24px, 32rem)",
      }
    }

    if (!rect) {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(100vw - 24px, 22rem)",
      }
    }

    const fitsBelow = window.innerHeight - rect.bottom > 200
    const left = Math.min(
      Math.max(rect.left + rect.width / 2 - POPOVER_WIDTH / 2, 12),
      window.innerWidth - POPOVER_WIDTH - 12,
    )

    return {
      position: "fixed",
      width: POPOVER_WIDTH,
      left,
      ...(fitsBelow
        ? { top: rect.bottom + POPOVER_GAP }
        : { top: Math.max(rect.top - POPOVER_GAP, 12), transform: "translateY(-100%)" }),
    }
  }, [isMobile, rect])

  if (!mounted || !active || !step) return null

  const spotlightStyle: React.CSSProperties | null = rect
    ? {
        position: "fixed",
        left: rect.left - SPOTLIGHT_PADDING,
        top: rect.top - SPOTLIGHT_PADDING,
        width: rect.width + SPOTLIGHT_PADDING * 2,
        height: rect.height + SPOTLIGHT_PADDING * 2,
        borderRadius: SPOTLIGHT_RADIUS,
        boxShadow: `0 0 0 2px var(--primary), 0 0 0 9999px ${BACKDROP_COLOR}`,
        pointerEvents: "none",
        transition:
          "left 200ms ease, top 200ms ease, width 200ms ease, height 200ms ease",
      }
    : null

  return createPortal(
    <div className="fixed inset-0 z-[999]">
      {spotlightStyle ? (
        <>
          {/* Blocks page interaction while the tour is running. */}
          <div className="absolute inset-0" style={{ touchAction: "pan-y" }} />
          <div style={spotlightStyle} />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: BACKDROP_COLOR }} />
      )}

      <div
        ref={popoverRef}
        role="dialog"
        aria-modal="true"
        aria-label={step.title}
        tabIndex={-1}
        style={popoverStyle}
        className="z-[1000] rounded-2xl border bg-popover p-4 text-popover-foreground shadow-2xl outline-none"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              Paso {index + 1} de {total}
            </p>
            <h2 className="mt-1 text-base font-semibold text-balance">{step.title}</h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={finish}
            aria-label="Cerrar el tour"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          {step.description}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={finish}>
            Saltar
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={prev}
              disabled={index === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button type="button" size="sm" onClick={next}>
              {isLast ? "¡Entendido!" : "Siguiente"}
              {!isLast && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
