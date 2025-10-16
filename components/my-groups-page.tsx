"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, Plus, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getUserGroups } from "@/app/actions/group-actions"
import { getUserProfile } from "@/app/actions/profile-actions"

interface GroupWithDetails {
  id: string
  name: string
  code: string
  memberCount: number
  totalExpenses: number
  userBalance: number
}

interface MyGroupsPageProps {
  userId: string
}

export default function MyGroupsPage({ userId }: MyGroupsPageProps) {
  const router = useRouter()
  const [groups, setGroups] = useState<GroupWithDetails[]>([])
  const [filteredGroups, setFilteredGroups] = useState<GroupWithDetails[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState<string>("")

  useEffect(() => {
    loadGroups()
    loadProfile()
  }, [userId])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredGroups(groups)
    } else {
      const filtered = groups.filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredGroups(filtered)
    }
  }, [searchQuery, groups])

  const loadGroups = async () => {
    try {
      setLoading(true)
      const userGroups = await getUserGroups(userId)
      setGroups(userGroups)
      setFilteredGroups(userGroups)
    } catch (error) {
      console.error("[v0] Error loading groups:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadProfile = async () => {
    try {
      const result = await getUserProfile(userId)
      if (result.success && result.profile) {
        setDisplayName(result.profile.display_name)
      }
    } catch (error) {
      console.error("[v0] Error loading profile:", error)
    }
  }

  const getBalanceDisplay = (balance: number) => {
    if (Math.abs(balance) < 0.01) {
      return { text: "Saldado", color: "text-muted-foreground" }
    } else if (balance > 0) {
      return { text: `Te deben $${balance.toFixed(2)}`, color: "text-[#10b981]" }
    } else {
      return { text: `Debes $${Math.abs(balance).toFixed(2)}`, color: "text-[#ef4444]" }
    }
  }

  const getGroupInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getGroupColor = (index: number) => {
    const colors = [
      "bg-[#60a5fa]", // blue
      "bg-[#f59e0b]", // amber
      "bg-[#10b981]", // emerald
      "bg-[#8b5cf6]", // violet
      "bg-[#ec4899]", // pink
      "bg-[#14b8a6]", // teal
    ]
    return colors[index % colors.length]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando grupos...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Mis Grupos</h1>
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
              >
                <User className="h-4 w-4" />
                <span>{displayName || "Perfil"}</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setSearchQuery("")}>
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <Input
            type="text"
            placeholder="Buscar grupos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Groups List */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No tienes grupos aún</p>
            <Button onClick={() => router.push("/welcome")}>Crear o unirse a un grupo</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGroups.map((group, index) => {
              const balance = getBalanceDisplay(group.userBalance)
              return (
                <button
                  key={group.id}
                  onClick={() => router.push(`/group/${group.id}`)}
                  className="w-full bg-white border rounded-lg p-4 hover:shadow-md transition-shadow text-left"
                >
                  <div className="flex items-center gap-4">
                    {/* Group Avatar */}
                    <div
                      className={`w-14 h-14 rounded-full ${getGroupColor(index)} flex items-center justify-center flex-shrink-0`}
                    >
                      <span className="text-white font-semibold text-lg">{getGroupInitials(group.name)}</span>
                    </div>

                    {/* Group Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-1 truncate">{group.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {group.memberCount} {group.memberCount === 1 ? "miembro" : "miembros"}, Total: $
                        {group.totalExpenses.toFixed(2)}
                      </p>
                    </div>

                    {/* Balance */}
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-medium ${balance.color}`}>{balance.text}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => router.push("/welcome")}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#10b981] hover:bg-[#059669] text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}
