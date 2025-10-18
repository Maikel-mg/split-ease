"use client"
import type { Group } from "@/core/entities/Group"

interface GroupInfoProps {
  group: Group
  userMemberName?: string | null
}

export function GroupInfo({ group }: GroupInfoProps) {
  return (
    <div>
      <h1 className="font-semibold text-center text-lg truncate">{group.name}</h1>
    </div>
  )
}
