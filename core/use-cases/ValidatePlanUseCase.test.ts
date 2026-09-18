import { describe, it, expect } from 'vitest';
import { ValidatePlanUseCase } from './ValidatePlanUseCase';
import { ValidationService } from '@/core/services/ValidationService';
import type { ValidationRepository } from '@/core/ports/ValidationRepository';
import type { Validation } from '@/core/entities/Validation';
import type { Expense } from '@/core/entities/Expense';
import type { Group } from '@/core/entities/Group';

class FakeValidationRepository implements ValidationRepository {
  saved: Array<{ groupId: string; memberId: string; expensesFingerprint: string }> = [];
  retired: Array<{ groupId: string; memberId: string }> = [];

  async save(groupId: string, memberId: string, expensesFingerprint: string): Promise<Validation> {
    this.saved.push({ groupId, memberId, expensesFingerprint });
    return {
      id: `val-${memberId}`,
      groupId,
      memberId,
      expensesFingerprint,
      createdAt: new Date(),
    };
  }

  async retire(groupId: string, memberId: string): Promise<void> {
    this.retired.push({ groupId, memberId });
  }

  async findByGroup(): Promise<Validation[]> {
    return [];
  }
}

describe('ValidatePlanUseCase', () => {
  const validationService = new ValidationService();

  const group: Group = {
    id: 'group-1',
    name: 'Test Group',
    code: 'ABC123',
    members: [
      { id: 'user-a', name: 'Alice', joinedAt: new Date() },
      { id: 'user-b', name: 'Bob', joinedAt: new Date() },
      { id: 'user-d', name: 'Dana', joinedAt: new Date() },
    ],
    createdAt: new Date(),
    archived: false,
    isPrivate: false,
  };

  const dinner: Expense = {
    id: 'exp-1',
    groupId: 'group-1',
    amount: 30,
    paidBy: 'user-a',
    description: 'Dinner',
    date: new Date('2026-01-01'),
    participants: ['user-a', 'user-b'],
    splitMode: 'equally',
    createdAt: new Date('2026-01-01'),
  };

  const setup = () => {
    const repository = new FakeValidationRepository();
    const useCase = new ValidatePlanUseCase(validationService, repository);
    return { repository, useCase };
  };

  it('saves the validation with the fingerprint of the current expenses', async () => {
    const { repository, useCase } = setup();

    await useCase.validate(group, 'Bob', [dinner]);

    expect(repository.saved).toEqual([
      {
        groupId: 'group-1',
        memberId: 'user-b',
        expensesFingerprint: validationService.computeExpensesFingerprint([dinner]),
      },
    ]);
  });

  it('rejects a name that is not in the group', async () => {
    const { repository, useCase } = setup();

    await expect(useCase.validate(group, 'Nobody', [dinner])).rejects.toThrow(
      'No se ha encontrado tu nombre en este grupo',
    );
    expect(repository.saved).toEqual([]);
  });

  it('rejects a private group', async () => {
    const { repository, useCase } = setup();
    const privateGroup: Group = { ...group, isPrivate: true };

    await expect(useCase.validate(privateGroup, 'Alice', [dinner])).rejects.toThrow(
      'La validación solo existe en grupos públicos',
    );
    await expect(useCase.retire(privateGroup, 'Alice')).rejects.toThrow(
      'La validación solo existe en grupos públicos',
    );
    expect(repository.saved).toEqual([]);
    expect(repository.retired).toEqual([]);
  });

  it('rejects a member who takes part in no expense', async () => {
    const { repository, useCase } = setup();

    await expect(useCase.validate(group, 'Dana', [dinner])).rejects.toThrow(
      'No participas en ningún gasto de este grupo',
    );
    expect(repository.saved).toEqual([]);
  });

  it('rejects every member when the group has no expenses', async () => {
    const { repository, useCase } = setup();

    await expect(useCase.validate(group, 'Alice', [])).rejects.toThrow(
      'No participas en ningún gasto de este grupo',
    );
    expect(repository.saved).toEqual([]);
  });

  it('retires only the caller validation', async () => {
    const { repository, useCase } = setup();

    await useCase.retire(group, 'Bob');

    expect(repository.retired).toEqual([{ groupId: 'group-1', memberId: 'user-b' }]);
  });
});
