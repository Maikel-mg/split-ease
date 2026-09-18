import { describe, it, expect } from 'vitest';
import { ValidationService } from './ValidationService';
import { Expense } from '@/core/entities/Expense';
import { Group } from '@/core/entities/Group';
import { Validation } from '@/core/entities/Validation';

describe('ValidationService', () => {
  const validationService = new ValidationService();

  const group: Group = {
    id: 'group-1',
    name: 'Test Group',
    code: 'ABC123',
    members: [
      { id: 'user-a', name: 'Alice', joinedAt: new Date() },
      { id: 'user-b', name: 'Bob', joinedAt: new Date() },
      { id: 'user-c', name: 'Charlie', joinedAt: new Date() },
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
    participants: ['user-a', 'user-b', 'user-c'],
    splitMode: 'equally',
    createdAt: new Date('2026-01-01'),
  };

  const taxi: Expense = {
    id: 'exp-2',
    groupId: 'group-1',
    amount: 12.5,
    paidBy: 'user-b',
    description: 'Taxi',
    date: new Date('2026-01-02'),
    participants: ['user-b', 'user-c'],
    splitMode: 'equally',
    createdAt: new Date('2026-01-02'),
  };

  const validation = (memberId: string, expensesFingerprint: string): Validation => ({
    id: `val-${memberId}`,
    groupId: 'group-1',
    memberId,
    expensesFingerprint,
    createdAt: new Date(),
  });

  describe('computeExpensesFingerprint', () => {
    it('is stable across reads of the same expenses', () => {
      const first = validationService.computeExpensesFingerprint([dinner, taxi]);
      const second = validationService.computeExpensesFingerprint([
        { ...dinner },
        { ...taxi },
      ]);

      expect(first).toBe(second);
    });

    it('ignores changes to description, date and image', () => {
      const edited: Expense = {
        ...dinner,
        description: 'Something else entirely',
        date: new Date('2030-12-31'),
        imageUrl: 'https://example.com/receipt.jpg',
      };

      expect(validationService.computeExpensesFingerprint([edited])).toBe(
        validationService.computeExpensesFingerprint([dinner]),
      );
    });

    it('changes when the amount changes', () => {
      expect(validationService.computeExpensesFingerprint([{ ...dinner, amount: 31 }])).not.toBe(
        validationService.computeExpensesFingerprint([dinner]),
      );
    });

    it('changes when the payer changes', () => {
      expect(validationService.computeExpensesFingerprint([{ ...dinner, paidBy: 'user-b' }])).not.toBe(
        validationService.computeExpensesFingerprint([dinner]),
      );
    });

    it('changes when the participants change', () => {
      expect(
        validationService.computeExpensesFingerprint([{ ...dinner, participants: ['user-a', 'user-b'] }]),
      ).not.toBe(validationService.computeExpensesFingerprint([dinner]));
    });

    it('changes when the split mode changes', () => {
      expect(validationService.computeExpensesFingerprint([{ ...dinner, splitMode: 'shares' }])).not.toBe(
        validationService.computeExpensesFingerprint([dinner]),
      );
    });

    it('changes when the split data changes', () => {
      const withSplit: Expense = { ...dinner, splitMode: 'shares', splitData: { 'user-a': 2, 'user-b': 1, 'user-c': 1 } };
      const otherSplit: Expense = { ...withSplit, splitData: { 'user-a': 3, 'user-b': 1, 'user-c': 1 } };

      expect(validationService.computeExpensesFingerprint([otherSplit])).not.toBe(
        validationService.computeExpensesFingerprint([withSplit]),
      );
    });

    it('does not depend on the order of split data keys', () => {
      const first: Expense = { ...dinner, splitMode: 'shares', splitData: { 'user-a': 2, 'user-b': 1, 'user-c': 1 } };
      const second: Expense = { ...dinner, splitMode: 'shares', splitData: { 'user-c': 1, 'user-b': 1, 'user-a': 2 } };

      expect(validationService.computeExpensesFingerprint([second])).toBe(
        validationService.computeExpensesFingerprint([first]),
      );
    });

    it('does not depend on the order of participants', () => {
      const reordered: Expense = { ...dinner, participants: ['user-c', 'user-a', 'user-b'] };

      expect(validationService.computeExpensesFingerprint([reordered])).toBe(
        validationService.computeExpensesFingerprint([dinner]),
      );
    });

    it('does not depend on the order of the expense list', () => {
      expect(validationService.computeExpensesFingerprint([taxi, dinner])).toBe(
        validationService.computeExpensesFingerprint([dinner, taxi]),
      );
    });

    it('changes when an expense is added or removed', () => {
      expect(validationService.computeExpensesFingerprint([dinner, taxi])).not.toBe(
        validationService.computeExpensesFingerprint([dinner]),
      );
    });

    it('normalises numeric values that arrive as strings from the database', () => {
      const asString: Expense = { ...dinner, amount: '30.00' as unknown as number };

      expect(validationService.computeExpensesFingerprint([asString])).toBe(
        validationService.computeExpensesFingerprint([dinner]),
      );
    });
  });

  describe('computeState', () => {
    it('counts the payer and the participants as eligible', () => {
      const state = validationService.computeState(group, [dinner], []);

      expect(state.eligibleMemberIds).toEqual(['user-a', 'user-b', 'user-c']);
      expect(state.totalEligible).toBe(3);
      expect(state.hasExpenses).toBe(true);
    });

    it('excludes a member who takes part in no expense', () => {
      const groupWithBystander: Group = {
        ...group,
        members: [...group.members, { id: 'user-d', name: 'Dana', joinedAt: new Date() }],
      };

      const state = validationService.computeState(groupWithBystander, [dinner], []);

      expect(state.eligibleMemberIds).not.toContain('user-d');
      expect(state.totalEligible).toBe(3);
    });

    it('is complete when every eligible member validated against the current expenses', () => {
      const fingerprint = validationService.computeExpensesFingerprint([dinner]);
      const state = validationService.computeState(group, [dinner], [
        validation('user-a', fingerprint),
        validation('user-b', fingerprint),
        validation('user-c', fingerprint),
      ]);

      expect(state.isComplete).toBe(true);
      expect(state.validatedCount).toBe(3);
      expect(state.pendingMemberIds).toEqual([]);
    });

    it('is not complete while an eligible member is pending', () => {
      const fingerprint = validationService.computeExpensesFingerprint([dinner]);
      const state = validationService.computeState(group, [dinner], [
        validation('user-a', fingerprint),
      ]);

      expect(state.isComplete).toBe(false);
      expect(state.validatedCount).toBe(1);
      expect(state.pendingMemberIds).toEqual(['user-b', 'user-c']);
    });

    it('does not count a validation made against older expenses', () => {
      const staleFingerprint = validationService.computeExpensesFingerprint([{ ...dinner, amount: 999 }]);
      const state = validationService.computeState(group, [dinner], [
        validation('user-a', staleFingerprint),
      ]);

      expect(state.validatedCount).toBe(0);
      expect(state.validatedMemberIds).toEqual([]);
      expect(state.pendingMemberIds).toEqual(['user-a', 'user-b', 'user-c']);
    });

    it('reports stale validations separately so the UI can explain them', () => {
      const staleFingerprint = validationService.computeExpensesFingerprint([{ ...dinner, amount: 999 }]);
      const state = validationService.computeState(group, [dinner], [
        validation('user-a', staleFingerprint),
      ]);

      expect(state.staleMemberIds).toEqual(['user-a']);
      expect(state.pendingMemberIds).toContain('user-a');
    });

    it('ignores validations from members who are not eligible', () => {
      const fingerprint = validationService.computeExpensesFingerprint([dinner]);
      const state = validationService.computeState(group, [dinner], [
        validation('user-a', fingerprint),
        validation('user-ghost', fingerprint),
      ]);

      expect(state.validatedMemberIds).toEqual(['user-a']);
      expect(state.staleMemberIds).toEqual([]);
    });

    it('has nothing to validate when the group has no expenses', () => {
      const state = validationService.computeState(group, [], []);

      expect(state.hasExpenses).toBe(false);
      expect(state.isComplete).toBe(false);
      expect(state.totalEligible).toBe(0);
      expect(state.pendingMemberIds).toEqual([]);
    });

    it('returns a member to pending when their validation is removed', () => {
      const fingerprint = validationService.computeExpensesFingerprint([dinner]);
      const before = validationService.computeState(group, [dinner], [
        validation('user-a', fingerprint),
        validation('user-b', fingerprint),
      ]);
      const after = validationService.computeState(group, [dinner], [
        validation('user-a', fingerprint),
      ]);

      expect(before.validatedCount).toBe(2);
      expect(after.validatedCount).toBe(1);
      expect(after.pendingMemberIds).toEqual(['user-b', 'user-c']);
    });

    it('invalidates everyone when a split of an unrelated expense changes', () => {
      const fingerprint = validationService.computeExpensesFingerprint([dinner, taxi]);
      const before = validationService.computeState(group, [dinner, taxi], [
        validation('user-a', fingerprint),
        validation('user-b', fingerprint),
        validation('user-c', fingerprint),
      ]);
      const after = validationService.computeState(group, [dinner, { ...taxi, amount: 13 }], [
        validation('user-a', fingerprint),
        validation('user-b', fingerprint),
        validation('user-c', fingerprint),
      ]);

      expect(before.isComplete).toBe(true);
      expect(after.isComplete).toBe(false);
      expect(after.validatedCount).toBe(0);
      expect(after.staleMemberIds).toEqual(['user-a', 'user-b', 'user-c']);
    });
  });
});
