"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { joinGroupWithCode } from "@/app/actions/group-actions"
import { useRouter } from "next/navigation"
import { useUserIdentity } from "@/lib/hooks/use-user-identity"

interface JoinGroupFormProps {
  onGroupJoined?: (groupId: string) => void
}

export function JoinGroupForm({ onGroupJoined }: JoinGroupFormProps) {
  const [code, setCode] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { setIdentity } = useUserIdentity()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!displayName.trim()) {
      setError("Por favor ingresa tu nombre")
      return
    }

    if (!code.trim()) {
      setError("Por favor ingresa el código del grupo")
      return
    }

    setIsLoading(true)

    try {
      const result = await joinGroupWithCode("", displayName.trim(), code.trim())

      if (result.success) {
        setIdentity(result.groupId, displayName.trim())

        // Navigate to the group page
        router.push(`/group/${result.groupId}`)
        if (onGroupJoined) {
          onGroupJoined(result.groupId)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al unirse al grupo")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Unirse a un grupo</CardTitle>
        <CardDescription>Ingresa tu nombre y el código del grupo</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-sm font-medium">
              Tu nombre
            </Label>
            <Input
              id="displayName"
              placeholder="¿Cómo te llamas?"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code" className="text-sm font-medium">
              Código del grupo
            </Label>
            <Input
              id="code"
              placeholder="Ingresa el código alfanumérico"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              required
              className="h-11"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
            {isLoading ? "Uniéndose..." : "Unirse"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
