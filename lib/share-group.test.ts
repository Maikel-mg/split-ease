import { describe, it, expect, vi, afterEach } from "vitest"
import { buildGroupInviteMessage, shareGroupInvite } from "./share-group"

const info = {
  groupName: "Viaje a Cádiz",
  joinUrl: "https://split.ease/join/ABC123",
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("buildGroupInviteMessage", () => {
  it("names the group and includes the join link", () => {
    const message = buildGroupInviteMessage(info)

    expect(message).toContain("«Viaje a Cádiz»")
    expect(message).toContain("https://split.ease/join/ABC123")
  })

  it("keeps accents and ñ intact", () => {
    const message = buildGroupInviteMessage({ groupName: "Año Nuevo", joinUrl: "x" })

    expect(message).toContain("«Año Nuevo»")
  })
})

describe("shareGroupInvite", () => {
  it("uses the OS share sheet when available", async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal("navigator", { share })

    await expect(shareGroupInvite(info)).resolves.toBe("shared")
    expect(share).toHaveBeenCalledWith({
      title: "Viaje a Cádiz",
      text: buildGroupInviteMessage(info),
    })
  })

  it("reports cancellation when the user closes the sheet", async () => {
    const abort = Object.assign(new Error("cancelled"), { name: "AbortError" })
    vi.stubGlobal("navigator", { share: vi.fn().mockRejectedValue(abort) })

    await expect(shareGroupInvite(info)).resolves.toBe("cancelled")
  })

  it("copies the message when there is no share sheet", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal("navigator", { clipboard: { writeText } })

    await expect(shareGroupInvite(info)).resolves.toBe("copied")
    expect(writeText).toHaveBeenCalledWith(buildGroupInviteMessage(info))
  })

  it("falls back to the clipboard when sharing throws a non-abort error", async () => {
    const share = vi.fn().mockRejectedValue(new Error("boom"))
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal("navigator", { share, clipboard: { writeText } })

    await expect(shareGroupInvite(info)).resolves.toBe("copied")
  })

  it("is unavailable when neither API exists", async () => {
    vi.stubGlobal("navigator", {})

    await expect(shareGroupInvite(info)).resolves.toBe("unavailable")
  })
})
