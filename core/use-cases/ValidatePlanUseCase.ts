// Use case: a member validates or retires their validation of the group's expenses
import type { ValidationService } from "@/core/services/ValidationService"
import type { ValidationRepository } from "@/core/ports/ValidationRepository"
import type { Group } from "@/core/entities/Group"
import type { Expense } from "@/core/entities/Expense"

export class ValidatePlanUseCase {
  constructor(
    private validationService: ValidationService,
    private validationRepository: ValidationRepository,
  ) {}

  async validate(group: Group, memberName: string, expenses: Expense[]): Promise<void> {
    const member = this.resolveEligibleMember(group, memberName, expenses)
    const fingerprint = this.validationService.computeExpensesFingerprint(expenses)

    await this.validationRepository.save(group.id, member.id, fingerprint)
  }

  async retire(group: Group, memberName: string): Promise<void> {
    const member = this.resolveMember(group, memberName)

    await this.validationRepository.retire(group.id, member.id)
  }

  private resolveMember(group: Group, memberName: string) {
    if (group.isPrivate) {
      throw new Error("La validación solo existe en grupos públicos")
    }

    const member = group.members.find((m) => m.name === memberName)
    if (!member) {
      throw new Error("No se ha encontrado tu nombre en este grupo")
    }

    return member
  }

  private resolveEligibleMember(group: Group, memberName: string, expenses: Expense[]) {
    const member = this.resolveMember(group, memberName)

    if (!this.validationService.eligibleMemberIds(group, expenses).includes(member.id)) {
      throw new Error("No participas en ningún gasto de este grupo, así que no hay nada que validar")
    }

    return member
  }
}
