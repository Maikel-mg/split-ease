import type { Debt } from '@/core/entities/Balance';

/**
 * Formats an array of debts into a human-readable string for sharing.
 * Each debt becomes one line: "Debtor → Creditor: XX.XX€"
 * @param debts - Array of Debt objects to format
 * @returns Formatted string with one debt per line, or empty string for empty input
 */
export function formatDebtsForSharing(debts: Debt[]): string {
  if (debts.length === 0) return '';

  return debts
    .map((debt) => `${debt.from} → ${debt.to}: ${debt.amount.toFixed(2)}€`)
    .join('\n');
}
