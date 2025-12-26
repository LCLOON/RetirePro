import { describe, it, expect } from 'vitest';
import {
  calculateFutureValue,
  calculateFutureValueAnnuity,
  calculateFutureValueGrowingAnnuity,
  calculateYearsLast,
  calculateMortgagePayment,
  calculateDebtPayoff,
  calculate72tSEPP,
  formatCurrency,
  formatPercent,
} from '@/lib/calculations';

describe('Future Value Calculations', () => {
  describe('calculateFutureValue', () => {
    it('calculates future value correctly for positive inputs', () => {
      // $100,000 at 7% for 10 years = $196,715.14
      const result = calculateFutureValue(100000, 0.07, 10);
      expect(result).toBeCloseTo(196715.14, 0);
    });

    it('returns present value when years is 0', () => {
      expect(calculateFutureValue(100000, 0.07, 0)).toBe(100000);
    });

    it('returns present value when years is negative', () => {
      expect(calculateFutureValue(100000, 0.07, -5)).toBe(100000);
    });

    it('returns present value when pv is 0', () => {
      expect(calculateFutureValue(0, 0.07, 10)).toBe(0);
    });

    it('handles zero interest rate', () => {
      expect(calculateFutureValue(100000, 0, 10)).toBe(100000);
    });
  });

  describe('calculateFutureValueAnnuity', () => {
    it('calculates FV of annuity correctly', () => {
      // $10,000/year at 7% for 10 years = $138,164.48
      const result = calculateFutureValueAnnuity(10000, 0.07, 10);
      expect(result).toBeCloseTo(138164.48, 0);
    });

    it('returns 0 for zero payment', () => {
      expect(calculateFutureValueAnnuity(0, 0.07, 10)).toBe(0);
    });

    it('returns 0 for zero years', () => {
      expect(calculateFutureValueAnnuity(10000, 0.07, 0)).toBe(0);
    });

    it('handles zero interest rate', () => {
      // Simple sum when rate = 0
      expect(calculateFutureValueAnnuity(10000, 0, 10)).toBe(100000);
    });
  });

  describe('calculateFutureValueGrowingAnnuity', () => {
    it('calculates FV of growing annuity correctly', () => {
      // $10,000/year growing at 3%, earning 7%, for 10 years
      const result = calculateFutureValueGrowingAnnuity(10000, 0.07, 10, 0.03);
      expect(result).toBeGreaterThan(138164); // Should be more than non-growing
    });

    it('returns 0 for zero payment', () => {
      expect(calculateFutureValueGrowingAnnuity(0, 0.07, 10, 0.03)).toBe(0);
    });

    it('handles when rate equals growth rate', () => {
      // Special case when r ≈ g
      const result = calculateFutureValueGrowingAnnuity(10000, 0.07, 10, 0.07);
      expect(result).toBeGreaterThan(0);
    });
  });
});

describe('Retirement Income Calculations', () => {
  describe('calculateYearsLast', () => {
    it('calculates years savings will last', () => {
      // $1M balance, $50k withdrawal, 5% return, 2.5% inflation
      const result = calculateYearsLast(1000000, 50000, 0.05, 0.025);
      expect(result).toBeGreaterThan(25);
      expect(result).toBeLessThan(50);
    });

    it('returns 0 for zero balance', () => {
      expect(calculateYearsLast(0, 50000, 0.05, 0.025)).toBe(0);
    });

    it('returns Infinity for zero withdrawal', () => {
      expect(calculateYearsLast(1000000, 0, 0.05, 0.025)).toBe(Infinity);
    });

    it('handles high withdrawal rate (runs out quickly)', () => {
      const result = calculateYearsLast(100000, 50000, 0.03, 0.02);
      expect(result).toBeLessThan(5);
    });
  });
});

describe('Mortgage Calculations', () => {
  describe('calculateMortgagePayment', () => {
    it('calculates monthly payment correctly', () => {
      // $300,000 mortgage at 6.5% for 30 years = $1,896.20/month
      const result = calculateMortgagePayment(300000, 0.065, 30);
      expect(result).toBeCloseTo(1896.20, 0);
    });

    it('returns 0 for zero principal', () => {
      expect(calculateMortgagePayment(0, 0.065, 30)).toBe(0);
    });

    it('returns 0 for zero term', () => {
      expect(calculateMortgagePayment(300000, 0.065, 0)).toBe(0);
    });

    it('handles zero interest rate', () => {
      // Simple division when rate = 0
      const result = calculateMortgagePayment(300000, 0, 30);
      expect(result).toBeCloseTo(300000 / (30 * 12), 2);
    });
  });
});

