"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, MoreVertical, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ThemeToggle from "@/components/theme-toggle"
import { getUserGroupsFromIdentities } from "@/app/actions/group-actions"
import { getMyGroupIds, getUserMemberName } from "@/lib/hooks/use-user-identity"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { memberColor } from "@/lib/member-color"
import { formatMoney } from "@/lib/format"

interface GroupWithDetails {
  id: string
  name: string
  code: string
  memberCount: number
  totalExpenses: number
  userBalance: number
  archived: boolean
  isPrivate: boolean
}

export default function MyGroupsPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<GroupWithDetails[]>([])
  const [filteredGroups, setFilteredGroups] = useState<GroupWithDetails[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    loadGroups()
  }, [])

  useEffect(() => {
    const filtered = groups.filter((group) => {
      const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesArchived = showArchived ? true : !group.archived
      return matchesSearch && matchesArchived
    })
    setFilteredGroups(filtered)
  }, [searchQuery, groups, showArchived])

  const loadGroups = async () => {
    try {
      setLoading(true)
      
      const myGroupIds = getMyGroupIds()

      console.log("[v0] My group IDs:", myGroupIds)

      if (myGroupIds.length === 0) {
        setGroups([])
        setFilteredGroups([])
        setLoading(false)
        return
      }

      const identities = myGroupIds.map((id) => ({
        groupId: id,
        memberName: getUserMemberName(id) || "",
      }))

      const groupsWithDetails = await getUserGroupsFromIdentities(identities)

      setGroups(groupsWithDetails)
      setFilteredGroups(groupsWithDetails)
    } catch (error) {
      console.error("[v0] Error loading groups:", error)
    } finally {
      setLoading(false)
    }
  }

  const getBalanceDisplay = (balance: number) => {
    if (Math.abs(balance) < 0.01) {
      return { text: "Sin deudas", color: "text-ink-2" }
    } else if (balance > 0) {
      return { text: `Te deben ${formatMoney(balance)}`, color: "text-credit" }
    } else {
      return { text: `Debes ${formatMoney(Math.abs(balance))}`, color: "text-debit" }
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
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Mis grupos</h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={() => setSearchQuery("")}>
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">

          <Input
            type="text"
            placeholder="Buscar grupos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <div className="flex items-center space-x-1 jsustify-center">
            <Checkbox id="show-archived" checked={showArchived} onCheckedChange={(checked) => setShowArchived(Boolean(checked))} />
            <Label htmlFor="show-archived">Ver archivados</Label>
          </div>
            </div>
        </div>
      </div>

      {/* Groups List */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-medium">Todavía no tienes grupos</p>
            <p className="mt-1 text-sm text-muted-foreground">Crea uno o únete con un código.</p>
            <Button className="mt-4" onClick={() => router.push("/welcome")}>
              Crear o unirme a un grupo
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGroups.map((group) => {
              const balance = getBalanceDisplay(group.userBalance)
              return (
                <button
                  key={group.id}
                  onClick={() => router.push(`/group/${group.id}`)}
                  className={`w-full bg-card border rounded-lg p-4 hover:shadow-md transition-all text-left ${
                    group.archived ? "bg-warning-surface" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Group Avatar */}
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                        group.archived ? "opacity-60" : ""
                      }`}
                      style={{ backgroundColor: memberColor(group.name) }}
                    >
                      <span className="text-white font-semibold text-lg">{getGroupInitials(group.name)}</span>
                    </div>

                    {/* Group Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold text-base mb-1 truncate text-foreground ${group.archived ? "text-muted-foreground" : ""}`}>
                          {group.name}
                        </h3>
                        {group.archived && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-warning-surface px-2 py-0.5 text-xs font-medium text-warning">
                            <Archive className="w-3 h-3" />
                            Archivado
                          </span>
                        )}
                      </div>
                      <p className={`text-sm text-muted-foreground ${group.archived ? "text-muted-foreground/70" : ""}`}>
                        {group.memberCount} {group.memberCount === 1 ? "miembro" : "miembros"}, Total:{" "}
                        {formatMoney(group.totalExpenses)}
                      </p>
                    </div>

                    {/* Balance */}
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-medium ${group.archived ? "text-muted-foreground/70" : balance.color}`}>
                        {group.archived ? "—" : balance.text}
                      </p>
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
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg flex items-center justify-center transition-colors"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}
