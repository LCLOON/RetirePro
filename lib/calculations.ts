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

// IRS Uniform Lifetime Table (2024) for RMD calculations
const RMD_LIFE_EXPECTANCY_TABLE: Record<number, number> = {
  72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1, 80: 20.2,
  81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9,
  90: 12.2, 91: 11.5, 92: 10.8, 93: 10.1, 94: 9.5, 95: 8.9, 96: 8.4, 97: 7.8, 98: 7.3, 99: 6.8,
  100: 6.4, 101: 6.0, 102: 5.6, 103: 5.2, 104: 4.9, 105: 4.6, 106: 4.3, 107: 4.1, 108: 3.9,
  109: 3.7, 110: 3.5, 111: 3.4, 112: 3.3, 113: 3.1, 114: 3.0, 115: 2.9, 116: 2.8, 117: 2.7,
  118: 2.5, 119: 2.3, 120: 2.0
};

// Calculate RMD for a given age and pre-tax balance
function calculateRMD(age: number, preTaxBalance: number, rmdStartAge: number): number {
  if (age < rmdStartAge || preTaxBalance <= 0) return 0;
  const lifeExpectancy = RMD_LIFE_EXPECTANCY_TABLE[age] || 2.0;
  return preTaxBalance / lifeExpectancy;
}

// IRS Single Life Expectancy Table for Inherited IRAs (2024)
const SINGLE_LIFE_EXPECTANCY_TABLE: Record<number, number> = {
  0: 84.6, 1: 83.7, 2: 82.7, 3: 81.7, 4: 80.7, 5: 79.8, 6: 78.8, 7: 77.8, 8: 76.8, 9: 75.8,
  10: 74.8, 11: 73.8, 12: 72.8, 13: 71.9, 14: 70.9, 15: 69.9, 16: 68.9, 17: 67.9, 18: 66.9, 19: 66.0,
  20: 65.0, 21: 64.0, 22: 63.0, 23: 62.1, 24: 61.1, 25: 60.1, 26: 59.2, 27: 58.2, 28: 57.2, 29: 56.2,
  30: 55.3, 31: 54.3, 32: 53.4, 33: 52.4, 34: 51.4, 35: 50.5, 36: 49.5, 37: 48.5, 38: 47.6, 39: 46.6,
  40: 45.7, 41: 44.7, 42: 43.7, 43: 42.8, 44: 41.8, 45: 40.9, 46: 39.9, 47: 39.0, 48: 38.0, 49: 37.1,
  50: 36.2, 51: 35.2, 52: 34.3, 53: 33.4, 54: 32.5, 55: 31.6, 56: 30.6, 57: 29.8, 58: 28.9, 59: 28.0,
  60: 27.1, 61: 26.2, 62: 25.4, 63: 24.5, 64: 23.7, 65: 22.9, 66: 22.0, 67: 21.2, 68: 20.4, 69: 19.6,
  70: 18.8, 71: 18.0, 72: 17.2, 73: 16.4, 74: 15.6, 75: 14.8, 76: 14.1, 77: 13.3, 78: 12.6, 79: 11.9,
  80: 11.2, 81: 10.5, 82: 9.9, 83: 9.3, 84: 8.6, 85: 8.1, 86: 7.5, 87: 7.0, 88: 6.5, 89: 6.0,
  90: 5.6, 91: 5.2, 92: 4.8, 93: 4.4, 94: 4.1, 95: 3.8, 96: 3.5, 97: 3.2, 98: 3.0, 99: 2.8,
  100: 2.5, 101: 2.3, 102: 2.1, 103: 1.9, 104: 1.7, 105: 1.5, 106: 1.4, 107: 1.2, 108: 1.1, 109: 1.0,
  110: 0.9, 111: 0.8, 112: 0.7, 113: 0.6, 114: 0.5, 115: 0.5, 116: 0.4, 117: 0.4, 118: 0.3, 119: 0.3, 120: 0.2
};

