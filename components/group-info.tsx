"use client"

import { Badge } from "@/components/ui/badge"
import { Users, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AddMemberDialog } from "@/components/add-member-dialog"
import type { Group } from "@/core/entities/Group"

interface GroupInfoProps {
  group: Group
  userMemberName?: string | null
  onMemberAdded?: () => void
}

export function GroupInfo({ group, userMemberName, onMemberAdded }: GroupInfoProps) {
  const [membersExpanded, setMembersExpanded] = useState(false)

  return (
    <div className="space-y-3">
      <h1 className="font-semibold text-center text-lg truncate">{group.name}</h1>

      <div className="bg-card rounded-lg border p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {group.members.length} {group.members.length === 1 ? "miembro" : "miembros"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onMemberAdded && <AddMemberDialog group={group} onMemberAdded={onMemberAdded} />}
            <Button variant="ghost" size="sm" onClick={() => setMembersExpanded(!membersExpanded)}>
              {membersExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {membersExpanded && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {group.members.map((member) => (
              <Badge
                key={member.id}
                variant={member.name === userMemberName ? "default" : "outline"}
                className="px-3 py-1"
              >
                {member.name}
                {member.name === userMemberName && <span className="ml-1 font-bold">TÚ</span>}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
