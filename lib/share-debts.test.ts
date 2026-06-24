import { describe, it, expect } from 'vitest';
import { formatDebtsForSharing } from './share-debts';
import type { Debt } from '@/core/entities/Balance';

describe('formatDebtsForSharing', () => {
  it('formats a single debt correctly', () => {
    const debts: Debt[] = [{ from: 'Alice', to: 'Bob', amount: 10 }];
    expect(formatDebtsForSharing(debts)).toBe('Alice → Bob: 10.00€');
  });

  it('formats multiple debts on separate lines', () => {
    const debts: Debt[] = [
      { from: 'Alice', to: 'Bob', amount: 15.5 },
      { from: 'Bob', to: 'Charlie', amount: 25 },
    ];
    expect(formatDebtsForSharing(debts)).toBe(
      'Alice → Bob: 15.50€\nBob → Charlie: 25.00€'
    );
  });

  it('returns empty string for empty array', () => {
    expect(formatDebtsForSharing([])).toBe('');
  });

  it('preserves special characters in names (accents, ñ, spaces)', () => {
    const debts: Debt[] = [
      { from: 'María José', to: 'Año Nuevo', amount: 100 },
      { from: 'Ñoño', to: 'Señor García', amount: 50 },
    ];
    expect(formatDebtsForSharing(debts)).toBe(
      'María José → Año Nuevo: 100.00€\nÑoño → Señor García: 50.00€'
    );
  });

  it('rounds decimal amounts to 2 places correctly', () => {
    const debts: Debt[] = [
      { from: 'A', to: 'B', amount: 10.005 },
      { from: 'C', to: 'D', amount: 10.004 },
      { from: 'E', to: 'F', amount: 9.999 },
    ];
    expect(formatDebtsForSharing(debts)).toBe(
      'A → B: 10.01€\nC → D: 10.00€\nE → F: 10.00€'
    );
  });

  it('handles zero amount', () => {
    const debts: Debt[] = [{ from: 'Alice', to: 'Bob', amount: 0 }];
    expect(formatDebtsForSharing(debts)).toBe('Alice → Bob: 0.00€');
  });

  it('handles large amounts', () => {
    const debts: Debt[] = [{ from: 'Alice', to: 'Bob', amount: 1000000.99 }];
    expect(formatDebtsForSharing(debts)).toBe('Alice → Bob: 1000000.99€');
  });
});
