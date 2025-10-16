"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import type { Group } from "@/core/entities/Group"

interface GroupInfoProps {
  group: Group
  userMemberName?: string | null
}

export function GroupInfo({ group, userMemberName }: GroupInfoProps) {
  const [membersExpanded, setMembersExpanded] = useState(false)

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="text-2xl">{group.name}</CardTitle>
          <CardDescription className="mt-1">
            Creado el {new Date(group.createdAt).toLocaleDateString("es-ES")}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <button
            onClick={() => setMembersExpanded(!membersExpanded)}
            className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Miembros ({group.members.length})</h3>
            </div>
            {membersExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {membersExpanded && (
            <div className="flex flex-wrap gap-2 mt-3 px-3">
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
      </CardContent>
    </Card>
  )
}
