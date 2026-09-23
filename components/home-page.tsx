"use client"

import { useState } from "react"
import { CreateGroupForm } from "@/components/create-group-form"
import { JoinGroupForm } from "@/components/join-group-form"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { HelpCircle } from "lucide-react"
import { AppTour } from "@/components/app-tour"
import { WELCOME_TOUR } from "@/lib/tour/tour-content"
import { requestTour } from "@/lib/tour/tour-runtime"
import type { Group } from "@/core/entities/Group"

interface HomePageProps {
  displayName: string | null
}

export default function HomePage({ displayName }: HomePageProps) {
  const router = useRouter()
  const [view, setView] = useState<"welcome" | "create" | "join">("welcome")

  const handleGroupCreated = (group: Group) => {
    router.push(`/group/${group.id}`)
  }

  const handleGroupJoined = (groupId: string) => {
    router.push(`/group/${groupId}`)
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-md flex-col justify-center">
        {view === "welcome" && (
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="text-sm font-bold tracking-tight text-ink-2">GastoGrupal</p>
              <h1 className="text-3xl font-bold tracking-tight text-balance">
                Gastos compartidos sin líos
              </h1>
              <p className="text-ink-2">
                Crea un grupo, apunta lo que paga cada uno y deja que la app calcule quién debe a
                quién.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                data-tour="create-group"
                className="h-12 w-full text-base font-bold"
                size="lg"
                onClick={() => setView("create")}
              >
                Crear un grupo
              </Button>
              <Button
                data-tour="join-group"
                variant="outline"
                className="h-12 w-full text-base font-bold"
                size="lg"
                onClick={() => setView("join")}
              >
                Unirme con un código
              </Button>
              <button
                type="button"
                onClick={() => requestTour("welcome")}
                className="mx-auto flex items-center justify-center gap-1.5 pt-1 text-sm text-ink-2 transition-colors hover:text-ink"
              >
                <HelpCircle className="h-4 w-4" />
                Ver cómo funciona
              </button>
            </div>
          </div>
        )}

        {view === "create" && (
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => setView("welcome")}
              className="text-sm text-ink-2 transition-colors hover:text-ink"
            >
              ← Volver
            </button>
            <CreateGroupForm onGroupCreated={handleGroupCreated} />
          </div>
        )}

        {view === "join" && (
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => setView("welcome")}
              className="text-sm text-ink-2 transition-colors hover:text-ink"
            >
              ← Volver
            </button>
            <JoinGroupForm onGroupJoined={handleGroupJoined} />
          </div>
        )}

        <AppTour id="welcome" steps={WELCOME_TOUR} autoStart={view === "welcome"} />
      </div>
    </main>
  )
}
