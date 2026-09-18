import type { TourId } from "@/lib/tour/tour-types"

/** Window event used to ask a mounted tour to replay itself. */
export const TOUR_EVENT = "split-ease:tour"

const STORAGE_PREFIX = "split-ease:tour"
/** Bump when the copy or the number of steps changes to show the tour again. */
const STORAGE_VERSION = "v1"

function storageKey(id: TourId): string {
  return `${STORAGE_PREFIX}:${id}:${STORAGE_VERSION}`
}

/** Whether the user already finished or skipped this tour on this device. */
export function hasSeenTour(id: TourId): boolean {
  if (typeof window === "undefined") return true
  try {
    return window.localStorage.getItem(storageKey(id)) === "done"
  } catch {
    return true
  }
}

/** Remember that the tour is done so it never auto-starts again. */
export function markTourSeen(id: TourId): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(storageKey(id), "done")
  } catch {
    // Storage can be unavailable (private mode); failing silently is fine.
  }
}

/** Ask the mounted <AppTour id={id} /> to start, e.g. from a "ver tour" button. */
export function requestTour(id: TourId): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent<TourId>(TOUR_EVENT, { detail: id }))
}
