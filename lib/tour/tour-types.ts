export type TourId = "welcome" | "group" | "validation"

export interface TourStep {
  /**
   * CSS selector of the element to highlight. When omitted, the step is shown
   * as a centered popover with no spotlight (used for intro/outro steps).
   */
  target?: string
  title: string
  description: string
  /** Optional button rendered inside the step that opens another tour. */
  action?: {
    label: string
    tourId: TourId
  }
}
