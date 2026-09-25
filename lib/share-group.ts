// Inviting someone to a group: the message and the OS share-sheet
// orchestration. Same shape as `share-settlement` and `share-debts`:
// - the pure builder (`buildGroupInviteMessage`) is deterministic and
//   unit-tested;
// - the orchestration touches browser APIs and degrades gracefully when the
//   browser exposes no share sheet.

export interface GroupInviteInfo {
  groupName: string
  joinUrl: string
}

export type GroupInviteShareOutcome =
  | "shared" // opened the OS share sheet and the user picked a target
  | "copied" // no share sheet: the message was copied to the clipboard
  | "cancelled" // the user closed the share sheet
  | "unavailable" // nothing worked

export function buildGroupInviteMessage({ groupName, joinUrl }: GroupInviteInfo): string {
  return [
    `Te invito al grupo «${groupName}» en Split-Ease.`,
    "",
    "Únete con este enlace:",
    joinUrl,
  ].join("\n")
}

function isAbort(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: string }).name === "AbortError"
  )
}

export async function shareGroupInvite(info: GroupInviteInfo): Promise<GroupInviteShareOutcome> {
  if (typeof navigator === "undefined") return "unavailable"

  const message = buildGroupInviteMessage(info)

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title: info.groupName, text: message })
      return "shared"
    } catch (error) {
      if (isAbort(error)) return "cancelled"
      // Share failed for another reason: fall through to the clipboard.
    }
  }

  try {
    if (typeof navigator.clipboard?.writeText === "function") {
      await navigator.clipboard.writeText(message)
      return "copied"
    }
  } catch {
    // Clipboard blocked (permissions, insecure context): give up.
  }

  return "unavailable"
}
