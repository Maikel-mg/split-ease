"use client"

import { useState } from "react"
import { CreateGroupForm } from "@/components/create-group-form"
import { JoinGroupForm } from "@/components/join-group-form"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Users, LogOut } from "lucide-react"
import type { Group } from "@/core/entities/Group"
import { createClient } from "@/lib/supabase/client"

interface HomePageProps {
  userEmail: string | null
}

export default function HomePage({ userEmail }: HomePageProps) {
  const router = useRouter()
  const [view, setView] = useState<"welcome" | "create" | "join">("welcome")

  const handleGroupCreated = (group: Group) => {
    router.push(`/group/${group.id}`)
  }

  const handleGroupJoined = (group: Group) => {
    router.push(`/group/${group.id}`)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {userEmail && (
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>{userEmail}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        )}

        {view === "welcome" && (
          <div className="space-y-8 text-center">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-primary" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-balance">Bienvenido a GastoGrupal</h1>
              <p className="text-muted-foreground text-pretty leading-relaxed">
                Gestiona gastos compartidos en tu grupo con tus amigos y familiares.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <Button className="w-full h-12 text-base font-medium" size="lg" onClick={() => setView("create")}>
                Crear Nuevo Grupo
              </Button>
              <Button
                className="w-full h-12 text-base font-medium bg-transparent"
                variant="outline"
                size="lg"
                onClick={() => setView("join")}
              >
                Unirse a un Grupo Existente
              </Button>
            </div>
          </div>
        )}

        {view === "create" && (
          <div className="space-y-4">
            <Button variant="ghost" onClick={() => setView("welcome")} className="mb-2">
              ← Volver
            </Button>
            <CreateGroupForm onGroupCreated={handleGroupCreated} />
          </div>
        )}

        {view === "join" && (
          <div className="space-y-4">
            <Button variant="ghost" onClick={() => setView("welcome")} className="mb-2">
              ← Volver
            </Button>
            <JoinGroupForm onGroupJoined={handleGroupJoined} />
          </div>
        )}
      </div>
    </main>
  )
}
