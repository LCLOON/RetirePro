'use client';

import { useApp } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export function DetailsTab() {
  const { state } = useApp();
  const data = state.retirementData;
  const [showAllYears, setShowAllYears] = useState(false);

  // Generate year-by-year projection
  const generateYearByYear = () => {
    const years = [];
    const totalSavings = data.currentSavingsPreTax + data.currentSavingsRoth + data.currentSavingsAfterTax;
    const totalContributions = data.annualContributionPreTax + data.annualContributionRoth + data.annualContributionAfterTax + data.employerMatch;
    
    let balance = totalSavings;
    let cumulativeContributions = 0;
    let cumulativeGrowth = 0;
    
    for (let age = data.currentAge; age <= data.lifeExpectancy; age++) {
      const isRetired = age >= data.retirementAge;
      const yearReturn = isRetired ? data.postRetirementReturn : data.preRetirementReturn;
      
      // Social Security income
      const ssIncome = age >= data.socialSecurityStartAge ? data.socialSecurityBenefit : 0;
      
      // Other income
      const otherIncome = (age >= data.otherIncomeStartAge && age <= data.otherIncomeEndAge) ? data.otherIncome : 0;
      
      // Pension
      const pensionIncome = isRetired ? data.pensionIncome : 0;
      
      // Total income from non-portfolio sources
      const totalIncome = ssIncome + otherIncome + pensionIncome;
      
      // Expenses (only in retirement)
      const expenses = isRetired ? data.retirementExpenses * Math.pow(1 + data.inflationRate / 100, age - data.retirementAge) : 0;
      
      // Contributions (only pre-retirement)
      const contributions = isRetired ? 0 : totalContributions;
      cumulativeContributions += contributions;
      
      // Net withdrawal/contribution
      const netFlow = isRetired ? -(expenses - totalIncome) : contributions;
      
      // Growth
      const growth = balance * (yearReturn / 100);
      cumulativeGrowth += growth;
      
      // Update balance
      balance = balance + growth + netFlow;
      
      years.push({
        age,
        year: new Date().getFullYear() + (age - data.currentAge),
        phase: isRetired ? 'Retirement' : 'Accumulation',
        startBalance: balance - growth - netFlow,
        contributions: contributions,
        growth: growth,
        ssIncome: ssIncome,
        otherIncome: otherIncome + pensionIncome,
        expenses: expenses,
        withdrawal: isRetired ? Math.max(0, expenses - totalIncome) : 0,
        endBalance: Math.max(0, balance),
        cumulativeContributions,
        cumulativeGrowth,
      });
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
                <th className="text-right py-3 px-2 text-slate-400 font-medium">SS Income</th>
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
                const isMoneyOut = row.endBalance <= 0;
                
                return (
                  <tr 
                    key={row.age}
                    className={`
                      border-b border-slate-700/50 transition-colors
                      ${isRetirementYear ? 'bg-emerald-500/10' : ''}
                      ${isSSYear ? 'bg-blue-500/10' : ''}
                      ${isMoneyOut ? 'bg-red-500/10' : ''}
                      ${!isRetirementYear && !isSSYear && !isMoneyOut ? 'hover:bg-slate-800/50' : ''}
                    `}
                  >
                    <td className="py-2 px-2">
                      <span className={`font-medium ${isRetirementYear ? 'text-emerald-400' : 'text-white'}`}>
                        {row.age}
                        {isRetirementYear && <span className="ml-1">🎉</span>}
                        {isSSYear && <span className="ml-1">🏛️</span>}
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
                      {row.ssIncome > 0 ? `$${Math.round(row.ssIncome).toLocaleString()}` : '-'}
                    </td>
                    <td className="py-2 px-2 text-right text-purple-400">
                      {row.otherIncome > 0 ? `$${Math.round(row.otherIncome).toLocaleString()}` : '-'}
                    </td>
                    <td className="py-2 px-2 text-right text-red-400">
                      {row.expenses > 0 ? `-$${Math.round(row.expenses).toLocaleString()}` : '-'}
                    </td>
                    <td className="py-2 px-2 text-right text-amber-400">
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
          <span className="text-slate-400">Retirement Year</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500/20 border border-blue-500/30 rounded"></div>
          <span className="text-slate-400">Social Security Start</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500/20 border border-red-500/30 rounded"></div>
          <span className="text-slate-400">Funds Depleted</span>
        </div>
      </div>
    </div>
  );
}
