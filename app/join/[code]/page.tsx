"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { getGroupService } from "@/lib/services"
import { useUserIdentity } from "@/lib/hooks/use-user-identity"
import type { Group } from "@/core/entities/Group"
import { Loader2 } from "lucide-react"

export default function JoinGroupPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  const [group, setGroup] = useState<Group | null>(null)
  const [selectedMember, setSelectedMember] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState("")
  const { setIdentity } = useUserIdentity(null)

  useEffect(() => {
    loadGroup()
  }, [code])

  const loadGroup = async () => {
    try {
      setIsLoading(true)
      const groupService = getGroupService()
      const foundGroup = await groupService.getGroupByCode(code)

      if (!foundGroup) {
        setError("Grupo no encontrado")
        return
      }

      setGroup(foundGroup)
    } catch (err) {
      console.error("[v0] Error loading group:", err)
      setError("Error al cargar el grupo")
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!selectedMember || !group) return

    try {
      setIsJoining(true)
      setIdentity(group.id, selectedMember)
      console.log("[v0] Joined group:", group.id, "as", selectedMember)
      // Redirect to the group page
      router.push(`/group/${group.id}`)
    } catch (err) {
      console.error("[v0] Error joining group:", err)
      setError("Error al unirse al grupo")
    } finally {
      setIsJoining(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error || "Grupo no encontrado"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/grupos")} className="w-full">
              Volver a Mis Grupos
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Unirse a {group.name}</CardTitle>
          <CardDescription>Selecciona quién eres en este grupo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Miembros del grupo</Label>
            <RadioGroup value={selectedMember} onValueChange={setSelectedMember}>
              {group.members.map((member) => (
                <div key={member.id} className="flex items-center space-x-3 space-y-0">
                  <RadioGroupItem value={member.name} id={member.id} />
                  <Label htmlFor={member.id} className="font-normal cursor-pointer flex-1 py-3">
                    {member.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            onClick={handleJoin}
            disabled={!selectedMember || isJoining}
            className="w-full h-12 text-base font-medium"
          >
            {isJoining ? "Uniéndose..." : "Unirse al grupo"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