// Calculate Inherited IRA withdrawal (10-year rule with multiple strategies)
// Supports: spread_evenly, year_10_lump_sum, back_loaded, annual_rmd
function calculateInheritedIRAWithdrawal(
  inheritedBalance: number,
  currentYear: number,
  inheritedYear: number,
  withdrawalStrategy: 'spread_evenly' | 'year_10_lump_sum' | 'back_loaded' | 'annual_rmd' = 'annual_rmd',
  beneficiaryAge?: number
): number {
  if (inheritedBalance <= 0) return 0;
  
  const yearsSinceInheritance = currentYear - inheritedYear;
  const yearsRemaining = 10 - yearsSinceInheritance;
  
  // Account must be emptied by year 10
  if (yearsRemaining <= 0) return inheritedBalance;
  
  switch (withdrawalStrategy) {
    case 'annual_rmd':
      // Annual RMDs based on Single Life Expectancy Table
      // This applies when original owner died AFTER their RBD (already taking RMDs)
      // Use beneficiary's age to determine life expectancy factor
      if (beneficiaryAge !== undefined) {
        // First year: use beneficiary's age at inheritance + years since
        const currentBeneficiaryAge = beneficiaryAge;
        const lifeExpectancy = SINGLE_LIFE_EXPECTANCY_TABLE[currentBeneficiaryAge] || 10;
        // Reduce by 1 each year after first year
        const adjustedLifeExpectancy = Math.max(1, lifeExpectancy - yearsSinceInheritance);
        
        // In year 10, take whatever remains
        if (yearsRemaining === 1) {
          return inheritedBalance;
        }
        
        return inheritedBalance / adjustedLifeExpectancy;
      }
      // Fall back to spread evenly if no age provided
      return inheritedBalance / yearsRemaining;
      
    case 'year_10_lump_sum':
      // Minimum RMDs: No withdrawal until year 10, then take everything
      // Under SECURE Act, non-spouse beneficiaries have no annual RMD if owner died BEFORE RBD
      if (yearsRemaining === 1) {
        return inheritedBalance; // Empty it in the final year
      }
      return 0; // No RMD required until year 10
      
    case 'back_loaded':
      // Take smaller amounts early, larger amounts later
      // Years 1-7: no withdrawal, Years 8-10: spread the rest
      if (yearsRemaining > 3) {
        return 0;
      }
      return inheritedBalance / yearsRemaining;
      
    case 'spread_evenly':
    default:
      // Spread evenly over remaining years
      return inheritedBalance / yearsRemaining;
  }
}

/**
 * Generate year-by-year projection for a scenario
 * This is the MAIN calculation engine used by Results, Charts, Analysis tabs
 * SYNCHRONIZED with DetailsTab.tsx calculations
 */
