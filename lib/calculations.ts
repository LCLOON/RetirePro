// RetirePro Calculations - Web Version
import type { 
  RetirementData, 
  ScenarioResults, 
  ScenarioResult,
  MonteCarloResults, 
  YearProjection,
  NetWorthData,
  BudgetData,
} from './types';

/**
 * Calculate future value of a present sum
 */
export function calculateFutureValue(pv: number, rate: number, years: number): number {
  if (years <= 0 || pv <= 0) return pv;
  return pv * Math.pow(1 + rate, years);
}

/**
 * Calculate future value of regular payments (annuity)
 */
export function calculateFutureValueAnnuity(payment: number, rate: number, years: number): number {
  if (years <= 0 || payment <= 0) return 0;
  if (rate === 0) return payment * years;
  return payment * (Math.pow(1 + rate, years) - 1) / rate;
}

/**
 * Calculate future value of growing annuity
 */
export function calculateFutureValueGrowingAnnuity(
  payment: number,
  rate: number,
  years: number,
  growthRate: number
): number {
  if (years <= 0 || payment <= 0) return 0;
  
  if (Math.abs(rate - growthRate) < 0.0001) {
    return payment * years * Math.pow(1 + rate, years - 1);
  }
  
  return payment * (Math.pow(1 + rate, years) - Math.pow(1 + growthRate, years)) / (rate - growthRate);
}

/**
 * Calculate how many years savings will last
 */
export function calculateYearsLast(
  balance: number,
  annualWithdrawal: number,
  returnRate: number,
  inflationRate: number
): number {
  if (balance <= 0) return 0;
  if (annualWithdrawal <= 0) return Infinity;
  
  let currentBalance = balance;
  let currentWithdrawal = annualWithdrawal;
  let years = 0;
  const maxYears = 100;
  
  while (currentBalance > 0 && years < maxYears) {
    currentBalance = currentBalance * (1 + returnRate) - currentWithdrawal;
    currentWithdrawal *= (1 + inflationRate);
    years++;
    
    if (currentBalance <= 0) {
      return years - 1 + (currentBalance + currentWithdrawal) / currentWithdrawal;
    }
  }
  
  return years >= maxYears ? Infinity : years;
}

/**
 * Generate year-by-year projection for a scenario
 */
function generateYearByYear(
  data: RetirementData,
  returnAdjustment: number = 0
): YearProjection[] {
  const projections: YearProjection[] = [];
  const yearsToRetirement = data.retirementAge - data.currentAge;
  const yearsInRetirement = data.lifeExpectancy - data.retirementAge;
  const currentYear = new Date().getFullYear();
  
  // Current total savings
  let balance = data.currentSavingsPreTax + data.currentSavingsRoth + data.currentSavingsAfterTax;
  let contribution = data.annualContributionPreTax + data.annualContributionRoth + 
                     data.annualContributionAfterTax + data.employerMatch;
  
  // Pre-retirement accumulation phase
  for (let i = 0; i <= yearsToRetirement; i++) {
    const age = data.currentAge + i;
    const year = currentYear + i;
    const growth = balance * (data.preRetirementReturn + returnAdjustment);
    
    projections.push({
      age,
      year,
      balance,
      contribution: i < yearsToRetirement ? contribution : 0,
      growth,
      withdrawal: 0,
      income: 0,
    });
    
    if (i < yearsToRetirement) {
      balance += growth + contribution;
      contribution *= (1 + data.contributionGrowthRate);
    }
  }
  
  // Post-retirement decumulation phase
  let withdrawal = data.retirementExpenses;
  
  for (let i = 1; i <= yearsInRetirement; i++) {
    const age = data.retirementAge + i;
    const year = currentYear + yearsToRetirement + i;
    
    const growth = balance * (data.postRetirementReturn + returnAdjustment);
    
    // Other income sources
    let income = 0;
    if (data.includeSocialSecurity && age >= data.socialSecurityStartAge) {
      income += data.socialSecurityBenefit;
    }
    // Pension income
    if (data.hasPension && age >= data.pensionStartAge) {
      income += data.pensionIncome;
    }
    // Additional income sources (rental, part-time, etc.)
    data.additionalIncome.forEach(source => {
      if (age >= source.startAge && age <= source.endAge) {
        income += source.amount;
      }
    });
    
    const netWithdrawal = Math.max(0, withdrawal - income);
    balance = balance + growth - netWithdrawal;
    
    projections.push({
      age,
      year,
      balance: Math.max(0, balance),
      contribution: 0,
      growth,
      withdrawal: netWithdrawal,
      income,
    });
    
    if (balance <= 0) break;
    withdrawal *= (1 + data.expenseGrowthRate);
  }
  
  return projections;
}

/**
 * Calculate scenario results
 */
export function calculateScenarioResults(data: RetirementData): ScenarioResults {
  const expectedProjections = generateYearByYear(data, 0);
  const optimisticProjections = generateYearByYear(data, 0.02);
  const pessimisticProjections = generateYearByYear(data, -0.02);
  
  const retirementIndex = data.retirementAge - data.currentAge;
  
  const createResult = (projections: YearProjection[]): ScenarioResult => {
    const atRetirement = projections[retirementIndex]?.balance || 0;
    const atEnd = projections[projections.length - 1]?.balance || 0;
    const yearsLast = calculateYearsLast(
      atRetirement,
      data.retirementExpenses - (data.includeSocialSecurity ? data.socialSecurityBenefit : 0) - data.pensionIncome,
      data.postRetirementReturn,
      data.expenseGrowthRate
    );
    
    return { atRetirement, atEnd, yearsLast, yearByYear: projections };
  };
  
  return {
    expected: createResult(expectedProjections),
    optimistic: createResult(optimisticProjections),
    pessimistic: createResult(pessimisticProjections),
  };
}

