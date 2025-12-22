'use client';

import { useApp } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export function DetailsTab() {
  const { state } = useApp();
  const data = state.retirementData;
  const [showAllYears, setShowAllYears] = useState(false);

  // Generate year-by-year projection with ALL income sources
  const generateYearByYear = () => {
    const years = [];
    
    // Include all savings: pre-tax, Roth, after-tax, HSA, inherited IRA
    let balance = data.currentSavingsPreTax + data.currentSavingsRoth + 
                  data.currentSavingsAfterTax + data.currentHSA;
    if (data.hasInheritedIRA) {
      balance += data.inheritedIRA.balance;
    }
    
    // Total contributions including HSA
    let contribution = data.annualContributionPreTax + data.annualContributionRoth + 
                       data.annualContributionAfterTax + data.employerMatch + 
                       data.annualHSAContribution;
    
    let cumulativeContributions = 0;
    let cumulativeGrowth = 0;
    
    // Track healthcare costs and base expenses
    const baseHealthcareCost = data.annualHealthcareCost;
    const baseExpenses = data.retirementExpenses;
    
    // COLA rate for Social Security (use inflation rate - already stored as decimal like 0.025)
    const ssCOLA = data.inflationRate || 0.025; // Use inflation rate or default 2.5%
    
    for (let age = data.currentAge; age <= data.lifeExpectancy; age++) {
      const isRetired = age >= data.retirementAge;
      // Return rates are already stored as decimals (0.07 = 7%)
      const yearReturn = isRetired ? data.postRetirementReturn : data.preRetirementReturn;
      
      // Store start balance BEFORE any changes this year
      const startBalance = balance;
      
      // Calculate years since SS started (for COLA adjustment)
      const yearsSinceYourSS = Math.max(0, age - data.socialSecurityStartAge);
      const yearsSinceSpouseSS = Math.max(0, age - data.spouseSocialSecurityStartAge);
      
      // YOUR Social Security income (annual) WITH COLA
      let ssIncome = 0;
      if (data.includeSocialSecurity && age >= data.socialSecurityStartAge) {
        // Apply COLA for each year since SS started (inflation rate is decimal)
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
          // Adjust for inflation if flagged (inflation rate is decimal)
          if (source.adjustForInflation) {
            const yearsFromStart = age - source.startAge;
            return sum + source.amount * Math.pow(1 + data.inflationRate, yearsFromStart);
          }
          return sum + source.amount;
        }, 0);
      
      // Pension income (many pensions have COLA too)
      let pensionIncome = 0;
      if (data.hasPension && age >= data.pensionStartAge) {
        const yearsSincePension = age - data.pensionStartAge;
        // Apply 1.5% pension COLA (typical for government pensions)
        pensionIncome = data.pensionIncome * Math.pow(1.015, yearsSincePension);
      }
      
      // Total income from non-portfolio sources
      const totalOtherIncome = additionalIncome + pensionIncome;
      const totalIncome = totalSsIncome + totalOtherIncome;
      
      // Calculate expenses (only in retirement)
      let expenses = 0;
      let yearlyHealthcare = 0;
      
      if (isRetired) {
        // Inflate base expenses from retirement year (expenseGrowthRate is decimal)
        const yearsInRetirement = age - data.retirementAge;
        expenses = baseExpenses * Math.pow(1 + data.expenseGrowthRate, yearsInRetirement);
        
        // Healthcare costs - different before/after Medicare (healthcareInflationRate is decimal)
        if (age >= data.medicareStartAge) {
          // Medicare costs also inflate
          const yearsSinceMedicare = age - data.medicareStartAge;
          yearlyHealthcare = (data.medicarePremium + data.medicareSupplementPremium) * 12 * 
                             Math.pow(1 + data.healthcareInflationRate, yearsSinceMedicare);
        } else {
          yearlyHealthcare = baseHealthcareCost * Math.pow(1 + data.healthcareInflationRate, yearsInRetirement);
        }
        
        expenses += yearlyHealthcare;
      }
      
      // Contributions (only pre-retirement)
      const yearContribution = isRetired ? 0 : contribution;
      if (!isRetired) {
        cumulativeContributions += yearContribution;
      }
      
      // Calculate growth on START balance (before contributions/withdrawals)
      const growth = startBalance * yearReturn;
      cumulativeGrowth += growth;
      
      // Net withdrawal (only in retirement)
      // Withdrawal = Expenses - Income (amount needed from portfolio)
      const withdrawal = isRetired ? Math.max(0, expenses - totalIncome) : 0;
      
      // Update balance for NEXT year
      // Pre-retirement: start + growth + contributions
      // Retirement: start + growth - withdrawal
      if (isRetired) {
        balance = startBalance + growth - withdrawal;
      } else {
        balance = startBalance + growth + yearContribution;
      }
      
      years.push({
        age,
        year: new Date().getFullYear() + (age - data.currentAge),
        phase: isRetired ? 'Retirement' : 'Accumulation',
        startBalance: startBalance,
        contributions: yearContribution,
        growth: growth,
        ssIncome: totalSsIncome,
        yourSS: ssIncome,
        spouseSS: spouseSsIncome,
        otherIncome: totalOtherIncome,
        expenses: expenses,
        withdrawal: withdrawal,
        endBalance: Math.max(0, balance),
        cumulativeContributions,
        cumulativeGrowth,
      });
      
      // Grow contributions by growth rate for next year (pre-retirement only)
      if (!isRetired) {
        contribution *= (1 + data.contributionGrowthRate);
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
          <p className="text-slate-400 text-sm">Starting Balance</p>
          <p className="text-2xl font-bold text-white">
            ${(data.currentSavingsPreTax + data.currentSavingsRoth + data.currentSavingsAfterTax).toLocaleString()}
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
            ${Math.round(yearData[yearData.length - 1]?.cumulativeGrowth || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Year-by-Year Table */}
      <Card title="📅 Annual Projections" icon="📅">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-2 text-slate-400 font-medium">Age</th>
                <th className="text-left py-3 px-2 text-slate-400 font-medium">Year</th>
                <th className="text-left py-3 px-2 text-slate-400 font-medium">Phase</th>
                <th className="text-right py-3 px-2 text-slate-400 font-medium">Start Balance</th>
                <th className="text-right py-3 px-2 text-slate-400 font-medium">Contributions</th>
                <th className="text-right py-3 px-2 text-slate-400 font-medium">Growth</th>
                <th className="text-right py-3 px-2 text-slate-400 font-medium">Your SS</th>
                {data.hasSpouse && (
                  <th className="text-right py-3 px-2 text-slate-400 font-medium">Spouse SS</th>
                )}
                <th className="text-right py-3 px-2 text-slate-400 font-medium">Other Income</th>
                <th className="text-right py-3 px-2 text-slate-400 font-medium">Expenses</th>
                <th className="text-right py-3 px-2 text-slate-400 font-medium">Withdrawal</th>
                <th className="text-right py-3 px-2 text-slate-400 font-medium">End Balance</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((row, index) => {
                const isRetirementYear = row.age === data.retirementAge;
                const isSSYear = row.age === data.socialSecurityStartAge;
                const isSpouseSSYear = data.hasSpouse && row.age === data.spouseSocialSecurityStartAge;
                const isMoneyOut = row.endBalance <= 0;
                
                return (
                  <tr 
                    key={row.age}
                    className={`
                      border-b border-slate-700/50 transition-colors
                      ${isRetirementYear ? 'bg-emerald-500/10' : ''}
                      ${isSSYear || isSpouseSSYear ? 'bg-blue-500/10' : ''}
                      ${isMoneyOut ? 'bg-red-500/10' : ''}
                      ${!isRetirementYear && !isSSYear && !isSpouseSSYear && !isMoneyOut ? 'hover:bg-slate-800/50' : ''}
                    `}
                  >
                    <td className="py-2 px-2">
                      <span className={`font-medium ${isRetirementYear ? 'text-emerald-400' : 'text-white'}`}>
                        {row.age}
                        {isRetirementYear && <span className="ml-1">🎉</span>}
                        {isSSYear && <span className="ml-1">🏛️</span>}
                        {isSpouseSSYear && !isSSYear && <span className="ml-1">👫</span>}
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
                    <td className="py-2 px-2 text-right text-slate-300">
                      ${Math.round(row.startBalance).toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-right text-emerald-400">
                      {row.contributions > 0 ? `+$${Math.round(row.contributions).toLocaleString()}` : '-'}
                    </td>
                    <td className={`py-2 px-2 text-right ${row.growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {row.growth >= 0 ? '+' : ''}${Math.round(row.growth).toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-right text-blue-400">
                      {row.yourSS > 0 ? `$${Math.round(row.yourSS).toLocaleString()}` : '-'}
                    </td>
                    {data.hasSpouse && (
                      <td className="py-2 px-2 text-right text-purple-400">
                        {row.spouseSS > 0 ? `$${Math.round(row.spouseSS).toLocaleString()}` : '-'}
                      </td>
                    )}
                    <td className="py-2 px-2 text-right text-amber-400">
                      {row.otherIncome > 0 ? `$${Math.round(row.otherIncome).toLocaleString()}` : '-'}
                    </td>
                    <td className="py-2 px-2 text-right text-red-400">
                      {row.expenses > 0 ? `-$${Math.round(row.expenses).toLocaleString()}` : '-'}
                    </td>
                    <td className="py-2 px-2 text-right text-orange-400">
                      {row.withdrawal > 0 ? `-$${Math.round(row.withdrawal).toLocaleString()}` : '-'}
                    </td>
                    <td className={`py-2 px-2 text-right font-medium ${row.endBalance > 0 ? 'text-white' : 'text-red-400'}`}>
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
          <div className="w-4 h-4 bg-red-500/20 border border-red-500/30 rounded"></div>
          <span className="text-slate-400">Funds Depleted ⚠️</span>
        </div>
      </div>
    </div>
  );
}
