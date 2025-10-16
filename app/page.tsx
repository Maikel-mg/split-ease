"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    router.push("/grupos")
  }, [router])

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Cargando...</p>
    </main>
  )
}
