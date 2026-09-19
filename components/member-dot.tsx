import { cn } from "@/lib/utils"
import { memberColor } from "@/lib/member-color"

interface MemberDotProps {
  name: string
  className?: string
}

// Identity is carried by the name itself, so the dot is decorative and hidden
// from assistive tech.
export function MemberDot({ name, className }: MemberDotProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block size-2.5 flex-shrink-0 rounded-full", className)}
      style={{ backgroundColor: memberColor(name) }}
    />
  )
}
