"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Copy, Check, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import type { Group } from "@/core/entities/Group"

interface GroupInfoProps {
  group: Group
}

export function GroupInfo({ group }: GroupInfoProps) {
  const [copied, setCopied] = useState(false)
  const [membersExpanded, setMembersExpanded] = useState(false)

  const copyCode = () => {
    navigator.clipboard.writeText(group.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
        <div
          className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
          onClick={copyCode}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Código:</span>
            <span className="font-mono font-semibold text-lg">{group.code}</span>
          </div>
          <div className="flex items-center gap-1">
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-xs text-green-600">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Copiar</span>
              </>
            )}
          </div>
        </div>

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
                <Badge key={member.id} variant="outline" className="px-3 py-1">
                  {member.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
