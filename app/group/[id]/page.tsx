"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Share2 } from "lucide-react"
import { AddExpenseForm } from "@/components/add-expense-form"
import { ExpenseList } from "@/components/expense-list"
import { BalanceSummary } from "@/components/balance-summary"
import { SimplifiedDebts } from "@/components/simplified-debts"
import { DebtSettlement } from "@/components/debt-settlement"
import { GroupInfo } from "@/components/group-info"
import { ShareGroupDialog } from "@/components/share-group-dialog"
import { getGroupService, getExpenseService, getBalanceService, getPaymentService } from "@/lib/services"
import { useUserIdentity } from "@/lib/hooks/use-user-identity"
import type { Group } from "@/core/entities/Group"
import type { Expense } from "@/core/entities/Expense"
import type { Balance, Debt } from "@/core/entities/Balance"
import type { Payment } from "@/core/entities/Payment"

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
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleLeaveGroup} size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            
            <Button variant="ghost" size="sm" onClick={() => setShareDialogOpen(true)}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
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

          <Tabs defaultValue="balances" className="w-full">
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
                expenses={expenses}
                onExpenseDeleted={handleExpenseDeleted}
                onExpenseEdit={handleExpenseEdit}
                userMemberName={userMemberName}
              />
            </TabsContent>

            <TabsContent value="balances" className="mt-4">
              <BalanceSummary
                balances={balances}
                expenses={expenses}
                payments={payments}
                group={group}
                userMemberName={userMemberName}
              />
            </TabsContent>

            <TabsContent value="debts" className="mt-4">
              <SimplifiedDebts debts={debts} userMemberName={userMemberName} />
            </TabsContent>

            <TabsContent value="settlement" className="mt-4">
              <DebtSettlement
                debts={debts}
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
    </main>
  )
}
