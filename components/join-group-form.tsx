"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { joinGroupWithCode } from "@/app/actions/group-actions"
import { getUserProfile } from "@/app/actions/profile-actions"
import type { Group } from "@/core/entities/Group"
import { createClient } from "@/lib/supabase/client"

interface JoinGroupFormProps {
  onGroupJoined: (group: Group) => void
}

export function JoinGroupForm({ onGroupJoined }: JoinGroupFormProps) {
  const [code, setCode] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [userId, setUserId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadUserData = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)

        const profileResult = await getUserProfile(user.id)
        if (profileResult.success && profileResult.profile) {
          setDisplayName(profileResult.profile.display_name)
        } else {
          // Fallback to email if no profile exists
          setDisplayName(user.email || "")
        }
      }
    }

    loadUserData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await joinGroupWithCode(userId, displayName, code)

      if (result.success) {
        const supabase = createClient()
        const { data: group } = await supabase.from("groups").select("*").eq("id", result.groupId).single()

        if (group) {
          onGroupJoined(group as Group)
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
        <CardDescription>Ingresa el código del grupo</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
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
