/**
 * Actuarial and Financial Engineering Validation Tests
 * These tests validate calculation accuracy against known benchmarks
 */

import { describe, it, expect } from 'vitest';
import {
  calculateFutureValue,
  calculateFutureValueAnnuity,
  calculateFutureValueGrowingAnnuity,
  calculateYearsLast,
  calculateMortgagePayment,
  calculateDebtPayoff,
  calculate72tSEPP,
  calculateRMD,
  RMD_LIFE_EXPECTANCY_TABLE,
  SINGLE_LIFE_EXPECTANCY_TABLE,
  generateAmortizationSchedule,
} from '@/lib/calculations';

describe('Actuarial Validation - Future Value', () => {
  describe('Standard FV formula: FV = PV × (1 + r)^n', () => {
    it('matches Excel/HP12C: $100,000 at 7% for 30 years', () => {
      // Excel: =FV(0.07,30,0,-100000) = $761,225.50
      const result = calculateFutureValue(100000, 0.07, 30);
      expect(result).toBeCloseTo(761225.50, 0);
    });

    it('matches Vanguard benchmark: $500,000 at 6% for 20 years', () => {
      // Standard compound interest
      const result = calculateFutureValue(500000, 0.06, 20);
      expect(result).toBeCloseTo(1603568, 0);
    });

    it('matches CFP exam problem: $1M at 5% for 10 years', () => {
      const result = calculateFutureValue(1000000, 0.05, 10);
      expect(result).toBeCloseTo(1628895, 0);
    });
  });

  describe('Annuity FV formula: FV = PMT × [(1+r)^n - 1] / r (Ordinary Annuity)', () => {
    it('matches ordinary annuity formula: $20,000/yr at 7% for 35 years', () => {
      // Ordinary annuity (payments at END of period)
      // FV = 20000 * ((1.07^35 - 1) / 0.07) = $2,764,737.57
      const result = calculateFutureValueAnnuity(20000, 0.07, 35);
      const expected = 20000 * (Math.pow(1.07, 35) - 1) / 0.07;
      expect(result).toBeCloseTo(expected, 0);
    });

    it('matches common 401k scenario: $23,000/yr at 7% for 30 years', () => {
      // Max 401k contribution over 30 years (ordinary annuity)
      const result = calculateFutureValueAnnuity(23000, 0.07, 30);
      const expected = 23000 * (Math.pow(1.07, 30) - 1) / 0.07;
      expect(result).toBeCloseTo(expected, 0);
    });
  });

  describe('Growing Annuity FV validation', () => {
    it('payment grows at 3%, earns 7% for 30 years', () => {
      // FV of growing annuity = PMT × [(1+r)^n - (1+g)^n] / (r - g)
      const pmt = 10000;
      const r = 0.07;
      const g = 0.03;
      const n = 30;
      const expected = pmt * (Math.pow(1 + r, n) - Math.pow(1 + g, n)) / (r - g);
      const result = calculateFutureValueGrowingAnnuity(pmt, r, n, g);
      expect(result).toBeCloseTo(expected, 0);
    });
  });
});

describe('Actuarial Validation - Retirement Sustainability', () => {
  describe('4% Rule Validation (Bengen Study)', () => {
    it('$1M portfolio, 4% withdrawal should last 30+ years at 5% return', () => {
      // Classic 4% rule with 5% nominal return, 2.5% inflation
      const result = calculateYearsLast(1000000, 40000, 0.05, 0.025);
      expect(result).toBeGreaterThanOrEqual(30);
    });

    it('$1M portfolio, 5% withdrawal - higher risk of depletion', () => {
      const result = calculateYearsLast(1000000, 50000, 0.05, 0.025);
      expect(result).toBeLessThan(35);
      expect(result).toBeGreaterThan(20);
    });

    it('$1M portfolio, 3% withdrawal - very sustainable', () => {
      const result = calculateYearsLast(1000000, 30000, 0.06, 0.025);
      expect(result).toBe(Infinity); // Should never run out
    });
  });

  describe('Edge cases - market crash scenarios', () => {
    it('zero returns with inflation - portfolio depletes faster', () => {
      const result = calculateYearsLast(1000000, 50000, 0.00, 0.03);
      expect(result).toBeLessThan(20);
    });

    it('negative returns (-2%) - rapid depletion', () => {
      const result = calculateYearsLast(1000000, 50000, -0.02, 0.03);
      expect(result).toBeLessThan(15);
    });
  });
});

