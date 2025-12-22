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
    state.retirementData.currentSavingsAfterTax;

  const yearsToRetirement = state.retirementData.retirementAge - state.retirementData.currentAge;
  const retirementLength = state.retirementData.lifeExpectancy - state.retirementData.retirementAge;
  const annualContribution = state.retirementData.annualContributionPreTax + 
    state.retirementData.annualContributionRoth + 
    state.retirementData.annualContributionAfterTax +
    state.retirementData.employerMatch;
  
  const successRate = state.monteCarloResults ? 
    Math.round(state.monteCarloResults.successRate) : null;
  
  const projectedAtRetirement = state.scenarioResults?.expected.atRetirement;
  
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
          icon="📊"
          label="Total Savings"
          value={formatCurrency(totalSavings)}
          color="emerald"
        />
        <StatCard
          icon="💵"
          label="Annual Savings"
          value={formatCurrency(annualContribution)}
          subValue="per year"
          color="blue"
        />
        <StatCard
          icon="⏱️"
          label="Years to Retire"
          value={`${yearsToRetirement}`}
          subValue={`Age ${state.retirementData.retirementAge}`}
          color="purple"
        />
        <StatCard
          icon="🎯"
          label="Retirement Length"
          value={`${retirementLength} yrs`}
          subValue={`To age ${state.retirementData.lifeExpectancy}`}
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
        <Card icon="💼" title="Account Summary" className="lg:col-span-2">
          <div className="space-y-3">
            {[
              { name: 'Pre-Tax (401k/IRA)', value: state.retirementData.currentSavingsPreTax, color: 'bg-blue-500' },
              { name: 'Roth', value: state.retirementData.currentSavingsRoth, color: 'bg-emerald-500' },
              { name: 'After-Tax / Brokerage', value: state.retirementData.currentSavingsAfterTax, color: 'bg-purple-500' },
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
