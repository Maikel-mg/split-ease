"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Search, X } from "lucide-react"
import { AddExpenseForm } from "@/components/add-expense-form"
import { ExpenseList } from "@/components/expense-list"
import { BalanceSummary } from "@/components/balance-summary"
import { DebtSettlement } from "@/components/debt-settlement"
import { GroupInfo } from "@/components/group-info"
import { getGroupService, getExpenseService, getBalanceService, getPaymentService } from "@/lib/services"
import { useUserIdentity } from "@/lib/hooks/use-user-identity"
import type { Group } from "@/core/entities/Group"
import type { Expense } from "@/core/entities/Expense"
import type { Balance, Debt } from "@/core/entities/Balance"
import type { Payment } from "@/core/entities/Payment"
import { Input } from "@/components/ui/input"

import { GetGroupDetailsUseCase } from "@/core/use-cases/GetGroupDetailsUseCase"
import { GroupMenu } from "@/components/group-menu"

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

  const [searchQuery, setSearchQuery] = useState("")
  const [searchVisible, setSearchVisible] = useState(false)
  const [activeTab, setActiveTab] = useState("balances")

  const loadData = useCallback(async () => {
    try {
      const groupService = getGroupService()
      const expenseService = getExpenseService()
      const balanceService = getBalanceService()
      const paymentService = getPaymentService()
      
      const getGroupDetailsUseCase = new GetGroupDetailsUseCase(
        groupService,
        expenseService,
        balanceService,
        paymentService
      )

      const details = await getGroupDetailsUseCase.execute(groupId, userMemberName || undefined)
      
      if (!details) {
        router.push("/grupos")
        return
      }

      setGroup(details.group)
      setExpenses(details.visibleExpenses)
      setPayments(details.visiblePayments)
      setBalances(details.balances)
      setDebts(details.debts)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }, [groupId, userMemberName, router])

  useEffect(() => {
    loadData()
  }, [loadData])

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

  const toggleSearch = () => {
    if (searchVisible) {
      setSearchQuery("")
    }
    setSearchVisible(!searchVisible)
  }

  const handleLeaveGroup = () => {
    router.push("/grupos")
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

  const canArchive = balances.every((b) => Math.abs(b.netBalance) < 0.01)

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

               <GroupMenu 
                group={group} 
                balances={balances} 
                onGroupUpdated={loadData}
                onMemberAdded={loadData}
                onMemberRemoved={loadData}
              />
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
              />
            </TabsContent>

            <TabsContent value="balances" className="mt-4">
              <BalanceSummary
                balances={filteredBalances}
                expenses={expenses}
                payments={payments}
                group={group}
              />
            </TabsContent>

            <TabsContent value="settlement" className="mt-4">
              <DebtSettlement
                debts={filteredDebts}
                groupId={groupId}
                payments={payments}
                onPaymentsRegistered={handlePaymentsRegistered}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

    </main>
  )
}