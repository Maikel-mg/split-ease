"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  const { setIdentity } = useUserIdentity(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!displayName.trim()) {
      setError("Escribe tu nombre.")
      return
    }

    if (!code.trim()) {
      setError("Escribe el código del grupo.")
      return
    }

    setIsLoading(true)

    try {
      const result = await joinGroupWithCode("", displayName.trim(), code.trim())

      if (result.success) {
        setIdentity(result.groupId, displayName.trim())
        router.push(`/group/${result.groupId}`)
        if (onGroupJoined) {
          onGroupJoined(result.groupId)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo unir al grupo")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Unirse a un grupo</h1>
        <p className="text-sm text-ink-2">Necesitas tu nombre y el código que te hayan pasado.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="displayName">Tu nombre</Label>
          <Input
            id="displayName"
            placeholder="Ana"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Código del grupo</Label>
          <Input
            id="code"
            placeholder="ABC123"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            required
            className="h-11 font-mono tracking-widest"
          />
        </div>

        {error && <p className="text-sm text-debit">{error}</p>}

        <Button type="submit" className="h-12 w-full text-base font-bold" disabled={isLoading}>
          {isLoading ? "Uniéndose..." : "Unirme al grupo"}
        </Button>
      </form>
    </div>
  )
}
