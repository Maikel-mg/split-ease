// People are cool hues on purpose: green and red belong to money, and amber to
// warnings. Reusing them for members would blur what each colour means.
const PALETTE = [
  "#0d74ce",
  "#4f46e5",
  "#8e4ec6",
  "#c026d3",
  "#d6409f",
  "#12a594",
  "#0891b2",
  "#7c3aed",
]

// A member keeps the same colour everywhere, in every group, without storing it.
export function memberColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0
  }
  return PALETTE[Math.abs(hash) % PALETTE.length]
}