describe('Debt Payoff Calculations', () => {
  const testDebts = [
    { id: '1', name: 'Credit Card', balance: 5000, interestRate: 0.18, minimumPayment: 150 },
    { id: '2', name: 'Car Loan', balance: 15000, interestRate: 0.06, minimumPayment: 300 },
    { id: '3', name: 'Student Loan', balance: 25000, interestRate: 0.05, minimumPayment: 250 },
  ];

  describe('calculateDebtPayoff - Avalanche', () => {
    it('prioritizes highest interest rate first', () => {
      const result = calculateDebtPayoff(testDebts, 200, 'avalanche');
      // Credit card (18%) should be paid first
      const creditCardResult = result.results.find(r => r.debt.id === '1');
      const carLoanResult = result.results.find(r => r.debt.id === '2');
      expect(creditCardResult!.payoffMonths).toBeLessThan(carLoanResult!.payoffMonths);
    });

    it('returns total interest and months', () => {
      const result = calculateDebtPayoff(testDebts, 200, 'avalanche');
      expect(result.totalMonths).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
    });
  });

  describe('calculateDebtPayoff - Snowball', () => {
    it('prioritizes lowest balance first', () => {
      const result = calculateDebtPayoff(testDebts, 200, 'snowball');
      // Credit card ($5000) should be paid first (lowest balance)
      const creditCardResult = result.results.find(r => r.debt.id === '1');
      const carLoanResult = result.results.find(r => r.debt.id === '2');
      expect(creditCardResult!.payoffMonths).toBeLessThan(carLoanResult!.payoffMonths);
    });

    it('snowball usually has higher total interest than avalanche', () => {
      const avalanche = calculateDebtPayoff(testDebts, 200, 'avalanche');
      const snowball = calculateDebtPayoff(testDebts, 200, 'snowball');
      // In this case they might be similar since credit card is both highest rate and lowest balance
      expect(snowball.totalInterest).toBeGreaterThanOrEqual(avalanche.totalInterest * 0.99);
    });
  });

  describe('calculateDebtPayoff - Edge Cases', () => {
    it('handles empty debt array', () => {
      const result = calculateDebtPayoff([], 200, 'avalanche');
      expect(result.totalMonths).toBe(0);
      expect(result.totalInterest).toBe(0);
      expect(result.results).toHaveLength(0);
    });
  });
});

describe('72(t) SEPP Calculations', () => {
  describe('calculate72tSEPP', () => {
    it('returns all three IRS methods', () => {
      const results = calculate72tSEPP(500000, 50, 0.05);
      expect(results).toHaveLength(3);
      expect(results.map(r => r.method)).toEqual(['rmd', 'amortization', 'annuitization']);
    });

    it('RMD method produces reasonable withdrawal', () => {
      const results = calculate72tSEPP(500000, 50, 0.05);
      const rmd = results.find(r => r.method === 'rmd')!;
      // At age 50, life expectancy ~34.2, so RMD = 500000/34.2 ≈ $14,620
      expect(rmd.annualWithdrawal).toBeGreaterThan(10000);
      expect(rmd.annualWithdrawal).toBeLessThan(20000);
    });

    it('amortization produces higher withdrawal than RMD', () => {
      const results = calculate72tSEPP(500000, 50, 0.05);
      const rmd = results.find(r => r.method === 'rmd')!;
      const amort = results.find(r => r.method === 'amortization')!;
      expect(amort.annualWithdrawal).toBeGreaterThan(rmd.annualWithdrawal);
    });

    it('calculates correct end age (max of age+5 or 59.5)', () => {
      const resultsYoung = calculate72tSEPP(500000, 50, 0.05);
      expect(resultsYoung[0].endAge).toBe(59.5);

      const resultsOlder = calculate72tSEPP(500000, 56, 0.05);
      expect(resultsOlder[0].endAge).toBe(61); // 56 + 5 = 61 > 59.5
    });

    it('monthly is annual / 12', () => {
      const results = calculate72tSEPP(500000, 50, 0.05);
      results.forEach(r => {
        expect(r.monthlyWithdrawal).toBeCloseTo(r.annualWithdrawal / 12, 2);
      });
    });
  });
});

describe('Formatting Functions', () => {
  describe('formatCurrency', () => {
    it('formats positive numbers correctly', () => {
      expect(formatCurrency(1234567)).toBe('$1,234,567');
    });

    it('formats with decimals', () => {
      expect(formatCurrency(1234.56, 2)).toBe('$1,234.56');
    });

    it('handles zero', () => {
      expect(formatCurrency(0)).toBe('$0');
    });

    it('handles Infinity', () => {
      expect(formatCurrency(Infinity)).toBe('∞');
    });
  });

  describe('formatPercent', () => {
    it('formats decimal to percent', () => {
      expect(formatPercent(0.075)).toBe('7.5%');
    });

    it('handles zero', () => {
      expect(formatPercent(0)).toBe('0.0%');
    });

    it('handles Infinity', () => {
      expect(formatPercent(Infinity)).toBe('∞%');
    });
  });
});
