'use client';

import { Card, StatCard } from '@/components/ui';
import { Button } from '@/components/ui';
import { useApp } from '@/lib/store';

export function StartTab() {
  const { state, setActiveTab, loadFromLocalStorage, runCalculations } = useApp();
  
  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  // Calculate quick stats
  const totalSavings = state.retirementData.currentSavingsPreTax + 
    state.retirementData.currentSavingsRoth + 
    state.retirementData.currentSavingsAfterTax +
    (state.retirementData.hasInheritedIRA ? state.retirementData.inheritedIRA.balance : 0) +
    (state.retirementData.hasDividendPortfolio && state.retirementData.dividendPortfolio.includeInProjections ? state.retirementData.dividendPortfolio.currentValue : 0) +
    (state.retirementData.hasCryptoHoldings && state.retirementData.cryptoHoldings.includeInProjections ? state.retirementData.cryptoHoldings.currentValue : 0);

  const yearsToRetirement = state.retirementData.retirementAge - state.retirementData.currentAge;
  const retirementLength = state.retirementData.lifeExpectancy - state.retirementData.retirementAge;
  const annualContribution = state.retirementData.annualContributionPreTax + 
    state.retirementData.annualContributionRoth + 
    state.retirementData.annualContributionAfterTax +
    state.retirementData.employerMatch;
  
  const successRate = state.monteCarloResults ? 
    Math.round(state.monteCarloResults.successRate) : null;
  
  const projectedAtRetirement = state.scenarioResults?.expected.atRetirement;

  // Calculate Real Estate & Mortgage KPIs
  const mortgageData = state.mortgageData;
  const totalPropertyValue = mortgageData.mortgages.reduce((sum, m) => sum + m.currentHomeValue, 0);
  const totalMortgageBalance = mortgageData.mortgages.reduce((sum, m) => sum + m.currentBalance, 0);
  const totalHomeEquity = totalPropertyValue - totalMortgageBalance;
  const totalMonthlyMortgage = mortgageData.mortgages.reduce((sum, m) => {
    // Calculate monthly payment: P * (r(1+r)^n) / ((1+r)^n - 1)
    const monthlyRate = m.interestRate / 12;
    const numPayments = m.loanTermYears * 12;
    const yearsElapsed = new Date().getFullYear() - m.startYear;
    const paymentsRemaining = Math.max(0, numPayments - (yearsElapsed * 12));
    if (paymentsRemaining === 0 || monthlyRate === 0) return sum;
    const payment = m.currentBalance * (monthlyRate * Math.pow(1 + monthlyRate, paymentsRemaining)) / (Math.pow(1 + monthlyRate, paymentsRemaining) - 1);
    return sum + (isNaN(payment) ? 0 : payment) + (m.propertyTax / 12) + (m.insurance / 12) + m.hoaFees + m.pmi;
  }, 0);

  // Calculate Net Worth KPIs
  const netWorthData = state.netWorthData;
  const propertyAssets = netWorthData.properties.reduce((sum, p) => sum + p.currentValue, 0);
  const propertyMortgages = netWorthData.properties.reduce((sum, p) => sum + p.mortgageBalance, 0);
  const vehicleAssets = netWorthData.vehicles.reduce((sum, v) => sum + v.currentValue, 0);
  const vehicleLoans = netWorthData.vehicles.reduce((sum, v) => sum + v.loanBalance, 0);
  const bankAccounts = netWorthData.bankAccounts.reduce((sum, a) => sum + a.balance, 0);
  const brokerageAccounts = netWorthData.brokerageAccounts.reduce((sum, a) => sum + a.balance, 0);
  const cryptoAssets = netWorthData.cryptoHoldings.reduce((sum, c) => sum + c.currentValue, 0);
  const otherDebts = netWorthData.debts.reduce((sum, d) => sum + d.balance, 0);
  
  // Use mortgage tab data for real estate if net worth doesn't have it
  const realEstateValue = propertyAssets > 0 ? propertyAssets : totalPropertyValue;
  const realEstateMortgage = propertyMortgages > 0 ? propertyMortgages : totalMortgageBalance;
  
  const totalAssets = realEstateValue + vehicleAssets + bankAccounts + brokerageAccounts + cryptoAssets + totalSavings;
  const totalLiabilities = realEstateMortgage + vehicleLoans + otherDebts;
  const netWorth = totalAssets - totalLiabilities;

  // Calculate Budget KPIs
  const budgetData = state.budgetData;
  const totalIncome = Object.values(budgetData.income).reduce((sum, val) => sum + val, 0);
  const totalFixedExpenses = Object.values(budgetData.fixedExpenses).reduce((sum, val) => sum + val, 0);
  const totalDebtPayments = Object.values(budgetData.debtPayments).reduce((sum, val) => sum + val, 0);
  const totalSubscriptions = Object.values(budgetData.subscriptions).reduce((sum, val) => sum + val, 0);
  const totalVariableExpenses = Object.values(budgetData.variableExpenses).reduce((sum, val) => sum + val, 0);
  const totalBudgetSavings = Object.values(budgetData.savings).reduce((sum, val) => sum + val, 0);
  const totalExpenses = totalFixedExpenses + totalDebtPayments + totalSubscriptions + totalVariableExpenses;
  const monthlyCashflow = totalIncome - totalExpenses - totalBudgetSavings;
  const savingsRate = totalIncome > 0 ? ((totalBudgetSavings / totalIncome) * 100) : 0;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            📈 Portfolio Overview & Analytics
          </h1>
          <p className="text-slate-400 text-sm mt-1">Your retirement planning dashboard</p>
        </div>
        <Button
          variant="primary"
          onClick={runCalculations}
          loading={state.isCalculating}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-0"
        >
          📊 Run Analysis
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard
          icon="�"
          label="Net Worth"
          value={formatCurrency(netWorth)}
          subValue={netWorth > 0 ? 'Total' : ''}
          color="emerald"
        />
        <StatCard
          icon="📊"
          label="Investments"
          value={formatCurrency(totalSavings)}
          color="blue"
        />
        <StatCard
          icon="🏠"
          label="Home Equity"
          value={formatCurrency(totalHomeEquity)}
          subValue={totalPropertyValue > 0 ? `of ${formatCurrency(totalPropertyValue)}` : ''}
          color="purple"
        />
        <StatCard
          icon="⏱️"
          label="Years to Retire"
          value={`${yearsToRetirement}`}
          subValue={`Age ${state.retirementData.retirementAge}`}
          color="amber"
        />
        {successRate !== null && (
          <StatCard
            icon="🏆"
            label="Success Rate"
            value={`${successRate}%`}
            subValue={successRate >= 80 ? 'Excellent' : successRate >= 60 ? 'Good' : 'Needs Work'}
            color={successRate >= 80 ? 'emerald' : successRate >= 60 ? 'amber' : 'red'}
          />
        )}
        {projectedAtRetirement && (
          <StatCard
            icon="🚀"
            label="At Retirement"
            value={formatCurrency(projectedAtRetirement)}
            subValue="Projected"
            color="blue"
          />
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card icon="⚡" title="Quick Actions" className="lg:col-span-1">
          <div className="space-y-3">
            <button
              onClick={() => setActiveTab('social')}
              className="w-full flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-left"
            >
              <span className="text-xl">🏛️</span>
              <div>
                <p className="text-sm font-medium text-white">Social Security</p>
                <p className="text-xs text-slate-400">Start here first</p>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('data')}
              className="w-full flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-left"
            >
              <span className="text-xl">📝</span>
              <div>
                <p className="text-sm font-medium text-white">Enter Data</p>
                <p className="text-xs text-slate-400">Update your financial info</p>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('results')}
              className="w-full flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-left"
            >
              <span className="text-xl">📊</span>
              <div>
                <p className="text-sm font-medium text-white">View Results</p>
                <p className="text-xs text-slate-400">See your projections</p>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('charts')}
              className="w-full flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-left"
            >
              <span className="text-xl">📉</span>
              <div>
                <p className="text-sm font-medium text-white">View Charts</p>
                <p className="text-xs text-slate-400">Visualize your journey</p>
              </div>
            </button>

            <button
              onClick={loadFromLocalStorage}
              className="w-full flex items-center gap-3 p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors text-left"
            >
              <span className="text-xl">💾</span>
              <div>
                <p className="text-sm font-medium text-emerald-400">Load Saved Data</p>
                <p className="text-xs text-slate-400">Continue where you left off</p>
              </div>
            </button>
          </div>
        </Card>

        {/* Account Allocation */}
        <Card icon="💼" title="Investment Accounts" className="lg:col-span-2">
          <div className="space-y-3">
            {[
              { name: 'Pre-Tax (401k/IRA)', value: state.retirementData.currentSavingsPreTax, color: 'bg-blue-500' },
              { name: 'Roth', value: state.retirementData.currentSavingsRoth, color: 'bg-emerald-500' },
              { name: 'After-Tax / Brokerage', value: state.retirementData.currentSavingsAfterTax, color: 'bg-purple-500' },
              { name: 'Inherited IRA', value: state.retirementData.hasInheritedIRA ? state.retirementData.inheritedIRA.balance : 0, color: 'bg-amber-500' },
              { name: 'Dividend Portfolio', value: state.retirementData.hasDividendPortfolio ? state.retirementData.dividendPortfolio.currentValue : 0, color: 'bg-cyan-500' },
              { name: 'Cryptocurrency', value: state.retirementData.hasCryptoHoldings ? state.retirementData.cryptoHoldings.currentValue : 0, color: 'bg-orange-500' },
            ].filter(acc => acc.value > 0).map((account, idx) => {
              const percentage = totalSavings > 0 ? (account.value / totalSavings) * 100 : 0;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${account.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white truncate">{account.name}</span>
                      <span className="text-sm font-medium text-white">{formatCurrency(account.value)}</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${account.color} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 w-12 text-right">{percentage.toFixed(1)}%</span>
                </div>
              );
            })}
            {totalSavings === 0 && (
              <div className="text-center py-8 text-slate-400">
                <p className="text-lg mb-2">No accounts configured yet</p>
                <button
                  onClick={() => setActiveTab('data')}
                  className="text-emerald-400 hover:text-emerald-300 text-sm"
                >
                  Add your accounts →
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Net Worth & Real Estate Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Net Worth Breakdown */}
        <Card icon="🏆" title="Net Worth Breakdown">
          <div className="space-y-4">
            {/* Assets */}
            <div>
              <h4 className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-2">
                📈 Assets
                <span className="text-emerald-300 font-bold ml-auto">{formatCurrency(totalAssets)}</span>
              </h4>
              <div className="space-y-2 pl-2">
                {[
                  { name: 'Investment Accounts', value: totalSavings, color: 'text-blue-400' },
                  { name: 'Real Estate', value: realEstateValue, color: 'text-purple-400' },
                  { name: 'Vehicles', value: vehicleAssets, color: 'text-amber-400' },
                  { name: 'Bank Accounts', value: bankAccounts, color: 'text-cyan-400' },
                  { name: 'Brokerage', value: brokerageAccounts, color: 'text-green-400' },
                  { name: 'Crypto', value: cryptoAssets, color: 'text-orange-400' },
                ].filter(item => item.value > 0).map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-400">{item.name}</span>
                    <span className={item.color}>{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Liabilities */}
            <div>
              <h4 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
                📉 Liabilities
                <span className="text-red-300 font-bold ml-auto">-{formatCurrency(totalLiabilities)}</span>
              </h4>
              <div className="space-y-2 pl-2">
                {[
                  { name: 'Mortgage', value: realEstateMortgage, color: 'text-red-400' },
                  { name: 'Vehicle Loans', value: vehicleLoans, color: 'text-red-400' },
                  { name: 'Other Debts', value: otherDebts, color: 'text-red-400' },
                ].filter(item => item.value > 0).map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-400">{item.name}</span>
                    <span className={item.color}>-{formatCurrency(item.value)}</span>
                  </div>
                ))}
                {totalLiabilities === 0 && (
                  <div className="text-sm text-slate-500">No debts - nice! 🎉</div>
                )}
              </div>
            </div>

            {/* Net Worth Total */}
            <div className="pt-3 border-t border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-white">Net Worth</span>
                <span className={`text-xl font-bold ${netWorth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(netWorth)}
                </span>
              </div>
              {totalLiabilities > 0 && (
                <div className="text-xs text-slate-500 mt-1">
                  Debt-to-Asset Ratio: {((totalLiabilities / totalAssets) * 100).toFixed(1)}%
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Monthly Budget Summary */}
        <Card icon="💵" title="Monthly Budget">
          {totalIncome > 0 ? (
            <div className="space-y-4">
              {/* Income */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">💰 Monthly Income</span>
                <span className="text-emerald-400 font-bold">${totalIncome.toLocaleString()}</span>
              </div>

              {/* Expense Breakdown */}
              <div className="space-y-2">
                {[
                  { name: '🏠 Fixed Expenses', value: totalFixedExpenses, color: 'text-blue-400' },
                  { name: '💳 Debt Payments', value: totalDebtPayments, color: 'text-red-400' },
                  { name: '📺 Subscriptions', value: totalSubscriptions, color: 'text-purple-400' },
                  { name: '🛒 Variable', value: totalVariableExpenses, color: 'text-amber-400' },
                ].filter(item => item.value > 0).map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-400">{item.name}</span>
                    <span className={item.color}>-${item.value.toLocaleString()}</span>
                  </div>
                ))}
                {/* Total Expenses */}
                <div className="flex justify-between text-sm pt-1 border-t border-slate-700">
                  <span className="text-white font-medium">📊 Total Expenses</span>
                  <span className="text-red-400 font-bold">-${totalExpenses.toLocaleString()}</span>
                </div>
                {/* Savings - separate from expenses */}
                <div className="flex justify-between text-sm pt-1">
                  <span className="text-slate-400">💎 Savings</span>
                  <span className="text-emerald-400">-${totalBudgetSavings.toLocaleString()}</span>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-2 pt-2">
                {/* Expenses vs Income */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Expenses</span>
                    <span className="text-slate-300">{((totalExpenses / totalIncome) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 rounded-full"
                      style={{ width: `${Math.min((totalExpenses / totalIncome) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                {/* Savings Rate */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Savings Rate</span>
                    <span className={savingsRate >= 20 ? 'text-emerald-400' : savingsRate >= 10 ? 'text-amber-400' : 'text-red-400'}>
                      {savingsRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${savingsRate >= 20 ? 'bg-emerald-500' : savingsRate >= 10 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(savingsRate, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Cash Flow */}
              <div className="pt-3 border-t border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Monthly Cash Flow</span>
                  <span className={`text-lg font-bold ${monthlyCashflow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {monthlyCashflow >= 0 ? '+' : ''}{monthlyCashflow.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                  </span>
                </div>
                {savingsRate >= 20 && (
                  <div className="text-xs text-emerald-500 mt-1">🎯 Great savings rate! 20%+ is excellent</div>
                )}
                {savingsRate >= 10 && savingsRate < 20 && (
                  <div className="text-xs text-amber-500 mt-1">📈 Good progress! Aim for 20%+ savings</div>
                )}
                {savingsRate < 10 && savingsRate > 0 && (
                  <div className="text-xs text-red-400 mt-1">⚠️ Try to increase savings rate to 10%+</div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p className="text-lg mb-2">💵 No budget configured</p>
              <button
                onClick={() => setActiveTab('budget')}
                className="text-emerald-400 hover:text-emerald-300 text-sm"
              >
                Set up your budget →
              </button>
            </div>
          )}
        </Card>
      </div>

      {/* Real Estate Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real Estate Summary */}
        <Card icon="🏠" title="Real Estate & Mortgage" className="lg:col-span-2">
          {mortgageData.mortgages.length > 0 ? (
            <div className="space-y-4">
              {mortgageData.mortgages.map((mortgage, idx) => {
                const equity = mortgage.currentHomeValue - mortgage.currentBalance;
                const equityPercent = mortgage.currentHomeValue > 0 ? (equity / mortgage.currentHomeValue) * 100 : 0;
                return (
                  <div key={idx} className="p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{mortgage.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-600 text-slate-300">
                        {mortgage.propertyType}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-400 text-xs">Value</span>
                        <p className="text-emerald-400 font-medium">{formatCurrency(mortgage.currentHomeValue)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-xs">Owed</span>
                        <p className="text-red-400 font-medium">{formatCurrency(mortgage.currentBalance)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-xs">Equity</span>
                        <p className="text-blue-400 font-medium">{formatCurrency(equity)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-xs">Equity %</span>
                        <p className="text-purple-400 font-medium">{equityPercent.toFixed(1)}%</p>
                      </div>
                    </div>
                    {/* Equity Progress Bar */}
                    <div className="mt-2">
                      <div className="h-2 bg-red-500/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${equityPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-emerald-400">Owned</span>
                        <span className="text-red-400">Owed</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Totals */}
              {mortgageData.mortgages.length > 1 && (
                <div className="pt-3 border-t border-slate-700 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <span className="text-xs text-slate-400">Total Value</span>
                    <p className="text-emerald-400 font-bold">{formatCurrency(totalPropertyValue)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Total Owed</span>
                    <p className="text-red-400 font-bold">{formatCurrency(totalMortgageBalance)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Total Equity</span>
                    <p className="text-blue-400 font-bold">{formatCurrency(totalHomeEquity)}</p>
                  </div>
                </div>
              )}

              {/* Monthly Payment */}
              {totalMonthlyMortgage > 0 && (
                <div className="pt-3 border-t border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Est. Monthly Payment (PITI)</span>
                    <span className="text-lg font-bold text-amber-400">${Math.round(totalMonthlyMortgage).toLocaleString()}/mo</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p className="text-lg mb-2">🏠 No properties configured</p>
              <button
                onClick={() => setActiveTab('mortgage')}
                className="text-emerald-400 hover:text-emerald-300 text-sm"
              >
                Add your property →
              </button>
            </div>
          )}
        </Card>
      </div>

      {/* Features Grid */}
      <Card icon="🛠️" title="RetirePro Features">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: '🎲', name: 'Monte Carlo', desc: '1000+ simulations', tab: 'results' as const },
            { icon: '🏛️', name: 'Social Security', desc: 'Optimize claiming', tab: 'social' as const },
            { icon: '💰', name: 'Tax Planning', desc: 'Tax-efficient strategies', tab: 'tax' as const },
            { icon: '🏆', name: 'Net Worth', desc: 'Track your wealth', tab: 'worth' as const },
            { icon: '🏠', name: 'Mortgage', desc: 'Payment calculator', tab: 'mortgage' as const },
            { icon: '📋', name: 'Budget', desc: 'Expense tracking', tab: 'budget' as const },
          ].map((feature, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(feature.tab)}
              className="flex items-center gap-3 p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors text-left"
            >
              <span className="text-2xl">{feature.icon}</span>
              <div>
                <p className="text-sm font-medium text-white">{feature.name}</p>
                <p className="text-xs text-slate-400">{feature.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
