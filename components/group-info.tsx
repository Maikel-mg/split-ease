"use client"
import type { Group } from "@/core/entities/Group"

interface GroupInfoProps {
  group: Group
  userMemberName?: string | null
}

export function GroupInfo({ group }: GroupInfoProps) {
  return (
    <div data-tour="group-info">
      <h1 className="truncate text-2xl font-semibold tracking-tight">{group.name}</h1>
    </div>
  )
}
