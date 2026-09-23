// The "we're even" moment of a group: the message and the picture the user
// sends by hand through the OS share sheet (the same gesture as "Compartir
// deudas"). Nothing leaves the device until the user picks a target.
//
// Two halves live here on purpose:
// - pure builders (`buildSettlementMessage`, `renderSettlementCardSvg`) are
//   deterministic and unit-tested;
// - the share orchestration touches browser APIs and degrades gracefully when
//   they are missing (no `navigator.share`, no file sharing, no canvas).

export interface SettlementInfo {
  groupName: string
  /** Adds a "Estado final" line to the shared message. Omitted when not provided. */
  date?: Date
}

export type SettlementShareOutcome =
  | "image" // shared an image (plus text) through the OS sheet
  | "text" // shared plain text through the OS sheet
  | "copied" // no share sheet: text copied to the clipboard
  | "cancelled" // the user closed the share sheet
  | "unavailable" // nothing worked

const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
]

export function formatLongDate(date: Date): string {
  return `${date.getDate()} de ${MONTHS_ES[date.getMonth()]} de ${date.getFullYear()}`
}

export function buildSettlementMessage({ groupName, date }: SettlementInfo): string {
  const lines = [
    "¡Misión cumplida! 🏆",
    "",
    `«${groupName}» está al día.`,
    "",
    "No hay deudas pendientes entre los miembros.",
  ]

  if (date) {
    lines.push("", `Estado final: ${formatLongDate(date)}.`)
  }

  return lines.join("\n")
}

/** Escapes a value for safe embedding inside SVG text or attributes. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

/** Cuts a value to `max` characters, adding an ellipsis when it overflows. */
export function truncate(value: string, max: number): string {
  if (value.length <= max) return value
  return `${value.slice(0, Math.max(0, max - 1)).trimEnd()}…`
}

// Decorative confetti for the card. Fixed positions and colours so the output
// is stable (no hydration surprises, easy to eyeball in tests).
const CARD_CONFETTI = [
  { x: 120, y: 150, r: 13, color: "#0d74ce" },
  { x: 250, y: 90, r: 9, color: "#4f46e5" },
  { x: 420, y: 130, r: 11, color: "#12a594" },
  { x: 700, y: 100, r: 10, color: "#d6409f" },
  { x: 860, y: 170, r: 13, color: "#8e4ec6" },
  { x: 970, y: 92, r: 8, color: "#0891b2" },
  { x: 90, y: 340, r: 9, color: "#c026d3" },
  { x: 990, y: 360, r: 11, color: "#0d74ce" },
  { x: 150, y: 880, r: 12, color: "#12a594" },
  { x: 320, y: 960, r: 9, color: "#4f46e5" },
  { x: 780, y: 950, r: 11, color: "#d6409f" },
  { x: 930, y: 880, r: 9, color: "#8e4ec6" },
]

export function renderSettlementCardSvg({ groupName }: SettlementInfo): string {
  const title = "¡Misión cumplida! 🏆"
  const group = escapeXml(truncate(groupName, 32))

  const confetti = CARD_CONFETTI.map(
    ({ x, y, r, color }) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="0.85"/>`,
  ).join("")

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <rect width="1080" height="1080" fill="#fbfbfa"/>
  ${confetti}
  <circle cx="540" cy="420" r="88" fill="#e9f4ee"/>
  <path d="M498 424 L526 452 L584 390" fill="none" stroke="#0b7d40" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="540" y="610" text-anchor="middle" font-family="sans-serif" font-size="82" font-weight="700" fill="#16181c">¡Misión cumplida! 🏆</text>
  <text x="540" y="700" text-anchor="middle" font-family="sans-serif" font-size="42" fill="#62666d">«${group}» está al día.</text>
  <text x="540" y="800" text-anchor="middle" font-family="sans-serif" font-size="30" fill="#62666d">No hay deudas pendientes entre los miembros.</text>
</svg>`
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("No se pudo generar la imagen"))
    image.src = src
  })
}

/**
 * Renders the card to a PNG file. Returns `null` when the environment cannot
 * draw images (SSR, old browsers), so callers can fall back to text sharing.
 */
export async function buildSettlementCardFile(info: SettlementInfo): Promise<File | null> {
  if (typeof document === "undefined" || typeof File === "undefined") return null

  const svg = renderSettlementCardSvg(info)
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }))

  try {
    const image = await loadImage(url)
    const canvas = document.createElement("canvas")
    canvas.width = 1080
    canvas.height = 1080

    const context = canvas.getContext("2d")
    if (!context) return null

    context.drawImage(image, 0, 0)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    )
    if (!blob) return null

    return new File([blob], "split-ease-saldado.png", { type: "image/png" })
  } finally {
    URL.revokeObjectURL(url)
  }
}

function isAbort(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: string }).name === "AbortError"
  )
}

export async function shareSettlement(info: SettlementInfo): Promise<SettlementShareOutcome> {
  if (typeof navigator === "undefined") return "unavailable"

  const text = buildSettlementMessage(info)
  const canShare = typeof navigator.share === "function"

  if (canShare && typeof navigator.canShare === "function") {
    try {
      const file = await buildSettlementCardFile(info)
      if (file && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text })
        return "image"
      }
    } catch (error) {
      if (isAbort(error)) return "cancelled"
      // Image generation or file sharing failed: fall through to plain text.
    }
  }

  try {
    if (canShare) {
      await navigator.share({ text })
      return "text"
    }

    if (typeof navigator.clipboard?.writeText === "function") {
      await navigator.clipboard.writeText(text)
      return "copied"
    }
  } catch (error) {
    if (isAbort(error)) return "cancelled"
  }

  return "unavailable"
}
