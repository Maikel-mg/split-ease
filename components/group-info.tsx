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
   <h1 className="font-semibold text-center text-lg truncate">{group.name}</h1>
        //<h3 className="text-2xl text-center font-bold">{group.name}</h3>
   
  )
}
