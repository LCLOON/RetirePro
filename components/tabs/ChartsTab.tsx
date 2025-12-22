'use client';

import { Card } from '@/components/ui';
import { Button } from '@/components/ui';
import { useApp } from '@/lib/store';
import { formatCurrency } from '@/lib/calculations';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// Custom tooltip component for dark mode (defined outside component)
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
        <p className="text-white font-medium mb-2">Age {label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-slate-200">
            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export function ChartsTab() {
  const { state, runCalculations } = useApp();
  const { scenarioResults, monteCarloResults, retirementData } = state;
  
  if (!scenarioResults || !monteCarloResults) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-24 h-24 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-slate-700">
          <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Charts Available</h3>
        <p className="text-slate-400 mb-6 text-center max-w-md">
          Run calculations first to generate retirement projection charts.
        </p>
        <Button onClick={runCalculations} loading={state.isCalculating}>
          🚀 Run Calculations
        </Button>
      </div>
    );
  }
  
  // Prepare chart data with income/expense tracking
  const chartData = scenarioResults.expected.yearByYear.map((item, index) => ({
    age: retirementData.currentAge + index,
    year: new Date().getFullYear() + index,
    expected: Math.round(item.balance),
    optimistic: Math.round(scenarioResults.optimistic.yearByYear[index]?.balance || 0),
    pessimistic: Math.round(scenarioResults.pessimistic.yearByYear[index]?.balance || 0),
    contribution: Math.round(item.contribution),
    withdrawal: Math.round(item.withdrawal),
    income: Math.round(item.income),
  }));
  
  // Monte Carlo distribution data with colors
  const distributionData = [
    { percentile: '10th', value: monteCarloResults.percentile10, fill: '#EF4444' },
    { percentile: '25th', value: monteCarloResults.percentile25, fill: '#F59E0B' },
    { percentile: 'Median', value: monteCarloResults.median, fill: '#3B82F6' },
    { percentile: '75th', value: monteCarloResults.percentile75, fill: '#10B981' },
    { percentile: '90th', value: monteCarloResults.percentile90, fill: '#8B5CF6' },
  ];
  
  // Contribution vs growth breakdown
  const yearsToRetirement = retirementData.retirementAge - retirementData.currentAge;
  const currentSavings = retirementData.currentSavingsPreTax + retirementData.currentSavingsRoth + 
    retirementData.currentSavingsAfterTax + retirementData.currentHSA;
  const totalFutureContributions = (
    retirementData.annualContributionPreTax +
    retirementData.annualContributionRoth +
    retirementData.annualContributionAfterTax +
    retirementData.employerMatch +
    retirementData.annualHSAContribution
  ) * yearsToRetirement;
  const investmentGrowth = Math.max(0, scenarioResults.expected.atRetirement - currentSavings - totalFutureContributions);
  
  // Pie chart data for portfolio breakdown
  const portfolioBreakdown = [
    { name: 'Pre-Tax (401k/IRA)', value: retirementData.currentSavingsPreTax, color: '#3B82F6' },
    { name: 'Roth', value: retirementData.currentSavingsRoth, color: '#10B981' },
    { name: 'After-Tax/Brokerage', value: retirementData.currentSavingsAfterTax, color: '#8B5CF6' },
    { name: 'HSA', value: retirementData.currentHSA, color: '#F59E0B' },
    { name: 'Inherited IRA', value: retirementData.hasInheritedIRA ? retirementData.inheritedIRA.balance : 0, color: '#EC4899' },
  ].filter(item => item.value > 0);

  const wealthSourceData = [
    { name: 'Current Savings', value: currentSavings, color: '#3B82F6' },
    { name: 'Future Contributions', value: totalFutureContributions, color: '#10B981' },
    { name: 'Investment Growth', value: investmentGrowth, color: '#8B5CF6' },
  ];

  // Income sources at retirement
  const pensionAtRetirement = retirementData.hasPension && retirementData.retirementAge >= retirementData.pensionStartAge 
    ? retirementData.pensionIncome : 0;
  const additionalIncomeAtRetirement = retirementData.additionalIncome
    .filter(s => retirementData.retirementAge >= s.startAge && retirementData.retirementAge <= s.endAge)
    .reduce((sum, s) => sum + s.amount, 0);
  
  const incomeSourceData = [
    { name: 'Social Security', value: retirementData.socialSecurityBenefit, color: '#10B981' },
    { name: 'Pension', value: pensionAtRetirement, color: '#3B82F6' },
    { name: 'Additional Income', value: additionalIncomeAtRetirement, color: '#8B5CF6' },
    { name: 'Portfolio (SWR)', value: Math.round(scenarioResults.expected.atRetirement * retirementData.safeWithdrawalRate), color: '#F59E0B' },
  ].filter(item => item.value > 0);

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };
  
  return (
    <div className="space-y-6">
      {/* Header with Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl p-4 border border-emerald-500/30">
          <p className="text-emerald-400 text-sm font-medium">Success Rate</p>
          <p className="text-3xl font-bold text-white">{monteCarloResults.successRate.toFixed(0)}%</p>
          <p className="text-slate-400 text-xs">Monte Carlo</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-4 border border-blue-500/30">
          <p className="text-blue-400 text-sm font-medium">At Retirement</p>
          <p className="text-3xl font-bold text-white">{formatCurrency(scenarioResults.expected.atRetirement)}</p>
          <p className="text-slate-400 text-xs">Age {retirementData.retirementAge}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-4 border border-purple-500/30">
          <p className="text-purple-400 text-sm font-medium">Years Savings Last</p>
          <p className="text-3xl font-bold text-white">{scenarioResults.expected.yearsLast > 50 ? '50+' : scenarioResults.expected.yearsLast.toFixed(1)}</p>
          <p className="text-slate-400 text-xs">Expected scenario</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl p-4 border border-amber-500/30">
          <p className="text-amber-400 text-sm font-medium">Annual Income</p>
          <p className="text-3xl font-bold text-white">{formatCurrency(incomeSourceData.reduce((s, d) => s + d.value, 0))}</p>
          <p className="text-slate-400 text-xs">At retirement</p>
        </div>
      </div>

      {/* Portfolio Projection - Main Chart */}
      <Card title="📈 Portfolio Projection" subtitle="Balance over time under different market scenarios">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="optimisticGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="expectedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="pessimisticGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="age" 
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: '#475569' }}
              />
              <YAxis 
                tickFormatter={formatYAxis}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: '#475569' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ color: '#94a3b8' }}
                formatter={(value) => <span className="text-slate-300">{value}</span>}
              />
              <ReferenceLine 
                x={retirementData.retirementAge} 
                stroke="#a855f7" 
                strokeDasharray="5 5"
                strokeWidth={2}
              />
              <ReferenceLine 
                x={retirementData.socialSecurityStartAge} 
                stroke="#10b981" 
                strokeDasharray="3 3"
                strokeWidth={1}
              />
              <Area
                type="monotone"
                dataKey="optimistic"
                name="Optimistic (+2%)"
                stroke="#10B981"
                fill="url(#optimisticGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expected"
                name="Expected"
                stroke="#3B82F6"
                fill="url(#expectedGradient)"
                strokeWidth={3}
              />
              <Area
                type="monotone"
                dataKey="pessimistic"
                name="Pessimistic (-2%)"
                stroke="#EF4444"
                fill="url(#pessimisticGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4 text-sm text-slate-400">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
            Retirement (Age {retirementData.retirementAge})
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
            Social Security (Age {retirementData.socialSecurityStartAge})
          </span>
        </div>
      </Card>
      
      {/* Pie Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Portfolio Allocation */}
        <Card title="📊 Current Portfolio Allocation" subtitle="Breakdown by account type">
          <div className="h-80 flex items-center">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie
                  data={portfolioBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {portfolioBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-1/2 space-y-2">
              {portfolioBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-slate-300 text-sm">{item.name}</span>
                  </div>
                  <span className="text-white font-medium">{formatCurrency(item.value)}</span>
                </div>
              ))}
              <div className="border-t border-slate-600 pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Total</span>
                  <span className="text-emerald-400 font-bold">{formatCurrency(currentSavings)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Retirement Income Sources */}
        <Card title="💰 Retirement Income Sources" subtitle="Annual income at retirement">
          <div className="h-80 flex items-center">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie
                  data={incomeSourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {incomeSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-1/2 space-y-2">
              {incomeSourceData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-slate-300 text-sm">{item.name}</span>
                  </div>
                  <span className="text-white font-medium">{formatCurrency(item.value)}/yr</span>
                </div>
              ))}
              <div className="border-t border-slate-600 pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Total Annual</span>
                  <span className="text-emerald-400 font-bold">{formatCurrency(incomeSourceData.reduce((s, d) => s + d.value, 0))}/yr</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Monte Carlo & Wealth Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="🎲 Monte Carlo Results" subtitle="Distribution of ending portfolio values">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="percentile"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis 
                  tickFormatter={formatYAxis}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  name="Portfolio Value"
                  radius={[4, 4, 0, 0]}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card title="📈 Wealth Sources" subtitle="How your retirement wealth is built">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={wealthSourceData} 
                layout="vertical"
                margin={{ top: 10, right: 30, left: 120, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  type="number"
                  tickFormatter={formatYAxis}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[0, 4, 4, 0]}
                >
                  {wealthSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      {/* Success Probability Gauge */}
      <Card title="🎯 Success Rate Analysis" subtitle="Probability of not running out of money">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-8">
          <div className="relative w-48 h-48">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                className="text-slate-700"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
              <circle
                className={monteCarloResults.successRate >= 80 ? 'text-emerald-500' : 
                          monteCarloResults.successRate >= 50 ? 'text-amber-500' : 'text-red-500'}
                strokeWidth="10"
                strokeDasharray={`${monteCarloResults.successRate * 2.51327} 251.327`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${
                monteCarloResults.successRate >= 80 ? 'text-emerald-400' : 
                monteCarloResults.successRate >= 50 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {monteCarloResults.successRate.toFixed(0)}%
              </span>
              <span className="text-sm text-slate-400">Success Rate</span>
            </div>
          </div>
          
          <div className="space-y-4 text-center md:text-left">
            <div>
              <p className="text-slate-400 text-sm">Based on</p>
              <p className="text-white text-xl font-bold">{retirementData.monteCarloRuns.toLocaleString()} Simulations</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">With volatility of</p>
              <p className="text-white text-xl font-bold">{(retirementData.standardDeviation * 100).toFixed(0)}% Std Dev</p>
            </div>
            <div className={`inline-block px-4 py-2 rounded-lg ${
              monteCarloResults.successRate >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 
              monteCarloResults.successRate >= 50 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {monteCarloResults.successRate >= 80 ? '✅ On Track' : 
               monteCarloResults.successRate >= 50 ? '⚠️ Needs Attention' : '❌ At Risk'}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