function generateYearByYear(
  data: RetirementData,
  returnAdjustment: number = 0
): YearProjection[] {
  const projections: YearProjection[] = [];
  const currentYear = new Date().getFullYear();
  
  // Track balances by account type for RMD calculations
  let preTaxBalance = data.currentSavingsPreTax;
  let rothBalance = data.currentSavingsRoth;
  let afterTaxBalance = data.currentSavingsAfterTax + data.currentHSA;
  let inheritedIRABalance = data.hasInheritedIRA ? data.inheritedIRA.balance : 0;
  
  // Dividend portfolio tracking
  let dividendPortfolioValue = data.hasDividendPortfolio && data.dividendPortfolio.includeInProjections 
    ? data.dividendPortfolio.currentValue : 0;
  let annualDividendIncome = data.hasDividendPortfolio && data.dividendPortfolio.includeInProjections 
    ? data.dividendPortfolio.annualDividendIncome : 0;
  const dividendGrowthRate = data.dividendPortfolio?.dividendGrowthRate || 0.05;
  const reinvestDividends = data.dividendPortfolio?.reinvestDividends ?? true;
  
  // Cryptocurrency tracking
  let cryptoValue = data.hasCryptoHoldings && data.cryptoHoldings.includeInProjections 
    ? data.cryptoHoldings.currentValue : 0;
  const cryptoGrowthRate = data.cryptoHoldings?.expectedGrowthRate || 0.10;
  const cryptoWithdrawalStartAge = data.cryptoHoldings?.withdrawalStartAge || data.retirementAge;
  const cryptoWithdrawalPercent = data.cryptoHoldings?.withdrawalPercent || 0.04;
  
  // Track contributions by type
  let preTaxContribution = data.annualContributionPreTax + data.employerMatch;
  let rothContribution = data.annualContributionRoth;
  let afterTaxContribution = data.annualContributionAfterTax + data.annualHSAContribution;
  
  // COLA rate for Social Security
  const ssCOLA = data.inflationRate || 0.025;
  
  // RMD settings
  const rmdStartAge = data.rmdStartAge || 73;
  const includeRMD = data.includeRMD !== false;
  
  // Base expenses for inflation
  const baseExpenses = data.retirementExpenses;
  const baseHealthcareCost = data.annualHealthcareCost;
  
  for (let age = data.currentAge; age <= data.lifeExpectancy; age++) {
    const isRetired = age >= data.retirementAge;
    const yearReturn = (isRetired ? data.postRetirementReturn : data.preRetirementReturn) + returnAdjustment;
    const year = currentYear + (age - data.currentAge);
    
    // Store start balances
    const startPreTax = preTaxBalance;
    const startRoth = rothBalance;
    const startAfterTax = afterTaxBalance;
    const startInherited = inheritedIRABalance;
    const startDividend = dividendPortfolioValue;
    const startCrypto = cryptoValue;
    const startBalance = startPreTax + startRoth + startAfterTax + startInherited + startDividend + startCrypto;
    
    // Calculate RMDs
    let rmd401k = 0;
    let rmdInherited = 0;
    
    if (includeRMD && age >= rmdStartAge) {
      rmd401k = calculateRMD(age, startPreTax, rmdStartAge);
    }
    
    if (data.hasInheritedIRA && startInherited > 0) {
      rmdInherited = calculateInheritedIRAWithdrawal(
        startInherited, 
        year, 
        data.inheritedIRA.inheritedYear,
        data.inheritedIRA.withdrawalStrategy || 'annual_rmd',
        age // Pass current age for life expectancy calculation
      );
    }
    
    const totalRMD = rmd401k + rmdInherited;
    
    // Social Security with COLA
    const yearsSinceYourSS = Math.max(0, age - data.socialSecurityStartAge);
    const yearsSinceSpouseSS = Math.max(0, age - data.spouseSocialSecurityStartAge);
    
    let ssIncome = 0;
    if (data.includeSocialSecurity && age >= data.socialSecurityStartAge) {
      ssIncome = data.socialSecurityBenefit * Math.pow(1 + ssCOLA, yearsSinceYourSS);
    }
    
    let spouseSsIncome = 0;
    if (data.hasSpouse && age >= data.spouseSocialSecurityStartAge) {
      spouseSsIncome = data.spouseSocialSecurityBenefit * Math.pow(1 + ssCOLA, yearsSinceSpouseSS);
    }
    
    // Pension with COLA
    let pensionIncome = 0;
    if (data.hasPension && age >= data.pensionStartAge) {
      const yearsSincePension = age - data.pensionStartAge;
      pensionIncome = data.pensionIncome * Math.pow(1.015, yearsSincePension);
    }
    
    // Additional income sources
    let additionalIncome = 0;
    data.additionalIncome.forEach(source => {
      if (age >= source.startAge && age <= source.endAge) {
        if (source.adjustForInflation) {
          const yearsFromStart = age - source.startAge;
          additionalIncome += source.amount * Math.pow(1 + data.inflationRate, yearsFromStart);
        } else {
          additionalIncome += source.amount;
        }
      }
    });
    
    // Dividend income (in retirement, dividends become income)
    let dividendIncome = 0;
    if (startDividend > 0) {
      if (isRetired && !reinvestDividends) {
        // Dividends as income in retirement
        dividendIncome = annualDividendIncome;
      } else if (!isRetired && reinvestDividends) {
        // Reinvesting: dividends grow the portfolio
        dividendPortfolioValue = startDividend + startDividend * yearReturn + annualDividendIncome;
        annualDividendIncome *= (1 + dividendGrowthRate);
      } else {
        // Retired but was reinvesting - now take dividends as income
        dividendIncome = annualDividendIncome;
        dividendPortfolioValue = startDividend + startDividend * yearReturn;
        annualDividendIncome *= (1 + dividendGrowthRate);
      }
    }
    
    // Cryptocurrency income (withdrawal from crypto portfolio)
    let cryptoIncome = 0;
    if (startCrypto > 0 && age >= cryptoWithdrawalStartAge) {
      cryptoIncome = startCrypto * cryptoWithdrawalPercent;
      cryptoValue = startCrypto * (1 + cryptoGrowthRate) - cryptoIncome;
    } else if (startCrypto > 0) {
      // Pre-withdrawal: just grow the crypto
      cryptoValue = startCrypto * (1 + cryptoGrowthRate);
    }
    
    // Total income (RMDs count as income - they're mandatory withdrawals)
    const totalIncome = ssIncome + spouseSsIncome + pensionIncome + additionalIncome + dividendIncome + cryptoIncome + totalRMD;
    
    // Calculate expenses
    let expenses = 0;
    if (isRetired) {
      const yearsInRetirement = age - data.retirementAge;
      expenses = baseExpenses * Math.pow(1 + data.expenseGrowthRate, yearsInRetirement);
      
      // Healthcare costs
      if (age >= data.medicareStartAge) {
        const yearsSinceMedicare = age - data.medicareStartAge;
        expenses += (data.medicarePremium + data.medicareSupplementPremium) * 12 *
                    Math.pow(1 + data.healthcareInflationRate, yearsSinceMedicare);
      } else {
        expenses += baseHealthcareCost * Math.pow(1 + data.healthcareInflationRate, yearsInRetirement);
      }
    }
    
    // Contributions (pre-retirement only)
    const yearPreTaxContrib = isRetired ? 0 : preTaxContribution;
    const yearRothContrib = isRetired ? 0 : rothContribution;
    const yearAfterTaxContrib = isRetired ? 0 : afterTaxContribution;
    const yearContribution = yearPreTaxContrib + yearRothContrib + yearAfterTaxContrib;
    
    // Growth on each account
    const preTaxGrowth = startPreTax * yearReturn;
    const rothGrowth = startRoth * yearReturn;
    const afterTaxGrowth = startAfterTax * yearReturn;
    const inheritedIRAReturn = data.inheritedIRA?.expectedGrowthRate ?? yearReturn;
    const inheritedGrowth = startInherited * inheritedIRAReturn;
    const dividendGrowth = startDividend > 0 && !isRetired ? startDividend * yearReturn : 0;
    const cryptoGrowth = startCrypto > 0 ? startCrypto * cryptoGrowthRate : 0;
    const totalGrowth = preTaxGrowth + rothGrowth + afterTaxGrowth + inheritedGrowth + dividendGrowth + cryptoGrowth;
    
    // Additional withdrawal needed beyond RMDs and passive income
    const incomeWithoutPortfolio = ssIncome + spouseSsIncome + pensionIncome + additionalIncome + dividendIncome + cryptoIncome + totalRMD;
    const additionalWithdrawalNeeded = isRetired ? Math.max(0, expenses - incomeWithoutPortfolio) : 0;
    const totalWithdrawal = totalRMD + additionalWithdrawalNeeded;
    
    // Update account balances
    if (isRetired) {
      let remainingWithdrawal = additionalWithdrawalNeeded;
      
      // Pre-tax: apply RMD and additional withdrawal
      preTaxBalance = startPreTax + preTaxGrowth - rmd401k;
      if (remainingWithdrawal > 0 && preTaxBalance > 0) {
        const fromPreTax = Math.min(remainingWithdrawal, preTaxBalance);
        preTaxBalance -= fromPreTax;
        remainingWithdrawal -= fromPreTax;
      }
      
      // After-tax next
      afterTaxBalance = startAfterTax + afterTaxGrowth;
      if (remainingWithdrawal > 0 && afterTaxBalance > 0) {
        const fromAfterTax = Math.min(remainingWithdrawal, afterTaxBalance);
        afterTaxBalance -= fromAfterTax;
        remainingWithdrawal -= fromAfterTax;
      }
      
      // Roth last
      rothBalance = startRoth + rothGrowth;
      if (remainingWithdrawal > 0 && rothBalance > 0) {
        const fromRoth = Math.min(remainingWithdrawal, rothBalance);
        rothBalance -= fromRoth;
        remainingWithdrawal -= fromRoth;
      }
      
      // Inherited IRA
      inheritedIRABalance = Math.max(0, startInherited + inheritedGrowth - rmdInherited);
      
      // Dividend portfolio (growth handled above in income section)
      // Crypto (growth and withdrawal handled above in income section)
    } else {
      preTaxBalance = startPreTax + preTaxGrowth + yearPreTaxContrib;
      rothBalance = startRoth + rothGrowth + yearRothContrib;
      afterTaxBalance = startAfterTax + afterTaxGrowth + yearAfterTaxContrib;
      inheritedIRABalance = startInherited + inheritedGrowth;
      // Dividend and crypto handled above
    }
    
    // Ensure no negative balances
    preTaxBalance = Math.max(0, preTaxBalance);
    rothBalance = Math.max(0, rothBalance);
    afterTaxBalance = Math.max(0, afterTaxBalance);
    inheritedIRABalance = Math.max(0, inheritedIRABalance);
    dividendPortfolioValue = Math.max(0, dividendPortfolioValue);
    cryptoValue = Math.max(0, cryptoValue);
    
    const endBalance = preTaxBalance + rothBalance + afterTaxBalance + inheritedIRABalance + dividendPortfolioValue + cryptoValue;
    
    projections.push({
      age,
      year,
      balance: startBalance,
      contribution: yearContribution,
      growth: totalGrowth,
      withdrawal: totalWithdrawal,
      income: totalIncome,
    });
    
    // Grow contributions for next year
    if (!isRetired) {
      preTaxContribution *= (1 + data.contributionGrowthRate);
      rothContribution *= (1 + data.contributionGrowthRate);
      afterTaxContribution *= (1 + data.contributionGrowthRate);
    }
    
    if (endBalance <= 0) break;
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
 * SYNCHRONIZED with DetailsTab.tsx - includes RMDs, SS COLA, separate accounts
 */
export function performMonteCarloProjection(data: RetirementData): MonteCarloResults {
  const numSimulations = data.monteCarloRuns;
  const currentYear = new Date().getFullYear();
  
  // RMD and COLA settings
  const rmdStartAge = data.rmdStartAge || 73;
  const includeRMD = data.includeRMD !== false;
  const ssCOLA = data.inflationRate || 0.025;
  
  const finalBalances: number[] = [];
  let successCount = 0;
  
  for (let sim = 0; sim < numSimulations; sim++) {
    // Track account balances separately for RMD
    let preTaxBalance = data.currentSavingsPreTax;
    let rothBalance = data.currentSavingsRoth;
    let afterTaxBalance = data.currentSavingsAfterTax + data.currentHSA;
    let inheritedBalance = data.hasInheritedIRA ? data.inheritedIRA.balance : 0;
    
    // Dividend portfolio
    let dividendValue = data.hasDividendPortfolio && data.dividendPortfolio.includeInProjections 
      ? data.dividendPortfolio.currentValue : 0;
    let annualDividends = data.hasDividendPortfolio && data.dividendPortfolio.includeInProjections 
      ? data.dividendPortfolio.annualDividendIncome : 0;
    const divGrowthRate = data.dividendPortfolio?.dividendGrowthRate || 0.05;
    const reinvest = data.dividendPortfolio?.reinvestDividends ?? true;
    
    // Cryptocurrency (with its own volatility)
    let cryptoBalance = data.hasCryptoHoldings && data.cryptoHoldings.includeInProjections 
      ? data.cryptoHoldings.currentValue : 0;
    const cryptoGrowth = data.cryptoHoldings?.expectedGrowthRate || 0.10;
    const cryptoVol = data.cryptoHoldings?.volatility || 0.50;
    const cryptoStartAge = data.cryptoHoldings?.withdrawalStartAge || data.retirementAge;
    const cryptoWdRate = data.cryptoHoldings?.withdrawalPercent || 0.04;
    
    let preTaxContrib = data.annualContributionPreTax + data.employerMatch;
    let rothContrib = data.annualContributionRoth;
    let afterTaxContrib = data.annualContributionAfterTax + data.annualHSAContribution;
    
    let runOutOfMoney = false;
    
    // Run simulation year by year
    for (let age = data.currentAge; age <= data.lifeExpectancy; age++) {
      const isRetired = age >= data.retirementAge;
      const year = currentYear + (age - data.currentAge);
      
      // Random return based on phase
      const annualReturn = isRetired 
        ? randomNormal(data.postRetirementReturn, data.standardDeviation * 0.7)
        : randomNormal(data.preRetirementReturn, data.standardDeviation);
      
      // Start balances
      const startPreTax = preTaxBalance;
      const startRoth = rothBalance;
      const startAfterTax = afterTaxBalance;
      const startInherited = inheritedBalance;
      
      // Calculate RMDs
      let rmd401k = 0;
      let rmdInherited = 0;
      
      if (includeRMD && isRetired && age >= rmdStartAge) {
        rmd401k = calculateRMD(age, startPreTax, rmdStartAge);
      }
      
      if (data.hasInheritedIRA && startInherited > 0) {
        rmdInherited = calculateInheritedIRAWithdrawal(
          startInherited, 
          year, 
          data.inheritedIRA.inheritedYear,
          data.inheritedIRA.withdrawalStrategy || 'annual_rmd',
          age // Pass current age for life expectancy calculation
        );
      }
      
      const totalRMD = rmd401k + rmdInherited;
      
      // Income with COLA
      let income = totalRMD;
      
      // Social Security with COLA
      if (data.includeSocialSecurity && age >= data.socialSecurityStartAge) {
        const yearsSinceYourSS = age - data.socialSecurityStartAge;
        income += data.socialSecurityBenefit * Math.pow(1 + ssCOLA, yearsSinceYourSS);
      }
      
      // Spouse SS with COLA
      if (data.hasSpouse && age >= data.spouseSocialSecurityStartAge) {
        const yearsSinceSpouseSS = age - data.spouseSocialSecurityStartAge;
        income += data.spouseSocialSecurityBenefit * Math.pow(1 + ssCOLA, yearsSinceSpouseSS);
      }
      
      // Pension with COLA
      if (data.hasPension && age >= data.pensionStartAge) {
        const yearsSincePension = age - data.pensionStartAge;
        income += data.pensionIncome * Math.pow(1.015, yearsSincePension);
      }
      
      // Additional income
      data.additionalIncome.forEach(source => {
        if (age >= source.startAge && age <= source.endAge) {
          if (source.adjustForInflation) {
            const yearsFromStart = age - source.startAge;
            income += source.amount * Math.pow(1 + data.inflationRate, yearsFromStart);
          } else {
            income += source.amount;
          }
        }
      });
      
      // Dividend income
      if (dividendValue > 0) {
        if (isRetired && !reinvest) {
          income += annualDividends;
          dividendValue *= (1 + annualReturn);
        } else if (!isRetired && reinvest) {
          dividendValue = dividendValue * (1 + annualReturn) + annualDividends;
        } else {
          income += annualDividends;
          dividendValue *= (1 + annualReturn);
        }
        annualDividends *= (1 + divGrowthRate);
      }
      
      // Cryptocurrency income (with random return based on crypto volatility)
      if (cryptoBalance > 0) {
        const cryptoReturn = randomNormal(cryptoGrowth, cryptoVol);
        if (age >= cryptoStartAge) {
          const cryptoWithdrawal = cryptoBalance * cryptoWdRate;
          income += cryptoWithdrawal;
          cryptoBalance = cryptoBalance * (1 + cryptoReturn) - cryptoWithdrawal;
        } else {
          cryptoBalance *= (1 + cryptoReturn);
        }
        cryptoBalance = Math.max(0, cryptoBalance);
      }
      
      // Calculate expenses (only in retirement)
      let expenses = 0;
      if (isRetired) {
        const yearsInRetirement = age - data.retirementAge;
        expenses = data.retirementExpenses * Math.pow(1 + data.expenseGrowthRate, yearsInRetirement);
        
        // Healthcare
        if (age >= data.medicareStartAge) {
          const yearsSinceMedicare = age - data.medicareStartAge;
          expenses += (data.medicarePremium + data.medicareSupplementPremium) * 12 *
                      Math.pow(1 + data.healthcareInflationRate, yearsSinceMedicare);
        } else {
          expenses += data.annualHealthcareCost * Math.pow(1 + data.healthcareInflationRate, yearsInRetirement);
        }
      }
      
      // Growth
      const preTaxGrowth = startPreTax * annualReturn;
      const rothGrowth = startRoth * annualReturn;
      const afterTaxGrowth = startAfterTax * annualReturn;
      const inheritedIRAReturn = data.inheritedIRA?.expectedGrowthRate ?? annualReturn;
      const inheritedGrowth = startInherited * inheritedIRAReturn;
      
      // Additional withdrawal needed beyond RMDs
      const incomeWithoutPortfolio = income;
      const additionalWithdrawal = isRetired ? Math.max(0, expenses - incomeWithoutPortfolio) : 0;
      
      // Update balances
      if (isRetired) {
        let remaining = additionalWithdrawal;
        
        preTaxBalance = startPreTax + preTaxGrowth - rmd401k;
        if (remaining > 0 && preTaxBalance > 0) {
          const take = Math.min(remaining, preTaxBalance);
          preTaxBalance -= take;
          remaining -= take;
        }
        
        afterTaxBalance = startAfterTax + afterTaxGrowth;
        if (remaining > 0 && afterTaxBalance > 0) {
          const take = Math.min(remaining, afterTaxBalance);
          afterTaxBalance -= take;
          remaining -= take;
        }
        
        rothBalance = startRoth + rothGrowth;
        if (remaining > 0 && rothBalance > 0) {
          const take = Math.min(remaining, rothBalance);
          rothBalance -= take;
          remaining -= take;
        }
        
        inheritedBalance = Math.max(0, startInherited + inheritedGrowth - rmdInherited);
      } else {
        preTaxBalance = startPreTax + preTaxGrowth + preTaxContrib;
        rothBalance = startRoth + rothGrowth + rothContrib;
        afterTaxBalance = startAfterTax + afterTaxGrowth + afterTaxContrib;
        inheritedBalance = startInherited + inheritedGrowth;
        
        // Grow contributions
        preTaxContrib *= (1 + data.contributionGrowthRate);
        rothContrib *= (1 + data.contributionGrowthRate);
        afterTaxContrib *= (1 + data.contributionGrowthRate);
      }
      
      // Ensure no negative
      preTaxBalance = Math.max(0, preTaxBalance);
      rothBalance = Math.max(0, rothBalance);
      afterTaxBalance = Math.max(0, afterTaxBalance);
      inheritedBalance = Math.max(0, inheritedBalance);
      dividendValue = Math.max(0, dividendValue);
      
      const totalBalance = preTaxBalance + rothBalance + afterTaxBalance + inheritedBalance + dividendValue + cryptoBalance;
      
      if (totalBalance <= 0 && isRetired) {
        runOutOfMoney = true;
        break;
      }
    }
    
    const finalBalance = preTaxBalance + rothBalance + afterTaxBalance + inheritedBalance + dividendValue + cryptoBalance;
    finalBalances.push(finalBalance);
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
 * Calculate net worth summary from array-based data
 */
export function calculateNetWorthSummary(data: NetWorthData) {
  // Calculate asset totals
  const propertyValue = data.properties.reduce((sum, p) => sum + p.currentValue, 0);
  const vehicleValue = data.vehicles.reduce((sum, v) => sum + v.currentValue, 0);
  const bankTotal = data.bankAccounts.reduce((sum, a) => sum + a.balance, 0);
  const brokerageTotal = data.brokerageAccounts.reduce((sum, a) => sum + a.balance, 0);
  const cryptoTotal = data.cryptoHoldings.reduce((sum, c) => sum + c.currentValue, 0);
  const retirementTotal = data.retirementAccounts.reduce((sum, a) => sum + a.balance, 0);
  const personalTotal = data.personalAssets.reduce((sum, a) => sum + a.currentValue, 0);
  
  const totalAssets = propertyValue + vehicleValue + bankTotal + brokerageTotal + cryptoTotal + retirementTotal + personalTotal;
  
  // Calculate liability totals (including linked mortgages and loans)
  const propertyMortgages = data.properties.reduce((sum, p) => sum + p.mortgageBalance, 0);
  const vehicleLoans = data.vehicles.reduce((sum, v) => sum + v.loanBalance, 0);
  const debtTotal = data.debts.reduce((sum, d) => sum + d.balance, 0);
  
  const totalLiabilities = debtTotal + propertyMortgages + vehicleLoans;
  const netWorth = totalAssets - totalLiabilities;
  
  return { 
    totalAssets, 
    totalLiabilities, 
    netWorth,
    // Detailed breakdowns
    propertyValue,
    vehicleValue,
    bankTotal,
    brokerageTotal,
    cryptoTotal,
    retirementTotal,
    personalTotal,
    propertyMortgages,
    vehicleLoans,
    debtTotal,
  };
}

/**
 * Calculate budget summary with detailed expense breakdown
 */
export function calculateBudgetSummary(data: BudgetData) {
  const totalIncome = Object.values(data.income).reduce((sum, val) => sum + val, 0);
  
  // Calculate each expense category total
  const fixedExpensesTotal = Object.values(data.fixedExpenses).reduce((sum, val) => sum + val, 0);
  const debtPaymentsTotal = Object.values(data.debtPayments).reduce((sum, val) => sum + val, 0);
  const subscriptionsTotal = Object.values(data.subscriptions).reduce((sum, val) => sum + val, 0);
  const variableExpensesTotal = Object.values(data.variableExpenses).reduce((sum, val) => sum + val, 0);
  const savingsTotal = Object.values(data.savings).reduce((sum, val) => sum + val, 0);
  
  const totalExpenses = fixedExpensesTotal + debtPaymentsTotal + subscriptionsTotal + variableExpensesTotal;
  const netIncome = totalIncome - totalExpenses - savingsTotal;
  
  return { 
    totalIncome, 
    totalExpenses, 
    netIncome,
    fixedExpensesTotal,
    debtPaymentsTotal,
    subscriptionsTotal,
    variableExpensesTotal,
    savingsTotal
  };
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
