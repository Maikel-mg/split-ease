export type TourId = "welcome" | "group"

export interface TourStep {
  /**
   * CSS selector of the element to highlight. When omitted, the step is shown
   * as a centered popover with no spotlight (used for intro/outro steps).
   */
  target?: string
  title: string
  description: string
}
