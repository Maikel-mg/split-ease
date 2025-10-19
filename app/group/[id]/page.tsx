"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MoreVertical, Share2, UserPlus, Search, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AddExpenseForm } from "@/components/add-expense-form"
import { ExpenseList } from "@/components/expense-list"
import { BalanceSummary } from "@/components/balance-summary"
import { DebtSettlement } from "@/components/debt-settlement"
import { GroupInfo } from "@/components/group-info"
import { ShareGroupDialog } from "@/components/share-group-dialog"
import { AddMemberDialog } from "@/components/add-member-dialog"
import { getGroupService, getExpenseService, getBalanceService, getPaymentService } from "@/lib/services"
import { useUserIdentity } from "@/lib/hooks/use-user-identity"
import type { Group } from "@/core/entities/Group"
import type { Expense } from "@/core/entities/Expense"
import type { Balance, Debt } from "@/core/entities/Balance"
import type { Payment } from "@/core/entities/Payment"
import { Input } from "@/components/ui/input"

export default function GroupPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string
  const { userMemberName } = useUserIdentity(groupId)

  const [group, setGroup] = useState<Group | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [balances, setBalances] = useState<Balance[]>([])
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchVisible, setSearchVisible] = useState(false)
  const [activeTab, setActiveTab] = useState("balances")

  const loadData = async () => {
    try {
      const groupService = getGroupService()
      const expenseService = getExpenseService()
      const balanceService = getBalanceService()
      const paymentService = getPaymentService()

      const groupData = await groupService.getGroup(groupId)
      if (!groupData) {
        router.push("/grupos")
        return
      }

      const expensesData = await expenseService.getExpensesByGroup(groupId)
      const paymentsData = await paymentService.getPaymentsByGroup(groupId)

      const balancesData = balanceService.calculateBalances(groupData, expensesData, paymentsData)
      const debtsData = balanceService.simplifyDebts(balancesData)

      setGroup(groupData)
      setExpenses(expensesData)
      setPayments(paymentsData)
      setBalances(balancesData)
      setDebts(debtsData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [groupId])

  useEffect(() => {
    setSearchQuery("")
    setSearchVisible(false)
  }, [activeTab])

  const handleExpenseAdded = () => {
    loadData()
  }

  const handleExpenseDeleted = () => {
    loadData()
  }

  const handleExpenseEdit = (expense: Expense) => {
    setEditingExpense(expense)
  }

  const handleExpenseUpdated = () => {
    setEditingExpense(undefined)
    loadData()
  }

  const handlePaymentsRegistered = () => {
    loadData()
  }

  const handleLeaveGroup = () => {
    router.push("/grupos")
  }

  const handleShareClick = () => {
    console.log("[v0] Share clicked")
    setShareDialogOpen(true)
    setDropdownOpen(false)
  }

  const handleAddMemberClick = () => {
    console.log("[v0] Add member clicked")
    setAddMemberDialogOpen(true)
    setDropdownOpen(false)
  }

  const toggleSearch = () => {
    if (searchVisible) {
      setSearchQuery("")
    }
    setSearchVisible(!searchVisible)
  }

  const handleMemberAdded = () => {
    loadData()
  }

  const filteredExpenses = expenses.filter((expense) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    const payerName = group?.members.find((m) => m.id === expense.paidBy)?.name?.toLowerCase() || ""
    const title = expense.description?.toLowerCase() || ""
    return payerName.includes(query) || title.includes(query)
  })

  const filteredBalances = balances.filter((balance) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return balance.memberName?.toLowerCase().includes(query) || false
  })

  const filteredDebts = debts.filter((debt) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    const fromName = debt.from?.toLowerCase() || ""
    const toName = debt.to?.toLowerCase() || ""
    return fromName.includes(query) || toName.includes(query)
  })

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-muted-foreground">Cargando...</p>
        </div>
      </main>
    )
  }

  if (!group) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-0 bg-background border-b z-10 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" onClick={handleLeaveGroup} size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={toggleSearch} className="h-9 w-9">
                {searchVisible ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9">
                  <MoreVertical className="h-5 w-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleShareClick}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleAddMemberClick}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Añadir persona
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {searchVisible && (
            <div className="mt-2">
              <Input
                type="text"
                placeholder={
                  activeTab === "expenses"
                    ? "Buscar por título o pagador..."
                    : activeTab === "balances"
                      ? "Buscar por participante..."
                      : "Buscar por participante..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>
          )}
        </div>

        <div className="p-4 space-y-4">
          <GroupInfo group={group} userMemberName={userMemberName} />

          <AddExpenseForm
            group={group}
            onExpenseAdded={handleExpenseAdded}
            editExpense={editingExpense}
            onExpenseUpdated={handleExpenseUpdated}
            userMemberName={userMemberName}
          />

          <Tabs defaultValue="balances" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 h-11">
              <TabsTrigger value="balances" className="text-sm">
                Saldos
              </TabsTrigger>
              <TabsTrigger value="expenses" className="text-sm">
                Gastos
              </TabsTrigger>
              <TabsTrigger value="settlement" className="text-sm">
                Saldar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="expenses" className="mt-4">
              <ExpenseList
                group={group}
                expenses={filteredExpenses}
                onExpenseDeleted={handleExpenseDeleted}
                onExpenseEdit={handleExpenseEdit}
                userMemberName={userMemberName}
              />
            </TabsContent>

            <TabsContent value="balances" className="mt-4">
              <BalanceSummary
                balances={filteredBalances}
                expenses={expenses}
                payments={payments}
                group={group}
                userMemberName={userMemberName}
              />
            </TabsContent>

            <TabsContent value="settlement" className="mt-4">
              <DebtSettlement
                debts={filteredDebts}
                groupId={groupId}
                payments={payments}
                onPaymentsRegistered={handlePaymentsRegistered}
                userMemberName={userMemberName}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <ShareGroupDialog
        groupName={group.name}
        groupCode={group.code}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />
      {group && (
        <AddMemberDialog
          group={group}
          onMemberAdded={handleMemberAdded}
          open={addMemberDialogOpen}
          onOpenChange={setAddMemberDialogOpen}
        />
      )}
    </main>
  )
}
