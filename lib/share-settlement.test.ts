import { describe, it, expect } from "vitest"
import {
  buildSettlementMessage,
  escapeXml,
  formatLongDate,
  renderSettlementCardSvg,
  truncate,
} from "./share-settlement"

describe("formatLongDate", () => {
  it("formats a date in Spanish", () => {
    expect(formatLongDate(new Date(2026, 8, 22))).toBe("22 de septiembre de 2026")
  })
})

describe("escapeXml", () => {
  it("escapes the characters that would break the SVG", () => {
    expect(escapeXml(`Ana & Luis <grupo> "x" 'y'`)).toBe(
      "Ana &amp; Luis &lt;grupo&gt; &quot;x&quot; &apos;y&apos;",
    )
  })

  it("leaves plain text untouched", () => {
    expect(escapeXml("Viaje a Cádiz")).toBe("Viaje a Cádiz")
  })
})

describe("truncate", () => {
  it("returns short values as-is", () => {
    expect(truncate("Cena", 10)).toBe("Cena")
  })

  it("cuts long values and marks the cut", () => {
    expect(truncate("abcdef", 4)).toBe("abc…")
  })
})

describe("buildSettlementMessage", () => {
  it("announces the settled group", () => {
    const message = buildSettlementMessage({ groupName: "Viaje a Cádiz" })

    expect(message).toContain("¡Misión cumplida! 🏆")
    expect(message).toContain("«Viaje a Cádiz» está al día.")
    expect(message).toContain("No hay deudas pendientes entre los miembros.")
    expect(message).not.toContain("Split-Ease")
  })

  it("adds the date when provided", () => {
    const message = buildSettlementMessage({
      groupName: "Piso",
      date: new Date(2026, 8, 23),
    })

    expect(message).toContain("Estado final: 23 de septiembre de 2026.")
  })

  it("omits the date when not provided", () => {
    const message = buildSettlementMessage({ groupName: "Piso" })

    expect(message).not.toContain("Estado final")
  })

  it("does not list members, so a big group stays readable", () => {
    const message = buildSettlementMessage({ groupName: "Piso" })

    expect(message).not.toContain("Ana")
  })
})

describe("renderSettlementCardSvg", () => {
  it("renders a square SVG with the group", () => {
    const svg = renderSettlementCardSvg({ groupName: "Viaje a Cádiz" })

    expect(svg.startsWith("<svg")).toBe(true)
    expect(svg).toContain('width="1080"')
    expect(svg).toContain('height="1080"')
    expect(svg).toContain("Viaje a Cádiz")
    expect(svg).toContain("¡Misión cumplida! 🏆")
    expect(svg).toContain("está al día.")
    expect(svg).not.toContain("Split-Ease")
  })

  it("carries no date and no branding on the picture", () => {
    const svg = renderSettlementCardSvg({
      groupName: "Piso",
      date: new Date(2026, 8, 23),
    })

    expect(svg).not.toContain("23 de septiembre")
    expect(svg).not.toContain("Estado final")
    expect(svg).not.toContain("SPLIT-EASE")
  })

  it("escapes group names that would break the markup", () => {
    const svg = renderSettlementCardSvg({ groupName: "Ana & Luis <grupo>" })

    expect(svg).toContain("Ana &amp; Luis &lt;grupo&gt;")
    expect(svg).not.toContain("<grupo>")
  })

  it("truncates very long group names", () => {
    const long = "x".repeat(60)
    const svg = renderSettlementCardSvg({ groupName: long })

    expect(svg).not.toContain(long)
    expect(svg).toContain("…")
  })
})
