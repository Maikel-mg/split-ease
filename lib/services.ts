import { GroupService } from "@/domain/services/GroupService"
import { ExpenseService } from "@/domain/services/ExpenseService"
import { BalanceService } from "@/domain/services/BalanceService"
import { PaymentService } from "@/domain/services/PaymentService"
import { SupabaseGroupRepository } from "@/data/repositories/SupabaseGroupRepository"
import { SupabaseExpenseRepository } from "@/data/repositories/SupabaseExpenseRepository"
import { SupabasePaymentRepository } from "@/data/repositories/SupabasePaymentRepository"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

export function createServices(supabase: SupabaseClient) {
  const groupRepository = new SupabaseGroupRepository(supabase)
  const expenseRepository = new SupabaseExpenseRepository(supabase)
  const paymentRepository = new SupabasePaymentRepository(supabase)

  return {
    groupService: new GroupService(groupRepository),
    expenseService: new ExpenseService(expenseRepository),
    balanceService: new BalanceService(),
    paymentService: new PaymentService(paymentRepository),
  }
}

let clientServices: ReturnType<typeof createServices> | null = null

function getClientServices() {
  if (typeof window === "undefined") {
    throw new Error("Client services can only be used in browser context")
  }

  if (!clientServices) {
    const supabase = createClient()
    clientServices = createServices(supabase)
  }
  return clientServices
}

export function getGroupService() {
  return getClientServices().groupService
}

export function getExpenseService() {
  return getClientServices().expenseService
}

export function getBalanceService() {
  return getClientServices().balanceService
}

export function getPaymentService() {
  return getClientServices().paymentService
}