describe('Actuarial Validation - RMD Tables (IRS 2024)', () => {
  describe('Uniform Lifetime Table Accuracy', () => {
    it('age 73: life expectancy = 26.5 years', () => {
      expect(RMD_LIFE_EXPECTANCY_TABLE[73]).toBe(26.5);
    });

    it('age 75: life expectancy = 24.6 years', () => {
      expect(RMD_LIFE_EXPECTANCY_TABLE[75]).toBe(24.6);
    });

    it('age 80: life expectancy = 20.2 years', () => {
      expect(RMD_LIFE_EXPECTANCY_TABLE[80]).toBe(20.2);
    });

    it('age 90: life expectancy = 12.2 years', () => {
      expect(RMD_LIFE_EXPECTANCY_TABLE[90]).toBe(12.2);
    });
  });

  describe('RMD Calculation Accuracy', () => {
    it('$1M at age 73: RMD = $37,736 (1M / 26.5)', () => {
      const rmd = calculateRMD(73, 1000000, 73);
      expect(rmd).toBeCloseTo(1000000 / 26.5, 0);
      expect(rmd).toBeCloseTo(37736, 0);
    });

    it('$500K at age 80: RMD = $24,752 (500K / 20.2)', () => {
      const rmd = calculateRMD(80, 500000, 73);
      expect(rmd).toBeCloseTo(500000 / 20.2, 0);
    });

    it('no RMD before RMD start age', () => {
      expect(calculateRMD(72, 1000000, 73)).toBe(0);
      expect(calculateRMD(70, 1000000, 73)).toBe(0);
    });
  });
});

describe('Actuarial Validation - Mortgage Calculations', () => {
  describe('Standard mortgage payment formula', () => {
    it('$400,000 at 7% for 30 years = $2,661.21/month', () => {
      // Bankrate, Zillow, all major calculators agree
      const payment = calculateMortgagePayment(400000, 0.07, 30);
      expect(payment).toBeCloseTo(2661.21, 0);
    });

    it('$300,000 at 6% for 15 years = $2,531.57/month', () => {
      const payment = calculateMortgagePayment(300000, 0.06, 15);
      expect(payment).toBeCloseTo(2531.57, 0);
    });

    it('$250,000 at 5.5% for 30 years = $1,419.47/month', () => {
      const payment = calculateMortgagePayment(250000, 0.055, 30);
      expect(payment).toBeCloseTo(1419.47, 0);
    });
  });

  describe('Amortization schedule validation', () => {
    it('total interest paid matches standard amortization', () => {
      const schedule = generateAmortizationSchedule(300000, 0.065, 30, 0);
      const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
      // Expected total interest on $300K at 6.5% for 30 years ≈ $382,633
      expect(totalInterest).toBeCloseTo(382632, -2); // Within $100
    });

    it('extra payments reduce total interest', () => {
      const noExtra = generateAmortizationSchedule(300000, 0.065, 30, 0);
      const withExtra = generateAmortizationSchedule(300000, 0.065, 30, 200);
      
      const interestNoExtra = noExtra.reduce((sum, row) => sum + row.interest, 0);
      const interestWithExtra = withExtra.reduce((sum, row) => sum + row.interest, 0);
      
      expect(interestWithExtra).toBeLessThan(interestNoExtra);
      expect(withExtra.length).toBeLessThan(noExtra.length);
    });
  });
});

describe('Actuarial Validation - 72(t) SEPP', () => {
  describe('IRS-approved methods', () => {
    it('RMD method: $500K at age 50 = ~$14,620/year', () => {
      // Life expectancy at 50 = 34.2, so RMD = 500000/34.2
      const results = calculate72tSEPP(500000, 50, 0.05);
      const rmd = results.find(r => r.method === 'rmd')!;
      expect(rmd.annualWithdrawal).toBeCloseTo(500000 / 34.2, 0);
    });

    it('amortization method produces higher withdrawal than RMD', () => {
      const results = calculate72tSEPP(500000, 55, 0.04);
      const rmd = results.find(r => r.method === 'rmd')!;
      const amort = results.find(r => r.method === 'amortization')!;
      expect(amort.annualWithdrawal).toBeGreaterThan(rmd.annualWithdrawal);
    });

    it('5-year or age 59.5 rule applied correctly', () => {
      // At age 50, must continue until 59.5
      const results50 = calculate72tSEPP(500000, 50, 0.05);
      expect(results50[0].endAge).toBe(59.5);
      
      // At age 56, must continue for 5 years (until 61)
      const results56 = calculate72tSEPP(500000, 56, 0.05);
      expect(results56[0].endAge).toBe(61);
    });
  });
});

