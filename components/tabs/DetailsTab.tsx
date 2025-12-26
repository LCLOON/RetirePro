'use client';

import { useApp } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { 
  RMD_LIFE_EXPECTANCY_TABLE,
  SINGLE_LIFE_EXPECTANCY_TABLE,
  calculateRMD,
  calculateInheritedIRAWithdrawal,
} from '@/lib/calculations';

// Re-export for backward compatibility if needed
export { RMD_LIFE_EXPECTANCY_TABLE, SINGLE_LIFE_EXPECTANCY_TABLE, calculateRMD, calculateInheritedIRAWithdrawal };

export function DetailsTab() {
  const { state } = useApp();
  const data = state.retirementData;
  const mortgageData = state.mortgageData;
  const [showAllYears, setShowAllYears] = useState(false);

  // Calculate mortgage payoff years and monthly payment using ORIGINAL loan terms
  const mortgagePayoffs = mortgageData.mortgages.map(m => {
    const currentYear = new Date().getFullYear();
    const yearsElapsed = currentYear - m.startYear;
    const yearsRemaining = Math.max(0, m.loanTermYears - yearsElapsed);
    const payoffYear = currentYear + yearsRemaining;
    
    // Calculate monthly payment using ORIGINAL loan terms (synced with MortgageTab)
    const monthlyRate = m.interestRate / 12;
    const numPayments = m.loanTermYears * 12; // Original term, not remaining
    let monthlyPayment = 0;
    if (numPayments > 0 && monthlyRate > 0) {
      // Use ORIGINAL loan amount and term
      monthlyPayment = m.loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                       (Math.pow(1 + monthlyRate, numPayments) - 1);
    }
    // Add escrow costs (property tax, insurance, HOA, PMI)
    const totalMonthlyPayment = monthlyPayment + (m.propertyTax / 12) + (m.insurance / 12) + m.hoaFees + m.pmi;
    
    return {
      name: m.name,
      payoffYear,
      annualPayment: totalMonthlyPayment * 12,
    };
  });
  
  const totalAnnualMortgagePayment = mortgagePayoffs.reduce((sum, m) => sum + m.annualPayment, 0);

  // Generate year-by-year projection with ALL income sources
  const generateYearByYear = () => {
    const years = [];
    
    // Track pre-tax and Roth balances SEPARATELY for RMD calculations
    let preTaxBalance = data.currentSavingsPreTax;
    let rothBalance = data.currentSavingsRoth;
    let afterTaxBalance = data.currentSavingsAfterTax + data.currentHSA;
    let inheritedIRABalance = data.hasInheritedIRA ? data.inheritedIRA.balance : 0;
    
    // Dividend portfolio tracking
    let dividendPortfolioValue = data.hasDividendPortfolio && data.dividendPortfolio?.includeInProjections 
      ? data.dividendPortfolio.currentValue : 0;
    let annualDividendIncome = data.hasDividendPortfolio && data.dividendPortfolio?.includeInProjections 
      ? data.dividendPortfolio.annualDividendIncome : 0;
    const dividendGrowthRate = data.dividendPortfolio?.dividendGrowthRate || 0.05;
    const reinvestDividends = data.dividendPortfolio?.reinvestDividends ?? true;
    
    // Cryptocurrency tracking
    let cryptoValue = data.hasCryptoHoldings && data.cryptoHoldings?.includeInProjections 
      ? data.cryptoHoldings.currentValue : 0;
    const cryptoGrowthRate = data.cryptoHoldings?.expectedGrowthRate || 0.10;
    const cryptoWithdrawalStartAge = data.cryptoHoldings?.withdrawalStartAge || data.retirementAge;
    const cryptoWithdrawalPercent = data.cryptoHoldings?.withdrawalPercent || 0.04;
    
    // Total balance is sum of all accounts
    let totalBalance = preTaxBalance + rothBalance + afterTaxBalance + inheritedIRABalance + dividendPortfolioValue + cryptoValue;
    
    // Track contributions by type
    let preTaxContribution = data.annualContributionPreTax + data.employerMatch;
    let rothContribution = data.annualContributionRoth;
    let afterTaxContribution = data.annualContributionAfterTax + data.annualHSAContribution;
    
    let cumulativeContributions = 0;
    let cumulativeGrowth = 0;
    
    // Track healthcare costs and base expenses
    const baseHealthcareCost = data.annualHealthcareCost;
    const baseExpenses = data.retirementExpenses;
    
    // COLA rate for Social Security (use inflation rate - already stored as decimal like 0.025)
    const ssCOLA = data.inflationRate || 0.025;
    
    // RMD settings
    const rmdStartAge = data.rmdStartAge || 73;
    const includeRMD = data.includeRMD !== false; // Default to true
    
    for (let age = data.currentAge; age <= data.lifeExpectancy; age++) {
      const isRetired = age >= data.retirementAge;
      const yearReturn = isRetired ? data.postRetirementReturn : data.preRetirementReturn;
      const currentYear = new Date().getFullYear() + (age - data.currentAge);
      
      // Store start balances BEFORE any changes this year
      const startPreTax = preTaxBalance;
      const startRoth = rothBalance;
      const startAfterTax = afterTaxBalance;
      const startInherited = inheritedIRABalance;
      const startDividend = dividendPortfolioValue;
      const startCrypto = cryptoValue;
      const startBalance = startPreTax + startRoth + startAfterTax + startInherited + startDividend + startCrypto;
      
      // Calculate RMDs (Required Minimum Distributions)
      let rmd401k = 0;
      let rmdInherited = 0;
      
      if (includeRMD && age >= rmdStartAge) {
        // Traditional 401K/IRA RMD
        rmd401k = calculateRMD(age, startPreTax, rmdStartAge);
      }
      
      // Inherited IRA withdrawals (10-year rule)
      if (data.hasInheritedIRA && startInherited > 0) {
        // Calculate this year's growth first so year-10 lump sum includes final year growth
        const inheritedIRAGrowthForRMD = startInherited * (data.inheritedIRA?.expectedGrowthRate ?? yearReturn);
        const balanceWithGrowth = startInherited + inheritedIRAGrowthForRMD;
        
        rmdInherited = calculateInheritedIRAWithdrawal(
          balanceWithGrowth, // Use balance INCLUDING this year's growth
          currentYear,
          data.inheritedIRA.inheritedYear,
          data.inheritedIRA.withdrawalStrategy || 'annual_rmd',
          age, // Pass current age for life expectancy calculation
          data.inheritedIRA.originalOwnerStartedRMD || false // Force annual RMD if original owner was taking RMDs
        );
      }
      
      const totalRMD = rmd401k + rmdInherited;
      
      // Calculate years since SS started (for COLA adjustment)
      const yearsSinceYourSS = Math.max(0, age - data.socialSecurityStartAge);
      const yearsSinceSpouseSS = Math.max(0, age - data.spouseSocialSecurityStartAge);
      
      // YOUR Social Security income (annual) WITH COLA
      let ssIncome = 0;
      if (data.includeSocialSecurity && age >= data.socialSecurityStartAge) {
        ssIncome = data.socialSecurityBenefit * Math.pow(1 + ssCOLA, yearsSinceYourSS);
      }
      
      // SPOUSE Social Security income (annual) WITH COLA
      let spouseSsIncome = 0;
      if (data.hasSpouse && age >= data.spouseSocialSecurityStartAge) {
        spouseSsIncome = data.spouseSocialSecurityBenefit * Math.pow(1 + ssCOLA, yearsSinceSpouseSS);
      }
      
      const totalSsIncome = ssIncome + spouseSsIncome;
      
      // Additional income sources (from array)
      const additionalIncome = data.additionalIncome
        .filter(source => age >= source.startAge && age <= source.endAge)
        .reduce((sum, source) => {
          if (source.adjustForInflation) {
            const yearsFromStart = age - source.startAge;
            return sum + source.amount * Math.pow(1 + data.inflationRate, yearsFromStart);
          }
          return sum + source.amount;
        }, 0);
      
      // Pension income
      let pensionIncome = 0;
      if (data.hasPension && age >= data.pensionStartAge) {
        const yearsSincePension = age - data.pensionStartAge;
        pensionIncome = data.pensionIncome * Math.pow(1.015, yearsSincePension);
      }
      
      // Dividend income
      let dividendIncome = 0;
      if (startDividend > 0) {
        if (isRetired && !reinvestDividends) {
          dividendIncome = annualDividendIncome;
        } else if (!isRetired && reinvestDividends) {
          // Reinvesting during accumulation phase
          dividendPortfolioValue = startDividend + startDividend * yearReturn + annualDividendIncome;
          annualDividendIncome *= (1 + dividendGrowthRate);
        } else {
          // Retired: take dividends as income
          dividendIncome = annualDividendIncome;
          dividendPortfolioValue = startDividend + startDividend * yearReturn;
          annualDividendIncome *= (1 + dividendGrowthRate);
        }
      }
      
      // Cryptocurrency income
      let cryptoIncome = 0;
      if (startCrypto > 0 && age >= cryptoWithdrawalStartAge) {
        cryptoIncome = startCrypto * cryptoWithdrawalPercent;
        cryptoValue = startCrypto * (1 + cryptoGrowthRate) - cryptoIncome;
      } else if (startCrypto > 0) {
        cryptoValue = startCrypto * (1 + cryptoGrowthRate);
      }
      
      // Total income from non-portfolio sources (including RMDs as income)
      const totalOtherIncome = additionalIncome + pensionIncome + dividendIncome + cryptoIncome;
      const totalIncome = totalSsIncome + totalOtherIncome + totalRMD;
      
      // Calculate expenses (only in retirement)
      let expenses = 0;
      let yearlyHealthcare = 0;
      let mortgageSavings = 0;
      
      if (isRetired) {
        const yearsInRetirement = age - data.retirementAge;
        expenses = baseExpenses * Math.pow(1 + data.expenseGrowthRate, yearsInRetirement);
        
        // Calculate mortgage savings - reduce expenses for each paid-off mortgage
        mortgageSavings = mortgagePayoffs
          .filter(m => currentYear >= m.payoffYear)
          .reduce((sum, m) => sum + m.annualPayment, 0);
        
        // Subtract mortgage payments that are now paid off
        expenses = Math.max(0, expenses - mortgageSavings);
        
        if (age >= data.medicareStartAge) {
          const yearsSinceMedicare = age - data.medicareStartAge;
          yearlyHealthcare = (data.medicarePremium + data.medicareSupplementPremium) * 12 * 
                             Math.pow(1 + data.healthcareInflationRate, yearsSinceMedicare);
        } else {
          yearlyHealthcare = baseHealthcareCost * Math.pow(1 + data.healthcareInflationRate, yearsInRetirement);
        }
        
        expenses += yearlyHealthcare;
      }
      
      // Contributions (only pre-retirement)
      const yearPreTaxContrib = isRetired ? 0 : preTaxContribution;
      const yearRothContrib = isRetired ? 0 : rothContribution;
      const yearAfterTaxContrib = isRetired ? 0 : afterTaxContribution;
      const yearContribution = yearPreTaxContrib + yearRothContrib + yearAfterTaxContrib;
      
      if (!isRetired) {
        cumulativeContributions += yearContribution;
      }
      
      // Calculate growth on each account type
      const preTaxGrowth = startPreTax * yearReturn;
      const rothGrowth = startRoth * yearReturn;
      const afterTaxGrowth = startAfterTax * yearReturn;
      const inheritedIRAReturn = data.inheritedIRA?.expectedGrowthRate ?? yearReturn;
      const inheritedGrowth = startInherited * inheritedIRAReturn;
      const dividendGrowth = startDividend > 0 && !isRetired ? startDividend * yearReturn : 0;
      const cryptoGrowth = startCrypto > 0 ? startCrypto * cryptoGrowthRate : 0;
      const totalGrowth = preTaxGrowth + rothGrowth + afterTaxGrowth + inheritedGrowth + dividendGrowth + cryptoGrowth;
      cumulativeGrowth += totalGrowth;
      
      // Calculate additional withdrawal needed beyond RMDs
      // Withdrawal = max(0, Expenses - (SS + Other Income + RMDs))
      const incomeWithoutWithdrawal = totalSsIncome + totalOtherIncome + totalRMD;
      const additionalWithdrawalNeeded = isRetired ? Math.max(0, expenses - incomeWithoutWithdrawal) : 0;
      
      // Early retirement extra withdrawals (tax bracket filling strategy)
      let earlyExtraWithdrawal = 0;
      if (data.earlyWithdrawalEnabled && 
          age >= data.earlyWithdrawalStartAge && 
          age <= data.earlyWithdrawalEndAge &&
          isRetired) {
        earlyExtraWithdrawal = data.earlyWithdrawalAmount;
      }
      
      // Total withdrawal from portfolio (RMDs + any additional needed + early extra)
      const totalWithdrawal = totalRMD + additionalWithdrawalNeeded + earlyExtraWithdrawal;
      
      // Calculate net cash flow and surplus
      const netCashFlow = isRetired ? (incomeWithoutWithdrawal - expenses) : 0;
      const surplus = isRetired ? Math.max(0, incomeWithoutWithdrawal - expenses) : 0;
      
      // Update account balances for NEXT year
      if (isRetired) {
        // Apply RMDs first (mandatory), then additional withdrawals, then early extra
        // Withdraw from pre-tax first (for RMDs and early extra), then after-tax, then Roth
        
        // Pre-tax: growth - 401k RMD - early extra withdrawal - portion of additional withdrawal
        let remainingWithdrawal = additionalWithdrawalNeeded;
        
        preTaxBalance = startPreTax + preTaxGrowth - rmd401k - earlyExtraWithdrawal;
        if (remainingWithdrawal > 0 && preTaxBalance > 0) {
          const fromPreTax = Math.min(remainingWithdrawal, preTaxBalance);
          preTaxBalance -= fromPreTax;
          remainingWithdrawal -= fromPreTax;
        }
        
        // After-tax next (before Roth to preserve tax-free growth)
        afterTaxBalance = startAfterTax + afterTaxGrowth;
        if (remainingWithdrawal > 0 && afterTaxBalance > 0) {
          const fromAfterTax = Math.min(remainingWithdrawal, afterTaxBalance);
          afterTaxBalance -= fromAfterTax;
          remainingWithdrawal -= fromAfterTax;
        }
        
        // Roth last (tax-free, let it grow)
        rothBalance = startRoth + rothGrowth;
        if (remainingWithdrawal > 0 && rothBalance > 0) {
          const fromRoth = Math.min(remainingWithdrawal, rothBalance);
          rothBalance -= fromRoth;
          remainingWithdrawal -= fromRoth;
        }
        
        // Inherited IRA - mandatory withdrawal
        inheritedIRABalance = Math.max(0, startInherited + inheritedGrowth - rmdInherited);
        
        // Dividend and crypto already updated above
        
      } else {
        // Accumulation phase: add contributions and growth
        preTaxBalance = startPreTax + preTaxGrowth + yearPreTaxContrib;
        rothBalance = startRoth + rothGrowth + yearRothContrib;
        afterTaxBalance = startAfterTax + afterTaxGrowth + yearAfterTaxContrib;
        inheritedIRABalance = startInherited + inheritedGrowth;
        // Dividend and crypto already updated above
      }
      
      // Ensure no negative balances
      preTaxBalance = Math.max(0, preTaxBalance);
      rothBalance = Math.max(0, rothBalance);
      afterTaxBalance = Math.max(0, afterTaxBalance);
      inheritedIRABalance = Math.max(0, inheritedIRABalance);
      dividendPortfolioValue = Math.max(0, dividendPortfolioValue);
      cryptoValue = Math.max(0, cryptoValue);
      
      totalBalance = preTaxBalance + rothBalance + afterTaxBalance + inheritedIRABalance + dividendPortfolioValue + cryptoValue;
      
      // Calculate total spendable (income + withdrawals)
      const totalSpendable = isRetired ? totalSsIncome + totalOtherIncome + totalWithdrawal : 0;
      
      // Calculate withdrawal rate (total withdrawal / start balance)
      const withdrawalRate = isRetired && startBalance > 0 ? (totalWithdrawal / startBalance) * 100 : 0;
      
      years.push({
        age,
        year: currentYear,
        phase: isRetired ? 'Retirement' : 'Accumulation',
        startBalance: startBalance,
        preTaxBalance: startPreTax,
        rothBalance: startRoth,
        contributions: yearContribution,
        growth: totalGrowth,
        ssIncome: totalSsIncome,
        yourSS: ssIncome,
        spouseSS: spouseSsIncome,
        otherIncome: totalOtherIncome,
        rmd401k: rmd401k,
        rmdInherited: rmdInherited,
        totalRMD: totalRMD,
        totalIncome: totalIncome,
        expenses: expenses,
        withdrawal: totalWithdrawal,
        additionalWithdrawal: additionalWithdrawalNeeded,
        earlyExtraWithdrawal: earlyExtraWithdrawal,
        surplus: surplus,
        netCashFlow: netCashFlow,
        totalSpendable: totalSpendable,
        withdrawalRate: withdrawalRate,
        endBalance: Math.max(0, totalBalance),
        cumulativeContributions,
        cumulativeGrowth,
      });
      
      // Grow contributions by growth rate for next year (pre-retirement only)
      if (!isRetired) {
        preTaxContribution *= (1 + data.contributionGrowthRate);
        rothContribution *= (1 + data.contributionGrowthRate);
        afterTaxContribution *= (1 + data.contributionGrowthRate);
      }
    }
    
    return years;
  };

  const yearData = generateYearByYear();
  const displayData = showAllYears ? yearData : yearData.slice(0, 20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">📋</span>
            Year-by-Year Details
          </h1>
          <p className="text-slate-400 mt-1">Detailed breakdown from age {data.currentAge} to {data.lifeExpectancy}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowAllYears(!showAllYears)}>
            {showAllYears ? '📉 Show Less' : '📊 Show All Years'}
          </Button>
          <Button variant="primary">
            📤 Export to CSV
          </Button>
        </div>
      </div>

      {/* Retirement Income Summary */}
      {(() => {
        // Find first year with SS to show retirement income breakdown
        const ssStartYear = yearData.find(y => y.age === data.socialSecurityStartAge);
        const firstRetirementYear = yearData.find(y => y.age === data.retirementAge);
        const avgRetirementIncome = ssStartYear ? ssStartYear.totalIncome : 0;
        const avgExpenses = ssStartYear ? ssStartYear.expenses : (firstRetirementYear?.expenses || 0);
        
        return (
          <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-xl p-6 border border-emerald-500/20">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              💰 Your Retirement Income Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs text-slate-400">Your SS (at {data.socialSecurityStartAge})</p>
                <p className="text-lg font-bold text-blue-400">${Math.round(data.socialSecurityBenefit).toLocaleString()}/yr</p>
              </div>
              {data.hasSpouse && (
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">Spouse SS (at {data.spouseSocialSecurityStartAge})</p>
                  <p className="text-lg font-bold text-purple-400">${Math.round(data.spouseSocialSecurityBenefit).toLocaleString()}/yr</p>
                </div>
              )}
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs text-slate-400">Other Income</p>
                <p className="text-lg font-bold text-amber-400">${Math.round(ssStartYear?.otherIncome || 0).toLocaleString()}/yr</p>
              </div>
              <div className="bg-emerald-500/20 rounded-lg p-3">
                <p className="text-xs text-emerald-400">Total Annual Income</p>
                <p className="text-xl font-bold text-emerald-400">${Math.round(avgRetirementIncome).toLocaleString()}/yr</p>
                <p className="text-xs text-slate-500">${Math.round(avgRetirementIncome / 12).toLocaleString()}/mo</p>
              </div>
              <div className={`rounded-lg p-3 ${avgRetirementIncome >= avgExpenses ? 'bg-emerald-500/20' : 'bg-orange-500/20'}`}>
                <p className="text-xs text-slate-400">401K Withdrawal Needed</p>
                <p className={`text-lg font-bold ${avgRetirementIncome >= avgExpenses ? 'text-emerald-400' : 'text-orange-400'}`}>
                  {avgRetirementIncome >= avgExpenses 
                    ? '$0/yr ✓' 
                    : `$${Math.round(avgExpenses - avgRetirementIncome).toLocaleString()}/yr`
                  }
                </p>
                <p className="text-xs text-slate-500">
                  {avgRetirementIncome >= avgExpenses 
                    ? `+$${Math.round(avgRetirementIncome - avgExpenses).toLocaleString()} surplus`
                    : `$${Math.round((avgExpenses - avgRetirementIncome) / 12).toLocaleString()}/mo from 401K`
                  }
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
          <p className="text-slate-400 text-sm">Starting Balance</p>
          <p className="text-2xl font-bold text-white">
            ${Math.round(yearData[0]?.startBalance || 0).toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
          <p className="text-emerald-400 text-sm">At Retirement (Age {data.retirementAge})</p>
          <p className="text-2xl font-bold text-white">
            ${Math.round(yearData.find(y => y.age === data.retirementAge)?.endBalance || 0).toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <p className="text-blue-400 text-sm">Total Contributions</p>
          <p className="text-2xl font-bold text-white">
            ${Math.round(yearData[yearData.length - 1]?.cumulativeContributions || 0).toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
          <p className="text-purple-400 text-sm">Total Growth</p>
          <p className="text-2xl font-bold text-white">
            ${Math.round(
              (yearData[yearData.length - 1]?.endBalance || 0) - 
              (yearData[0]?.startBalance || 0) - 
              (yearData[yearData.length - 1]?.cumulativeContributions || 0)
            ).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Year-by-Year Table */}
      <Card title="📅 Annual Projections" icon="📅">
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="text-sm" style={{ minWidth: '1200px' }}>
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-2 text-slate-400 font-medium whitespace-nowrap">Age</th>
                <th className="text-left py-3 px-2 text-slate-400 font-medium whitespace-nowrap">Year</th>
                <th className="text-left py-3 px-2 text-slate-400 font-medium whitespace-nowrap">Phase</th>
                <th className="text-right py-3 px-2 text-slate-400 font-medium whitespace-nowrap">Portfolio</th>
                <th className="text-right py-3 px-2 text-slate-400 font-medium whitespace-nowrap">Growth</th>
                <th className="text-right py-3 px-2 text-slate-400 font-medium whitespace-nowrap">Soc Sec</th>
                <th className="text-right py-3 px-2 text-slate-400 font-medium whitespace-nowrap">Other</th>
                <th className="text-right py-3 px-2 text-slate-400 font-medium bg-red-500/10 whitespace-nowrap">RMD</th>
                <th className="text-right py-3 px-2 text-slate-400 font-medium bg-emerald-500/10 whitespace-nowrap">Total Income</th>
                <th className="text-right py-3 px-2 text-slate-400 font-medium whitespace-nowrap">Expenses</th>
                <th className="text-right py-3 px-2 text-slate-400 font-medium bg-green-500/10 whitespace-nowrap">Surplus</th>
                <th className="text-right py-3 px-2 text-slate-400 font-medium bg-blue-500/10 whitespace-nowrap">Contrib</th>
                {data.earlyWithdrawalEnabled && (
                  <th className="text-right py-3 px-2 text-slate-400 font-medium bg-amber-500/10 whitespace-nowrap">Early Extra</th>
                )}
                <th className="text-right py-3 px-2 text-slate-400 font-medium bg-cyan-500/10 whitespace-nowrap">Spendable</th>
                <th className="text-right py-3 px-2 text-slate-400 font-medium whitespace-nowrap">W/D %</th>
                <th className="text-right py-3 px-3 text-slate-400 font-medium whitespace-nowrap min-w-[120px]">End Balance</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((row) => {
                const isRetirementYear = row.age === data.retirementAge;
                const isSSYear = row.age === data.socialSecurityStartAge;
                const isSpouseSSYear = data.hasSpouse && row.age === data.spouseSocialSecurityStartAge;
                const isRMDStartYear = row.age === (data.rmdStartAge || 73);
                const isMoneyOut = row.endBalance <= 0;
                
                return (
                  <tr 
                    key={row.age}
                    className={`
                      border-b border-slate-700/50 transition-colors
                      ${isRetirementYear ? 'bg-emerald-500/10' : ''}
                      ${isSSYear || isSpouseSSYear ? 'bg-blue-500/10' : ''}
                      ${isRMDStartYear ? 'bg-red-500/10' : ''}
                      ${isMoneyOut ? 'bg-red-500/20' : ''}
                      ${!isRetirementYear && !isSSYear && !isSpouseSSYear && !isRMDStartYear && !isMoneyOut ? 'hover:bg-slate-800/50' : ''}
                    `}
                  >
                    <td className="py-2 px-2">
                      <span className={`font-medium ${isRetirementYear ? 'text-emerald-400' : isRMDStartYear ? 'text-red-400' : 'text-white'}`}>
                        {row.age}
                        {isRetirementYear && <span className="ml-1">🎉</span>}
                        {isSSYear && <span className="ml-1">🏛️</span>}
                        {isSpouseSSYear && !isSSYear && <span className="ml-1">👫</span>}
                        {isRMDStartYear && <span className="ml-1">📋</span>}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-slate-300">{row.year}</td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        row.phase === 'Retirement' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {row.phase}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right text-slate-300 whitespace-nowrap">
                      ${Math.round(row.startBalance).toLocaleString()}
                    </td>
                    <td className={`py-2 px-2 text-right ${row.growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {row.growth >= 0 ? '+' : ''}${Math.round(row.growth).toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-right text-blue-400">
                      {row.ssIncome > 0 ? `$${Math.round(row.ssIncome).toLocaleString()}` : '-'}
                    </td>
                    <td className="py-2 px-2 text-right text-amber-400">
                      {row.otherIncome > 0 ? `$${Math.round(row.otherIncome).toLocaleString()}` : '-'}
                    </td>
                    <td className="py-2 px-2 text-right bg-red-500/5">
                      {row.totalRMD > 0 
                        ? <span className="text-red-400 font-medium">${Math.round(row.totalRMD).toLocaleString()}</span>
                        : <span className="text-slate-500">-</span>
                      }
                    </td>
                    <td className="py-2 px-2 text-right font-semibold text-emerald-400 bg-emerald-500/5">
                      {row.totalIncome > 0 ? `$${Math.round(row.totalIncome).toLocaleString()}` : '-'}
                    </td>
                    <td className="py-2 px-2 text-right text-red-400">
                      {row.expenses > 0 ? `-$${Math.round(row.expenses).toLocaleString()}` : '-'}
                    </td>
                    <td className="py-2 px-2 text-right bg-green-500/5">
                      {row.phase === 'Retirement' 
                        ? row.surplus > 0 
                          ? <span className="text-green-400 font-medium">+${Math.round(row.surplus).toLocaleString()}</span>
                          : <span className="text-slate-400">$0</span>
                        : <span className="text-slate-500">-</span>
                      }
                    </td>
                    <td className="py-2 px-2 text-right text-blue-400 bg-blue-500/5">
                      {row.contributions > 0 ? `+$${Math.round(row.contributions).toLocaleString()}` : '-'}
                    </td>
                    {data.earlyWithdrawalEnabled && (
                      <td className="py-2 px-2 text-right bg-amber-500/5">
                        {row.phase === 'Retirement' && row.earlyExtraWithdrawal > 0
                          ? <span className="text-amber-400 font-medium">-${Math.round(row.earlyExtraWithdrawal).toLocaleString()}</span>
                          : <span className="text-slate-500">-</span>
                        }
                      </td>
                    )}
                    <td className="py-2 px-2 text-right bg-cyan-500/5">
                      {row.phase === 'Retirement' 
                        ? <span className="text-cyan-400 font-semibold">${Math.round(row.totalSpendable).toLocaleString()}</span>
                        : <span className="text-slate-500">-</span>
                      }
                    </td>
                    <td className="py-2 px-2 text-right whitespace-nowrap">
                      {row.phase === 'Retirement' 
                        ? <span className={`font-medium ${
                            row.withdrawalRate === 0 ? 'text-emerald-400' :
                            row.withdrawalRate <= 4 ? 'text-emerald-400' : 
                            row.withdrawalRate <= 5 ? 'text-amber-400' : 'text-red-400'
                          }`}>
                            {row.withdrawalRate.toFixed(1)}%
                            {row.withdrawalRate <= 4 && row.withdrawalRate > 0 && ' ✓'}
                            {row.withdrawalRate > 5 && ' ⚠️'}
                          </span>
                        : <span className="text-slate-500">-</span>
                      }
                    </td>
                    <td className={`py-2 px-3 text-right font-medium whitespace-nowrap min-w-[120px] ${row.endBalance > 0 ? 'text-white' : 'text-red-400'}`}>
                      ${Math.round(row.endBalance).toLocaleString()}
                      {isMoneyOut && <span className="ml-1">⚠️</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!showAllYears && yearData.length > 20 && (
          <div className="mt-4 text-center">
            <Button variant="ghost" onClick={() => setShowAllYears(true)}>
              Show {yearData.length - 20} more years...
            </Button>
          </div>
        )}
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500/20 border border-emerald-500/30 rounded"></div>
          <span className="text-slate-400">Retirement Year 🎉</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500/20 border border-blue-500/30 rounded"></div>
          <span className="text-slate-400">Social Security Start 🏛️</span>
        </div>
        {data.hasSpouse && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400">👫 Spouse SS Start</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500/10 border border-red-500/30 rounded"></div>
          <span className="text-slate-400">RMD Start Age 📋 ({data.rmdStartAge || 73})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500/30 border border-red-500/50 rounded"></div>
          <span className="text-slate-400">Funds Depleted ⚠️</span>
        </div>
      </div>

      {/* RMD Info Card */}
      <Card title="📋 RMD Information" icon="📋">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-red-400 mb-2">Traditional 401K/IRA RMDs</h4>
            <p className="text-xs text-slate-400 mb-2">
              Required Minimum Distributions start at age <span className="text-white font-medium">{data.rmdStartAge || 73}</span>
            </p>
            <p className="text-xs text-slate-500">
              Calculated using IRS Uniform Lifetime Table. Failure to take RMDs results in a 25% penalty.
            </p>
          </div>
          {data.hasInheritedIRA && (
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-amber-400 mb-2">Inherited IRA (10-Year Rule)</h4>
              <p className="text-xs text-slate-400 mb-2">
                Must empty by year <span className="text-white font-medium">{data.inheritedIRA.inheritedYear + 10}</span>
              </p>
              <p className="text-xs text-slate-500">
                SECURE Act requires non-spouse beneficiaries to withdraw all funds within 10 years.
              </p>
            </div>
          )}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-emerald-400 mb-2">Roth IRAs</h4>
            <p className="text-xs text-slate-400 mb-2">
              No RMDs required for Roth IRAs
            </p>
            <p className="text-xs text-slate-500">
              Your Roth balance: ${data.currentSavingsRoth.toLocaleString()} (grows tax-free with no forced withdrawals)
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
