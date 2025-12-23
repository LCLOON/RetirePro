'use client';

import { useApp } from '@/lib/store';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function AnalysisTab() {
  const { state } = useApp();
  const data = state.retirementData;
  const results = state.monteCarloResults;
  const scenarioResults = state.scenarioResults;

  // Helper to calculate total additional income at a given age (with inflation adjustment)
  const getAdditionalIncomeAtAge = (age: number) => {
    return data.additionalIncome
      .filter(source => age >= source.startAge && age <= source.endAge)
      .reduce((sum, source) => {
        if (source.adjustForInflation) {
          const yearsFromStart = age - source.startAge;
          return sum + source.amount * Math.pow(1 + data.inflationRate, yearsFromStart);
        }
        return sum + source.amount;
      }, 0);
  };

  // Total additional income at retirement age
  const totalAdditionalIncome = getAdditionalIncomeAtAge(data.retirementAge);

  // Calculate Social Security income at retirement (only if at/past claiming age)
  const ssCOLA = data.inflationRate || 0.025;
  const getSocialSecurityAtAge = (age: number) => {
    // Your SS
    let yourSS = 0;
    if (age >= data.socialSecurityStartAge) {
      const yearsSinceClaim = age - data.socialSecurityStartAge;
      yourSS = data.socialSecurityBenefit * Math.pow(1 + ssCOLA, yearsSinceClaim);
    }
    // Spouse SS
    let spouseSS = 0;
    if (data.hasSpouse && age >= (data.spouseSocialSecurityStartAge || 67)) {
      const yearsSinceSpouseClaim = age - (data.spouseSocialSecurityStartAge || 67);
      spouseSS = (data.spouseSocialSecurityBenefit || 0) * Math.pow(1 + ssCOLA, yearsSinceSpouseClaim);
    }
    return yourSS + spouseSS;
  };
  const totalSocialSecurityAtRetirement = getSocialSecurityAtAge(data.retirementAge);

  // Calculate key metrics
  const yearsToRetirement = Math.max(0, data.retirementAge - data.currentAge);
  const yearsInRetirement = data.lifeExpectancy - data.retirementAge;
  const totalSavings = data.currentSavingsPreTax + data.currentSavingsRoth + data.currentSavingsAfterTax + data.currentHSA +
    (data.hasInheritedIRA ? data.inheritedIRA.currentValue : 0) +
    (data.hasDividendPortfolio && data.dividendPortfolio.includeInProjections ? data.dividendPortfolio.currentValue : 0) +
    (data.hasCryptoHoldings && data.cryptoHoldings.includeInProjections ? data.cryptoHoldings.currentValue : 0);
  const totalContributions = data.annualContributionPreTax + data.annualContributionRoth + data.annualContributionAfterTax + data.employerMatch + data.annualHSAContribution;
  
  // Future value calculations (rates are already decimals: 0.07 = 7%)
  const rate = data.preRetirementReturn;
  const futureValue = rate > 0 
    ? totalSavings * Math.pow(1 + rate, yearsToRetirement) +
      totalContributions * ((Math.pow(1 + rate, yearsToRetirement) - 1) / rate)
    : totalSavings + totalContributions * yearsToRetirement;
  
  const pensionAtRetirement = data.hasPension && data.retirementAge >= data.pensionStartAge ? data.pensionIncome : 0;
  const incomeGap = data.retirementExpenses - (totalSocialSecurityAtRetirement + pensionAtRetirement + totalAdditionalIncome);
  // safeWithdrawalRate is already decimal (0.04 = 4%)
  const savingsNeeded = incomeGap > 0 && data.safeWithdrawalRate > 0 ? incomeGap / data.safeWithdrawalRate : 0;
  
  // Readiness score - use scenario results if available for more accuracy
  const projectedAtRetirement = scenarioResults?.expected.atRetirement || futureValue;
  const readinessScore = savingsNeeded > 0 
    ? Math.min(100, Math.round((projectedAtRetirement / savingsNeeded) * 100)) 
    : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🔍</span>
            Retirement Analysis
          </h1>
          <p className="text-slate-400 mt-1">Comprehensive analysis of your retirement readiness</p>
        </div>
        <Button variant="primary" onClick={() => window.print()}>
          📊 Print Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Readiness Score"
          value={`${readinessScore}%`}
          icon="🎯"
          color={readinessScore >= 80 ? 'emerald' : readinessScore >= 50 ? 'amber' : 'red'}
          subtitle={readinessScore >= 80 ? 'On Track' : readinessScore >= 50 ? 'Needs Attention' : 'At Risk'}
        />
        <StatCard
          label="Projected Savings"
          value={`$${Math.round(projectedAtRetirement).toLocaleString()}`}
          icon="💰"
          color="blue"
          subtitle={`At age ${data.retirementAge}`}
        />
        <StatCard
          label="Annual Income Gap"
          value={`$${Math.round(Math.max(0, incomeGap)).toLocaleString()}`}
          icon="📉"
          color={incomeGap <= 0 ? 'emerald' : 'amber'}
          subtitle={incomeGap <= 0 ? 'No gap - covered!' : 'From savings needed'}
        />
        <StatCard
          label="Success Probability"
          value={results ? `${results.successRate.toFixed(0)}%` : 'Run Simulation'}
          icon="📈"
          color={results && results.successRate >= 80 ? 'emerald' : 'amber'}
          subtitle="Monte Carlo result"
        />
      </div>

      {/* Analysis Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retirement Timeline */}
        <Card title="📅 Retirement Timeline" icon="📅">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎂</span>
                <div>
                  <p className="text-white font-medium">Current Age</p>
                  <p className="text-slate-400 text-sm">Where you are now</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-white">{data.currentAge}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <p className="text-emerald-400 font-medium">Retirement Age</p>
                  <p className="text-slate-400 text-sm">{yearsToRetirement} years away</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-emerald-400">{data.retirementAge}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏛️</span>
                <div>
                  <p className="text-white font-medium">Social Security Start</p>
                  <p className="text-slate-400 text-sm">Claiming age</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-white">{data.socialSecurityStartAge}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <p className="text-white font-medium">Plan Horizon</p>
                  <p className="text-slate-400 text-sm">Life expectancy</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-white">{data.lifeExpectancy}</span>
            </div>
          </div>
        </Card>

        {/* Income Analysis */}
        <Card title="💵 Retirement Income Analysis" icon="💵">
          <div className="space-y-4">
            {/* Income vs Expenses Progress Bar */}
            {(() => {
              const totalIncome = Math.round(totalSocialSecurityAtRetirement + pensionAtRetirement + totalAdditionalIncome + futureValue * data.safeWithdrawalRate);
              const coveragePercent = Math.min((totalIncome / data.retirementExpenses) * 100, 100);
              const surplus = totalIncome - data.retirementExpenses;
              const isFullyCovered = surplus >= 0;
              
              return (
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400">Income Coverage</span>
                    <span className={`font-semibold ${isFullyCovered ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {coveragePercent.toFixed(0)}% of expenses
                    </span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-3 relative">
                    <div 
                      className={`h-3 rounded-full transition-all ${isFullyCovered ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                      style={{ width: `${coveragePercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-slate-400">
                      Need: <span className="text-white">${data.retirementExpenses.toLocaleString()}/yr</span>
                    </span>
                    <span className={isFullyCovered ? 'text-emerald-400' : 'text-amber-400'}>
                      {isFullyCovered 
                        ? `+$${surplus.toLocaleString()} surplus` 
                        : `-$${Math.abs(surplus).toLocaleString()} shortfall`}
                    </span>
                  </div>
                </div>
              );
            })()}
            
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-emerald-500/10 rounded">
                <span className="text-slate-300">Social Security{data.hasSpouse ? ' (Combined)' : ''}</span>
                <span className="text-emerald-400">${Math.round(totalSocialSecurityAtRetirement).toLocaleString()}/yr</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-blue-500/10 rounded">
                <span className="text-slate-300">Pension</span>
                <span className="text-blue-400">${pensionAtRetirement.toLocaleString()}/yr</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-purple-500/10 rounded">
                <span className="text-slate-300">Additional Income ({data.additionalIncome.length} sources)</span>
                <span className="text-purple-400">${totalAdditionalIncome.toLocaleString()}/yr</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-amber-500/10 rounded">
                <span className="text-slate-300">Portfolio Withdrawal</span>
                <span className="text-amber-400">${Math.round(futureValue * data.safeWithdrawalRate).toLocaleString()}/yr</span>
              </div>
            </div>

            <div className="border-t border-slate-600 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Total Annual Income</span>
                <span className="text-2xl font-bold text-emerald-400">
                  ${Math.round(totalSocialSecurityAtRetirement + pensionAtRetirement + totalAdditionalIncome + futureValue * data.safeWithdrawalRate).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Scenario Comparison */}
        <Card title="🎲 Scenario Analysis" icon="🎲">
          {scenarioResults ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                  <p className="text-red-400 text-sm">Pessimistic</p>
                  <p className="text-white font-bold text-lg">${Math.round(scenarioResults.pessimistic.atRetirement).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center">
                  <p className="text-emerald-400 text-sm">Expected</p>
                  <p className="text-white font-bold text-lg">${Math.round(scenarioResults.expected.atRetirement).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
                  <p className="text-blue-400 text-sm">Optimistic</p>
                  <p className="text-white font-bold text-lg">${Math.round(scenarioResults.optimistic.atRetirement).toLocaleString()}</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm text-center">
                Projected portfolio value at retirement under different market conditions
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-4">Run calculations to see scenario analysis</p>
              <Button variant="secondary">Run Calculations</Button>
            </div>
          )}
        </Card>

        {/* Risk Assessment */}
        <Card title="⚠️ Risk Assessment" icon="⚠️">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${data.inflationRate * 100 > 3 ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
              <div className="flex-1">
                <p className="text-white">Inflation Risk</p>
                <p className="text-slate-400 text-sm">Assumed rate: {(data.inflationRate * 100).toFixed(1)}%</p>
              </div>
              <span className={data.inflationRate * 100 > 3 ? 'text-amber-400' : 'text-emerald-400'}>
                {data.inflationRate * 100 > 3 ? 'Moderate' : 'Low'}
              </span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${data.standardDeviation * 100 > 15 ? 'bg-red-500' : data.standardDeviation * 100 > 10 ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
              <div className="flex-1">
                <p className="text-white">Market Volatility</p>
                <p className="text-slate-400 text-sm">Std deviation: {(data.standardDeviation * 100).toFixed(0)}%</p>
              </div>
              <span className={data.standardDeviation * 100 > 15 ? 'text-red-400' : data.standardDeviation * 100 > 10 ? 'text-amber-400' : 'text-emerald-400'}>
                {data.standardDeviation * 100 > 15 ? 'High' : data.standardDeviation * 100 > 10 ? 'Moderate' : 'Low'}
              </span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${yearsInRetirement > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
              <div className="flex-1">
                <p className="text-white">Longevity Risk</p>
                <p className="text-slate-400 text-sm">{yearsInRetirement} years in retirement</p>
              </div>
              <span className={yearsInRetirement > 30 ? 'text-amber-400' : 'text-emerald-400'}>
                {yearsInRetirement > 30 ? 'High' : 'Moderate'}
              </span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${data.safeWithdrawalRate * 100 > 4 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
              <div className="flex-1">
                <p className="text-white">Withdrawal Risk</p>
                <p className="text-slate-400 text-sm">Rate: {(data.safeWithdrawalRate * 100).toFixed(1)}%</p>
              </div>
              <span className={data.safeWithdrawalRate * 100 > 4 ? 'text-red-400' : 'text-emerald-400'}>
                {data.safeWithdrawalRate * 100 > 4 ? 'High' : 'Safe'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      <Card title="💡 Personalized Recommendations" icon="💡">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {readinessScore < 80 && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">📈</span>
                <h4 className="text-amber-400 font-medium">Increase Savings</h4>
              </div>
              <p className="text-slate-300 text-sm">Consider increasing your monthly contributions by ${Math.round((savingsNeeded - futureValue) / yearsToRetirement / 12).toLocaleString()} to reach your goal.</p>
            </div>
          )}
          
          {data.safeWithdrawalRate * 100 > 4 && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">⚠️</span>
                <h4 className="text-red-400 font-medium">Reduce Withdrawal Rate</h4>
              </div>
              <p className="text-slate-300 text-sm">Your withdrawal rate of {(data.safeWithdrawalRate * 100).toFixed(1)}% may be too aggressive. Consider reducing to 4% or less for 30+ year retirements.</p>
            </div>
          )}
          
          {data.socialSecurityStartAge < 67 && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🏛️</span>
                <h4 className="text-blue-400 font-medium">Consider Delaying Social Security</h4>
              </div>
              <p className="text-slate-300 text-sm">Claiming at {data.socialSecurityStartAge} reduces benefits by ~{Math.round((67 - data.socialSecurityStartAge) * 6.67)}%. Waiting to 70 maximizes lifetime benefits if you live past ~82.</p>
            </div>
          )}
          
          {data.currentSavingsRoth < data.currentSavingsPreTax * 0.3 && data.currentSavingsPreTax > 100000 && (
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">💰</span>
                <h4 className="text-purple-400 font-medium">Consider Roth Conversions</h4>
              </div>
              <p className="text-slate-300 text-sm">Your pre-tax balance is high relative to Roth. Strategic Roth conversions could reduce future RMDs and provide tax-free income.</p>
            </div>
          )}
          
          {yearsToRetirement <= 10 && data.standardDeviation * 100 > 15 && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🎯</span>
                <h4 className="text-amber-400 font-medium">Reduce Portfolio Risk</h4>
              </div>
              <p className="text-slate-300 text-sm">With {yearsToRetirement} years to retirement and {(data.standardDeviation * 100).toFixed(0)}% volatility, consider shifting toward more conservative investments.</p>
            </div>
          )}
          
          {yearsInRetirement > 30 && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">📅</span>
                <h4 className="text-blue-400 font-medium">Plan for Longevity</h4>
              </div>
              <p className="text-slate-300 text-sm">With {yearsInRetirement} years in retirement, use a conservative 3.5% withdrawal rate and maintain growth investments.</p>
            </div>
          )}
          
          {!data.hasDividendPortfolio && totalSavings > 200000 && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">💹</span>
                <h4 className="text-emerald-400 font-medium">Consider Dividend Income</h4>
              </div>
              <p className="text-slate-300 text-sm">Dividend-paying stocks can provide reliable income without selling shares. A 3% yield on ${totalSavings.toLocaleString()} = ${Math.round(totalSavings * 0.03).toLocaleString()}/yr.</p>
            </div>
          )}
          
          {data.currentHSA < 50000 && data.currentAge < 65 && (
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🏥</span>
                <h4 className="text-purple-400 font-medium">Maximize HSA</h4>
              </div>
              <p className="text-slate-300 text-sm">HSA offers triple tax benefits. Max contributions ($4,150 single / $8,300 family + $1,000 catch-up) and invest for retirement healthcare costs.</p>
            </div>
          )}
          
          <div className="p-4 bg-slate-500/10 border border-slate-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📝</span>
              <h4 className="text-slate-300 font-medium">Review Annually</h4>
            </div>
            <p className="text-slate-400 text-sm">Update your retirement plan annually to account for changes in income, expenses, markets, and life goals.</p>
          </div>
        </div>
      </Card>

      {/* Key Milestones */}
      <Card title="📅 Key Retirement Milestones" icon="📅">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { age: 50, label: 'Catch-up Eligible', desc: '+$7,500 401k, +$1,000 IRA', icon: '💰', active: data.currentAge >= 50 },
            { age: 55, label: 'HSA Catch-up', desc: '+$1,000 HSA contribution', icon: '🏥', active: data.currentAge >= 55 },
            { age: 59.5, label: 'Penalty-Free', desc: '401k/IRA withdrawals OK', icon: '🔓', active: data.currentAge >= 59.5 },
            { age: 62, label: 'Early SS', desc: 'Earliest claiming age', icon: '🏛️', active: data.currentAge >= 62 },
            { age: 65, label: 'Medicare', desc: 'Health coverage begins', icon: '⚕️', active: data.currentAge >= 65 },
            { age: data.retirementAge, label: 'Retirement', desc: 'Your target date', icon: '🎉', active: data.currentAge >= data.retirementAge, highlight: true },
            { age: 67, label: 'FRA', desc: 'Full SS benefits', icon: '✅', active: data.currentAge >= 67 },
            { age: 70, label: 'Max SS', desc: '124% of FRA benefit', icon: '🏆', active: data.currentAge >= 70 },
            { age: 73, label: 'RMDs Begin', desc: 'Required distributions', icon: '📋', active: data.currentAge >= 73 },
          ].map((milestone) => (
            <div 
              key={milestone.age}
              className={`p-3 rounded-lg text-center transition-all ${
                milestone.highlight 
                  ? 'bg-emerald-500/20 border-2 border-emerald-500/50' 
                  : milestone.active 
                    ? 'bg-slate-700/50 border border-emerald-500/30' 
                    : 'bg-slate-800/50 border border-slate-700/50'
              }`}
            >
              <div className="text-2xl mb-1">{milestone.icon}</div>
              <div className={`text-lg font-bold ${milestone.active ? 'text-emerald-400' : 'text-white'}`}>
                {milestone.age === 59.5 ? '59½' : milestone.age}
              </div>
              <div className="text-xs text-slate-300 font-medium">{milestone.label}</div>
              <div className="text-xs text-slate-500">{milestone.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