describe('Actuarial Validation - Debt Payoff', () => {
  const typicalDebts = [
    { id: '1', name: 'Credit Card', balance: 10000, interestRate: 0.21, minimumPayment: 250 },
    { id: '2', name: 'Auto Loan', balance: 20000, interestRate: 0.07, minimumPayment: 400 },
    { id: '3', name: 'Student Loan', balance: 30000, interestRate: 0.05, minimumPayment: 300 },
  ];

  describe('Avalanche method (mathematically optimal)', () => {
    it('always results in less total interest than snowball', () => {
      const avalanche = calculateDebtPayoff(typicalDebts, 300, 'avalanche');
      const snowball = calculateDebtPayoff(typicalDebts, 300, 'snowball');
      
      expect(avalanche.totalInterest).toBeLessThanOrEqual(snowball.totalInterest);
    });

    it('high-interest debt paid off first', () => {
      const result = calculateDebtPayoff(typicalDebts, 300, 'avalanche');
      const creditCard = result.results.find(r => r.debt.id === '1')!;
      const studentLoan = result.results.find(r => r.debt.id === '3')!;
      expect(creditCard.payoffMonths).toBeLessThan(studentLoan.payoffMonths);
    });
  });

  describe('Snowball method', () => {
    it('lowest balance paid first (for motivation)', () => {
      const debts = [
        { id: '1', name: 'Small', balance: 1000, interestRate: 0.05, minimumPayment: 50 },
        { id: '2', name: 'Large', balance: 20000, interestRate: 0.20, minimumPayment: 400 },
      ];
      const result = calculateDebtPayoff(debts, 200, 'snowball');
      const small = result.results.find(r => r.debt.id === '1')!;
      const large = result.results.find(r => r.debt.id === '2')!;
      expect(small.payoffMonths).toBeLessThan(large.payoffMonths);
    });
  });
});

describe('Actuarial Validation - Single Life Expectancy Table', () => {
  describe('IRS 2024 Single Life Table for Inherited IRAs', () => {
    it('age 50: 36.2 years', () => {
      expect(SINGLE_LIFE_EXPECTANCY_TABLE[50]).toBe(36.2);
    });

    it('age 60: 27.1 years', () => {
      expect(SINGLE_LIFE_EXPECTANCY_TABLE[60]).toBe(27.1);
    });

    it('age 70: 18.8 years', () => {
      expect(SINGLE_LIFE_EXPECTANCY_TABLE[70]).toBe(18.8);
    });

    it('age 80: 11.2 years', () => {
      expect(SINGLE_LIFE_EXPECTANCY_TABLE[80]).toBe(11.2);
    });
  });
});

describe('Edge Case Validation', () => {
  describe('Extreme inputs', () => {
    it('very large portfolio ($100M) calculations remain accurate', () => {
      const fv = calculateFutureValue(100000000, 0.07, 20);
      expect(fv).toBeCloseTo(386968446, -3); // Within $1000
    });

    it('very small contributions still compound correctly', () => {
      const fv = calculateFutureValueAnnuity(100, 0.05, 40);
      expect(fv).toBeGreaterThan(12000);
    });

    it('zero inflation scenario', () => {
      const years = calculateYearsLast(1000000, 50000, 0.05, 0);
      expect(years).toBeGreaterThan(30); // Should last longer without inflation
    });

    it('high inflation scenario (8%)', () => {
      const years = calculateYearsLast(1000000, 50000, 0.05, 0.08);
      expect(years).toBeLessThan(20); // Depletes faster
    });
  });

  describe('Longevity risk (living to 100)', () => {
    it('$2M portfolio at 3% withdrawal lasts 70+ years with inflation adjustment', () => {
      const withdrawal = 60000; // 3% of $2M
      const years = calculateYearsLast(2000000, withdrawal, 0.05, 0.025);
      // With inflation-adjusted withdrawals, even 3% SWR eventually depletes
      // This is actuarially correct - withdrawals grow faster than portfolio
      expect(years).toBeGreaterThan(70);
    });

    it('$1M at 4% may run short for 40-year retirement', () => {
      const years = calculateYearsLast(1000000, 40000, 0.04, 0.03);
      // With 4% return and 3% inflation, 4% withdrawal is borderline
      expect(years).toBeLessThan(Infinity);
    });
  });
});