/**
 * Generate random normal value using Box-Muller transform
 */
function randomNormal(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + stdDev * z;
}

/**
 * Perform Monte Carlo simulation
 */
export function performMonteCarloProjection(data: RetirementData): MonteCarloResults {
  const numSimulations = data.monteCarloRuns;
  const yearsToRetirement = data.retirementAge - data.currentAge;
  const yearsInRetirement = data.lifeExpectancy - data.retirementAge;
  
  const finalBalances: number[] = [];
  let successCount = 0;
  
  for (let sim = 0; sim < numSimulations; sim++) {
    let balance = data.currentSavingsPreTax + data.currentSavingsRoth + data.currentSavingsAfterTax;
    let contribution = data.annualContributionPreTax + data.annualContributionRoth + 
                       data.annualContributionAfterTax + data.employerMatch;
    
    // Pre-retirement
    for (let year = 0; year < yearsToRetirement; year++) {
      const annualReturn = randomNormal(data.preRetirementReturn, data.standardDeviation);
      balance = balance * (1 + annualReturn) + contribution;
      contribution *= (1 + data.contributionGrowthRate);
    }
    
    // Post-retirement
    let withdrawal = data.retirementExpenses;
    let runOutOfMoney = false;
    
    for (let year = 0; year < yearsInRetirement; year++) {
      const age = data.retirementAge + year;
      const annualReturn = randomNormal(data.postRetirementReturn, data.standardDeviation * 0.7);
      
      let income = 0;
      if (data.includeSocialSecurity && age >= data.socialSecurityStartAge) {
        income += data.socialSecurityBenefit;
      }
      income += data.pensionIncome;
      
      const netWithdrawal = Math.max(0, withdrawal - income);
      balance = balance * (1 + annualReturn) - netWithdrawal;
      
      if (balance <= 0) {
        runOutOfMoney = true;
        balance = 0;
        break;
      }
      
      withdrawal *= (1 + data.expenseGrowthRate);
    }
    
    finalBalances.push(balance);
    if (!runOutOfMoney) successCount++;
  }
  
  // Sort for percentile calculations
  finalBalances.sort((a, b) => a - b);
  
  const getPercentile = (arr: number[], p: number) => {
    const index = Math.floor(arr.length * p);
    return arr[Math.min(index, arr.length - 1)];
  };
  
  return {
    successRate: (successCount / numSimulations) * 100,
    median: getPercentile(finalBalances, 0.5),
    percentile10: getPercentile(finalBalances, 0.1),
    percentile25: getPercentile(finalBalances, 0.25),
    percentile75: getPercentile(finalBalances, 0.75),
    percentile90: getPercentile(finalBalances, 0.9),
    mean: finalBalances.reduce((a, b) => a + b, 0) / finalBalances.length,
    min: finalBalances[0],
    max: finalBalances[finalBalances.length - 1],
  };
}

/**
 * Format currency with proper formatting
 */
export function formatCurrency(value: number, decimals: number = 0): string {
  if (!isFinite(value)) return '∞';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  if (!isFinite(value)) return '∞%';
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Calculate net worth summary
 */
export function calculateNetWorthSummary(data: NetWorthData) {
  const totalAssets = Object.values(data.assets).reduce((sum, val) => sum + val, 0);
  const totalLiabilities = Object.values(data.liabilities).reduce((sum, val) => sum + val, 0);
  const netWorth = totalAssets - totalLiabilities;
  
  return { totalAssets, totalLiabilities, netWorth };
}

/**
 * Calculate budget summary
 */
export function calculateBudgetSummary(data: BudgetData) {
  const totalIncome = Object.values(data.income).reduce((sum, val) => sum + val, 0);
  const totalExpenses = Object.values(data.expenses).reduce((sum, val) => sum + val, 0);
  const netIncome = totalIncome - totalExpenses;
  
  return { totalIncome, totalExpenses, netIncome };
}

/**
 * Calculate mortgage payment
 */
export function calculateMortgagePayment(
  principal: number,
  annualRate: number,
  termYears: number
): number {
  if (principal <= 0 || termYears <= 0) return 0;
  if (annualRate <= 0) return principal / (termYears * 12);
  
  const monthlyRate = annualRate / 12;
  const numPayments = termYears * 12;
  
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  return payment;
}

/**
 * Amortization schedule row type
 */
export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  endingBalance: number;
}

/**
 * Generate mortgage amortization schedule
 */
export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  termYears: number,
  extraPayment: number = 0
): AmortizationRow[] {
  const monthlyPayment = calculateMortgagePayment(principal, annualRate, termYears);
  const monthlyRate = annualRate / 12;
  
  const schedule: AmortizationRow[] = [];
  let balance = principal;
  let month = 0;
  
  while (balance > 0 && month < termYears * 12 + 1) {
    month++;
    const interest = balance * monthlyRate;
    const basePrincipal = monthlyPayment - interest;
    const totalPrincipal = Math.min(basePrincipal + extraPayment, balance);
    balance -= totalPrincipal;
    
    schedule.push({
      month,
      payment: monthlyPayment + Math.min(extraPayment, balance + totalPrincipal - basePrincipal),
      principal: totalPrincipal,
      interest,
      endingBalance: Math.max(0, balance),
    });
    
    if (balance <= 0) break;
  }
  
  return schedule;
}
