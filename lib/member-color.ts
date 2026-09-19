// People are cool hues on purpose: green and red belong to money, and amber to
// warnings. Reusing them for members would blur what each colour means.
//
// The colour is returned as a CSS variable so dark mode can brighten it without
// the component knowing which theme is active (and without a hydration flash).
export const PERSON_COUNT = 8

export function memberColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0
  }
  const index = (Math.abs(hash) % PERSON_COUNT) + 1
  return `var(--person-${index})`
}
