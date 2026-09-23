"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Search, X } from "lucide-react"
import { AddExpenseForm } from "@/components/add-expense-form"
import { ExpenseList } from "@/components/expense-list"
import { BalanceSummary } from "@/components/balance-summary"
import { DebtSettlement } from "@/components/debt-settlement"
import { DanglingPaymentsBanner } from "@/components/dangling-payments-banner"
import { GroupInfo } from "@/components/group-info"
import { MyStatusTab } from "@/components/my-status-tab"
import { ValidationList } from "@/components/validation-list"
import { ValidationProgress } from "@/components/validation-progress"
import { useUserIdentity } from "@/lib/hooks/use-user-identity"
import type { Group } from "@/core/entities/Group"
import type { Expense } from "@/core/entities/Expense"
import type { Balance, Debt } from "@/core/entities/Balance"
import type { Payment } from "@/core/entities/Payment"
import { Input } from "@/components/ui/input"

import { GroupMenu } from "@/components/group-menu"
import { AppTour } from "@/components/app-tour"
import { getGroupTour, VALIDATION_TOUR } from "@/lib/tour/tour-content"
import { useGroupDetails } from "@/lib/hooks/use-group-details"
import { useGroupValidation } from "@/lib/hooks/use-group-validation"

export default function GroupPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string
  const { userMemberName } = useUserIdentity(groupId)

  const { 
    group, 
    expenses, 
    payments, 
    balances, 
    debts, 
    validationState,
    myValidation,
    loading, 
    refresh: loadData,
    setGroup,
    setExpenses,
    setPayments,
    setBalances,
    setDebts
  } = useGroupDetails(groupId, userMemberName)

  const { validate, retire, saving, error: validationError } = useGroupValidation()

  const [searchQuery, setSearchQuery] = useState("")
  const [searchVisible, setSearchVisible] = useState(false)
  const [selectedTab, setSelectedTab] = useState<string | null>(null)
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined)

  // Validation only exists in public groups. Until the user picks a tab, a public
  // group opens on "Mi estado" and a private one on "Saldos".
  const showValidation = !!group && !group.isPrivate
  const activeTab = selectedTab ?? (showValidation ? "status" : "balances")

  // Five tabs need a tighter label than three.
  const tabTriggerClass = showValidation ? "text-xs" : "text-sm"

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

  const handleValidate = async () => {
    if (!group || !userMemberName) return
    if (await validate(group, userMemberName, expenses)) loadData()
  }

  const handleRetire = async () => {
    if (!group || !userMemberName) return
    if (await retire(group, userMemberName)) loadData()
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

  // An empty list satisfies `every`, but a group with no expenses is not a
  // group that is even. Requiring real balances keeps the celebration honest.
  const groupSettled = balances.length > 0 && canArchive

  const groupTour = useMemo(() => getGroupTour(!!group?.isPrivate), [group?.isPrivate])

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

            <div className="flex items-center gap-2">
              {showValidation && validationState && (
                <ValidationProgress state={validationState} />
              )}

              {activeTab !== "status" && (
                <Button variant="ghost" size="icon" onClick={toggleSearch} className="h-9 w-9">
                  {searchVisible ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                </Button>
              )}

               <GroupMenu 
                group={group} 
                balances={balances} 
                debts={debts}
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

          {showValidation && validationState && payments.length > 0 && !validationState.isComplete && (
            <DanglingPaymentsBanner
              validatedCount={validationState.validatedCount}
              totalEligible={validationState.totalEligible}
            />
          )}

          <AddExpenseForm
            group={group}
            onExpenseAdded={handleExpenseAdded}
            editExpense={editingExpense}
            onExpenseUpdated={handleExpenseUpdated}
            hasPayments={payments.length > 0}
          />

          <Tabs value={activeTab} className="w-full" onValueChange={setSelectedTab}>
            <TabsList className={`grid w-full ${showValidation ? "grid-cols-5" : "grid-cols-3"}`}>
              {showValidation && (
                <TabsTrigger value="status" data-tour="tab-status" className={tabTriggerClass}>
                  Mi estado
                </TabsTrigger>
              )}
              <TabsTrigger value="balances" data-tour="tab-balances" className={tabTriggerClass}>
                Saldos
              </TabsTrigger>
              <TabsTrigger value="expenses" data-tour="tab-expenses" className={tabTriggerClass}>
                Gastos
              </TabsTrigger>
              {showValidation && (
                <TabsTrigger value="validation" data-tour="tab-validation" className={tabTriggerClass}>
                  Validación
                </TabsTrigger>
              )}
              <TabsTrigger value="settlement" data-tour="tab-settlement" className={tabTriggerClass}>
                Saldar
              </TabsTrigger>
            </TabsList>

            {showValidation && validationState && (
              <TabsContent value="status" className="mt-4">
                <MyStatusTab
                  group={group}
                  expenses={expenses}
                  payments={payments}
                  balances={balances}
                  debts={debts}
                  validationState={validationState}
                  myValidation={myValidation}
                  userMemberName={userMemberName}
                  saving={saving}
                  error={validationError}
                  onValidate={handleValidate}
                  onRetire={handleRetire}
                />
              </TabsContent>
            )}

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

            {showValidation && validationState && (
              <TabsContent value="validation" className="mt-4">
                <ValidationList group={group} state={validationState} />
              </TabsContent>
            )}

            <TabsContent value="settlement" className="mt-4">
              <DebtSettlement
                debts={filteredDebts}
                groupId={groupId}
                groupName={group.name}
                groupSettled={groupSettled}
                hasDebts={debts.length > 0}
                payments={payments}
                userMemberName={userMemberName}
                onPaymentsRegistered={handlePaymentsRegistered}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AppTour id="group" steps={groupTour} />
      {showValidation && (
        <AppTour id="validation" steps={VALIDATION_TOUR} autoStart={false} />
      )}
    </main>
  )
}
