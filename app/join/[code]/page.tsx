"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MemberDot } from "@/components/member-dot"
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
        setError("No encontramos ningún grupo con ese código.")
        return
      }

      setGroup(foundGroup)
    } catch (err) {
      console.error("[v0] Error loading group:", err)
      setError("No se pudo cargar el grupo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!selectedMember || !group) return

    try {
      setIsJoining(true)
      setIdentity(group.id, selectedMember)
      router.push(`/group/${group.id}`)
    } catch (err) {
      console.error("[v0] Error joining group:", err)
      setError("No se pudo unir al grupo.")
    } finally {
      setIsJoining(false)
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <Loader2 className="h-6 w-6 animate-spin text-ink-2" />
      </main>
    )
  }

  if (error || !group) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">No se pudo entrar</h1>
            <p className="text-sm text-ink-2">{error || "No encontramos el grupo."}</p>
          </div>
          <Button onClick={() => router.push("/grupos")} className="h-12 w-full text-base font-bold">
            Ir a mis grupos
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Unirse a {group.name}</h1>
          <p className="text-sm text-ink-2">Selecciona quién eres en este grupo.</p>
        </div>

        <RadioGroup
          value={selectedMember}
          onValueChange={setSelectedMember}
          className="divide-y divide-rule"
        >
          {group.members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 py-3">
              <RadioGroupItem value={member.name} id={member.id} />
              <MemberDot name={member.name} />
              <Label htmlFor={member.id} className="flex-1 cursor-pointer font-normal">
                {member.name}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {error && <p className="mt-4 text-sm text-debit">{error}</p>}

        <Button
          onClick={handleJoin}
          disabled={!selectedMember || isJoining}
          className="mt-6 h-12 w-full text-base font-bold"
        >
          {isJoining ? "Uniéndose..." : "Unirme al grupo"}
        </Button>
      </div>
    </main>
  )
}
