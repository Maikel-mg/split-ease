
import { describe, it, expect } from 'vitest';
import { BalanceService } from './BalanceService';
import { Expense } from '@/core/entities/Expense';
import { Group, Member } from '@/core/entities/Group';

describe('BalanceService', () => {
  const balanceService = new BalanceService();

  const mockGroup: Group = {
    id: 'group-1',
    name: 'Test Group',
    currency: 'EUR',
    members: [
      { id: 'user-a', name: 'Alice', joinedAt: new Date() },
      { id: 'user-b', name: 'Bob', joinedAt: new Date() },
      { id: 'user-c', name: 'Charlie', joinedAt: new Date() },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    isPrivate: true,
    code: '1234',
    archived: false,
  } as Group;

  it('calculates balances correctly for a simple equal split (Global View)', () => {
    // Alice pays 30 for everyone (10 each)
    const expenses: Expense[] = [{
      id: 'exp-1',
      groupId: 'group-1',
      description: 'Dinner',
      amount: 30,
      paidBy: 'user-a',
      splitMode: 'equally',
      participants: ['user-a', 'user-b', 'user-c'],
      date: new Date(),
      createdAt: new Date(),
    }];

    const balances = balanceService.calculateBalances(mockGroup, expenses, []);
    
    // Alice: Paid 30, Owed 10 -> Net +20
    const alice = balances.find(b => b.memberId === 'user-a');
    expect(alice?.netBalance).toBe(20);

    // Bob: Paid 0, Owed 10 -> Net -10
    const bob = balances.find(b => b.memberId === 'user-b');
    expect(bob?.netBalance).toBe(-10);

    // Charlie: Paid 0, Owed 10 -> Net -10
    const charlie = balances.find(b => b.memberId === 'user-c');
    expect(charlie?.netBalance).toBe(-10);
  });

  it('demonstrates Private Group Partial View logic', () => {
    // Scenario:
    // 1. Alice pays 10 for Bob (Visible to Alice, Bob) - Invisible to Charlie
    // 2. Bob pays 10 for Charlie (Visible to Bob, Charlie) - Invisible to Alice
    
    const expense1: Expense = {
      id: 'e1', groupId: 'g1', description: 'A pays for B', amount: 10,
      paidBy: 'user-a', splitMode: 'equally', participants: ['user-b'], // 100% to B
      date: new Date(), createdAt: new Date()
    };

    const expense2: Expense = {
      id: 'e2', groupId: 'g1', description: 'B pays for C', amount: 10,
      paidBy: 'user-b', splitMode: 'equally', participants: ['user-c'], // 100% to C
      date: new Date(), createdAt: new Date()
    };

    const allExpenses = [expense1, expense2];

    // --- Global Truth ---
    // A: +10 (paid 10, owed 0)
    // B: 0 (paid 10, consumed 10)
    // C: -10 (paid 0, consumed 10)
    const globalBalances = balanceService.calculateBalances(mockGroup, allExpenses);    
    expect(globalBalances.find(b => b.memberId === 'user-a')?.netBalance).toBe(10);
    expect(globalBalances.find(b => b.memberId === 'user-b')?.netBalance).toBe(0);
    expect(globalBalances.find(b => b.memberId === 'user-c')?.netBalance).toBe(-10);

    // --- Alice's View (Private) ---
    // Alice only sees expense1 (involved). Expense2 is between B and C.
    const aliceExpenses = allExpenses.filter(e => 
      e.paidBy === 'user-a' || e.participants.includes('user-a')
    );
    // Alice sees: A pays 10 for B.
    // A: +10
    // B: -10
    // C: 0 (no info)
    const aliceBalances = balanceService.calculateBalances(mockGroup, aliceExpenses);
    const aliceDebts = balanceService.simplifyDebts(aliceBalances);

    expect(aliceBalances.find(b => b.memberId === 'user-a')?.netBalance).toBe(10);
    expect(aliceBalances.find(b => b.memberId === 'user-b')?.netBalance).toBe(-10); // In Alice's eyes, B owes her.
    expect(aliceBalances.find(b => b.memberId === 'user-c')?.netBalance).toBe(0);

    // Debt suggestion for Alice: "B pays A 10"
    expect(aliceDebts).toEqual(expect.arrayContaining([
      expect.objectContaining({ from: 'Bob', to: 'Alice', amount: 10 })
    ]));

    // --- Bob's View (Private) ---
    // Bob sees both (involved in both)
    const bobExpenses = allExpenses.filter(e => 
      e.paidBy === 'user-b' || e.participants.includes('user-b')
    );
    expect(bobExpenses.length).toBe(2);
    
    const bobBalances = balanceService.calculateBalances(mockGroup, bobExpenses);
    expect(bobBalances.find(b => b.memberId === 'user-b')?.netBalance).toBe(0); // Valid
  });

  it('validates User Scenario: Amatxu, Joanna, Maikel', () => {
    // Group Members: Amatxu, Joanna, Maikel
    const members: Member[] = [
      { id: 'u-amatxu', name: 'Amatxu', joinedAt: new Date() },
      { id: 'u-joanna', name: 'Joanna', joinedAt: new Date() },
      { id: 'u-maikel', name: 'Maikel', joinedAt: new Date() },
    ];
    
    const scenarioGroup: Group = {
      ...mockGroup,
      members: members
    };

    // Expenses:
    // 1. REGALO: Joanna (20) -> Joanna, Maikel
    const regalo: Expense = {
      id: 'regalo', groupId: 'g1', description: 'REGALO', amount: 20,
      paidBy: 'u-joanna', splitMode: 'equally', participants: ['u-joanna', 'u-maikel'],
      date: new Date(), createdAt: new Date()
    };

    // 2. MK: Maikel (20) -> Amatxu, Maikel
    const mk: Expense = {
      id: 'mk', groupId: 'g1', description: 'MK', amount: 20,
      paidBy: 'u-maikel', splitMode: 'equally', participants: ['u-amatxu', 'u-maikel'],
      date: new Date(), createdAt: new Date()
    };

    // 3. Chuches: Amatxu (30) -> Amatxu, Joanna, Maikel
    const chuches: Expense = {
      id: 'chuches', groupId: 'g1', description: 'Chuches', amount: 30,
      paidBy: 'u-amatxu', splitMode: 'equally', participants: ['u-amatxu', 'u-joanna', 'u-maikel'],
      date: new Date(), createdAt: new Date()
    };

    const allExpenses = [regalo, mk, chuches];

    // --- Global Logic ---
    // Regalo: Joanna paid 20 (Share 10), Maikel Share 10. (Joanna +10, Maikel -10)
    // MK: Maikel paid 20 (Share 10), Amatxu Share 10. (Maikel +10, Amatxu -10)
    // Chuches: Amatxu paid 30 (Share 10), Joanna Share 10, Maikel Share 10. (Amatxu +20, Joanna -10, Maikel -10)
    
    // Totals:
    // Joanna: +10 - 10 = 0
    // Maikel: -10 + 10 - 10 = -10
    // Amatxu: -10 + 20 = +10
    // Expected: Maikel pays Amatxu 10.

    const globalBalances = balanceService.calculateBalances(scenarioGroup, allExpenses);
    const globalDebts = balanceService.simplifyDebts(globalBalances);

    expect(globalBalances.find(b => b.memberId === 'u-joanna')?.netBalance).toBe(0);
    expect(globalBalances.find(b => b.memberId === 'u-maikel')?.netBalance).toBe(-10);
    expect(globalBalances.find(b => b.memberId === 'u-amatxu')?.netBalance).toBe(10);
    
    expect(globalDebts).toEqual(expect.arrayContaining([
      expect.objectContaining({ from: 'Maikel', to: 'Amatxu', amount: 10 })
    ]));

     // --- Joanna's View (Private) ---
     // Joanna sees: REGALO (inv), Chuches (inv). NOT MK.
     const joannaExpenses = allExpenses.filter(e => 
       e.paidBy === 'u-joanna' || e.participants.includes('u-joanna')
     );
     // Joanna Calc:
     // Regalo: Joanna +10 (Paid 20, share 10), Maikel -10
     // Chuches: Amatxu +20 (Paid 30, share 10), Joanna -10, Maikel -10
     // Joanna Net: +10 - 10 = 0.
     // Maikel Net: -10 - 10 = -20.
     // Amatxu Net: = +20.
     // Expected Local Debt: Maikel pays Amatxu 20.

     const joannaBalances = balanceService.calculateBalances(scenarioGroup, joannaExpenses);
     const joannaDebts = balanceService.simplifyDebts(joannaBalances);
     
     expect(joannaBalances.find(b => b.memberId === 'u-joanna')?.netBalance).toBe(0);
     expect(joannaBalances.find(b => b.memberId === 'u-maikel')?.netBalance).toBe(-20);
     expect(joannaBalances.find(b => b.memberId === 'u-amatxu')?.netBalance).toBe(20);
     
     expect(joannaDebts).toEqual(expect.arrayContaining([
        expect.objectContaining({ from: 'Maikel', to: 'Amatxu', amount: 20 })
     ]));
  });

  it('verifies Direct Debt Calculation for Private Groups (Joanna View)', () => {
     // Same Scenario: Amatxu, Joanna, Maikel
     const members: Member[] = [
       { id: 'u-amatxu', name: 'Amatxu', joinedAt: new Date() },
       { id: 'u-joanna', name: 'Joanna', joinedAt: new Date() },
       { id: 'u-maikel', name: 'Maikel', joinedAt: new Date() },
     ];
     
     const scenarioGroup: Group = { ...mockGroup, members };
 
     // Expenses:
     // 1. REGALO: Joanna (20) -> Joanna, Maikel
     // Maikel owes Joanna 10.
     const regalo: Expense = {
       id: 'regalo', groupId: 'g1', description: 'REGALO', amount: 20,
       paidBy: 'u-joanna', splitMode: 'equally', participants: ['u-joanna', 'u-maikel'],
       date: new Date(), createdAt: new Date()
     };
 
     // 2. MK: Maikel (20) -> Amatxu, Maikel
     // Amatxu owes Maikel 10.
     const mk: Expense = {
       id: 'mk', groupId: 'g1', description: 'MK', amount: 20,
       paidBy: 'u-maikel', splitMode: 'equally', participants: ['u-amatxu', 'u-maikel'],
       date: new Date(), createdAt: new Date()
     };
 
     // 3. Chuches: Amatxu (30) -> Amatxu, Joanna, Maikel
     // Joanna owes Amatxu 10.
     // Maikel owes Amatxu 10.
     const chuches: Expense = {
       id: 'chuches', groupId: 'g1', description: 'Chuches', amount: 30,
       paidBy: 'u-amatxu', splitMode: 'equally', participants: ['u-amatxu', 'u-joanna', 'u-maikel'],
       date: new Date(), createdAt: new Date()
     };
    
     const allExpenses = [regalo, mk, chuches];

     // Joanna's View: REGALO + CHUCHES (MK is invisible)
     const joannaExpenses = allExpenses.filter(e => e.id !== 'mk');

     // Direct Calculation:
     // 1. REGALO: Maikel owes Joanna 10.
     // 2. CHUCHES: Joanna owes Amatxu 10. Maikel owes Amatxu 10.
     
     // Expected Debts:
     // Maikel -> Joanna: 10
     // Joanna -> Amatxu: 10
     // Maikel -> Amatxu: 10
     
     // NOTE: This differs from Global Simplify (Transititivity).
     // Global Net was: Maikel pays Amatxu 10. Joanna 0.
     // But directly: Joanna owes Amatxu 10 for Chuches, and Maikel owes Joanna 10 for Regalo.
     // In a private group, Joanna SHOULD see that she owes Amatxu 10. And Maikel owes her 10.
     // She cannot assume Maikel pays Amatxu directly for her part because she doesn't see the full picture.
     
     const directDebts = balanceService.calculateDirectDebts(scenarioGroup, joannaExpenses, []);
     
     console.log('Direct Debts (Joanna View):', directDebts);
     
     expect(directDebts).toHaveLength(3);
     expect(directDebts).toEqual(expect.arrayContaining([
         expect.objectContaining({ from: 'Maikel', to: 'Joanna', amount: 10 }),
         expect.objectContaining({ from: 'Joanna', to: 'Amatxu', amount: 10 }),
         expect.objectContaining({ from: 'Maikel', to: 'Amatxu', amount: 10 }),
     ]));
  });

  it('verifies Direct Debt Calculation for Private Groups (Maikel View)', () => {
    // Same Scenario: Amatxu, Joanna, Maikel
    const members: Member[] = [
      { id: 'u-amatxu', name: 'Amatxu', joinedAt: new Date() },
      { id: 'u-joanna', name: 'Joanna', joinedAt: new Date() },
      { id: 'u-maikel', name: 'Maikel', joinedAt: new Date() },
    ];
    
    const scenarioGroup: Group = { ...mockGroup, members };

    // Expenses:
    // 1. REGALO: Joanna (20) -> Joanna, Maikel
    // Maikel owes Joanna 10.
    const regalo: Expense = {
      id: 'regalo', groupId: 'g1', description: 'REGALO', amount: 20,
      paidBy: 'u-joanna', splitMode: 'equally', participants: ['u-joanna', 'u-maikel'],
      date: new Date(), createdAt: new Date()
    };

    // 2. MK: Maikel (20) -> Amatxu, Maikel
    // Amatxu owes Maikel 10.
    const mk: Expense = {
      id: 'mk', groupId: 'g1', description: 'MK', amount: 20,
      paidBy: 'u-maikel', splitMode: 'equally', participants: ['u-amatxu', 'u-maikel'],
      date: new Date(), createdAt: new Date()
    };

    // 3. Chuches: Amatxu (30) -> Amatxu, Joanna, Maikel
    // Joanna owes Amatxu 10.
    // Maikel owes Amatxu 10.
    const chuches: Expense = {
      id: 'chuches', groupId: 'g1', description: 'Chuches', amount: 30,
      paidBy: 'u-amatxu', splitMode: 'equally', participants: ['u-amatxu', 'u-joanna', 'u-maikel'],
      date: new Date(), createdAt: new Date()
    };
   
    const allExpenses = [regalo, mk, chuches];

    // Maikel's View: REGALO + MK + CHUCHES (Maikel is in all of them)
    // Maikel sees everything.
    const maikelExpenses = allExpenses;

    // Direct Calculation Logic for Maikel:
    // 1. REGALO: Maikel owes Joanna 10.
    // 2. MK: Amatxu owes Maikel 10. (-10 for Maikel -> Amatxu)
    // 3. CHUCHES: Maikel owes Amatxu 10. (+10 for Maikel -> Amatxu)
    //    CHUCHES: Joanna owes Amatxu 10.
    
    // Net Maikel <-> Amatxu: -10 + 10 = 0.
    
    // Expected Debts:
    // Maikel -> Joanna: 10
    // Joanna -> Amatxu: 10
    
    const directDebts = balanceService.calculateDirectDebts(scenarioGroup, maikelExpenses, []);
    
    console.log('Direct Debts (Maikel View):', directDebts);
    
    expect(directDebts).toHaveLength(2);
    expect(directDebts).toEqual(expect.arrayContaining([
        expect.objectContaining({ from: 'Maikel', to: 'Joanna', amount: 10 }),
        expect.objectContaining({ from: 'Joanna', to: 'Amatxu', amount: 10 }),
    ]));
  });

  it('calculates Relative Balances for UI (Joanna View)', () => {
      // Scenario: Joanna View (Private)
      // Direct Debts: Maikel -> Joanna (10), Joanna -> Amatxu (10)
      
      const members: Member[] = [
        { id: 'u-amatxu', name: 'Amatxu', joinedAt: new Date() },
        { id: 'u-joanna', name: 'Joanna', joinedAt: new Date() },
        { id: 'u-maikel', name: 'Maikel', joinedAt: new Date() },
      ];
      const scenarioGroup: Group = { ...mockGroup, members };

      const directDebts = [
        { from: 'Maikel', to: 'Joanna', amount: 10 },
        { from: 'Joanna', to: 'Amatxu', amount: 10 }
      ];

      const relativeBalances = balanceService.calculateRelativeBalances(scenarioGroup, directDebts, 'Joanna');

      // Maikel: Owes Joanna 10. Relative: -10 (Red)
      const maikel = relativeBalances.find(b => b.memberName === 'Maikel');
      expect(maikel?.netBalance).toBe(-10);

      // Amatxu: Joanna owes her 10. Relative: +10 (Green)
      const amatxu = relativeBalances.find(b => b.memberName === 'Amatxu');
      expect(amatxu?.netBalance).toBe(10);

      // Joanna: Net (Owes 10, Owed 10) = 0
      const joanna = relativeBalances.find(b => b.memberName === 'Joanna');
      expect(joanna?.netBalance).toBe(0);
  });
});
