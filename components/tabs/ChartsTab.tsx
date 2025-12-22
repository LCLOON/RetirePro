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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

export function ChartsTab() {
  const { state, runCalculations } = useApp();
  const { scenarioResults, monteCarloResults, retirementData } = state;
  
  if (!scenarioResults || !monteCarloResults) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Charts Available</h3>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Run calculations first to generate retirement projection charts.
        </p>
        <Button onClick={runCalculations} loading={state.isCalculating}>
          Run Calculations
        </Button>
      </div>
    );
  }
  
  // Prepare chart data
  const chartData = scenarioResults.expected.yearByYear.map((item, index) => ({
    age: retirementData.currentAge + index,
    year: new Date().getFullYear() + index,
    expected: item.balance,
    optimistic: scenarioResults.optimistic.yearByYear[index]?.balance || 0,
    pessimistic: scenarioResults.pessimistic.yearByYear[index]?.balance || 0,
  }));
  
  // Monte Carlo distribution data
  const distributionData = [
    { percentile: '10th', value: monteCarloResults.percentile10 },
    { percentile: '25th', value: monteCarloResults.percentile25 },
    { percentile: '50th', value: monteCarloResults.median },
    { percentile: '75th', value: monteCarloResults.percentile75 },
    { percentile: '90th', value: monteCarloResults.percentile90 },
  ];
  
  // Contribution vs growth breakdown (simplified)
  const yearsToRetirement = retirementData.retirementAge - retirementData.currentAge;
  const totalContributions = (
    retirementData.annualContributionPreTax +
    retirementData.annualContributionRoth +
    retirementData.annualContributionAfterTax +
    retirementData.employerMatch
  ) * yearsToRetirement + 
  retirementData.currentSavingsPreTax +
  retirementData.currentSavingsRoth +
  retirementData.currentSavingsAfterTax;
  
  const investmentGrowth = scenarioResults.expected.atRetirement - totalContributions;
  
  const breakdownData = [
    { name: 'Current Savings', value: retirementData.currentSavingsPreTax + retirementData.currentSavingsRoth + retirementData.currentSavingsAfterTax },
    { name: 'Future Contributions', value: (retirementData.annualContributionPreTax + retirementData.annualContributionRoth + retirementData.annualContributionAfterTax + retirementData.employerMatch) * yearsToRetirement },
    { name: 'Investment Growth', value: Math.max(0, investmentGrowth) },
  ];
  
  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };
  
  return (
    <div className="space-y-6">
      {/* Portfolio Projection */}
      <Card title="Portfolio Projection" subtitle="Projected portfolio balance over time under different scenarios">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="optimisticGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="expectedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="pessimisticGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="age" 
                stroke="#6B7280"
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={formatYAxis}
                stroke="#6B7280"
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value as number)}
                labelFormatter={(label) => `Age ${label}`}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <ReferenceLine 
                x={retirementData.retirementAge} 
                stroke="#9333EA" 
                strokeDasharray="5 5"
                label={{ value: 'Retirement', fill: '#9333EA', fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="optimistic"
                name="Optimistic"
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
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="pessimistic"
                name="Pessimistic"
                stroke="#EF4444"
                fill="url(#pessimisticGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      {/* Monte Carlo Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Monte Carlo Results" subtitle="Distribution of ending portfolio values">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="percentile"
                  stroke="#6B7280"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <YAxis 
                  tickFormatter={formatYAxis}
                  stroke="#6B7280"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  name="Portfolio Value"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card title="Wealth Breakdown" subtitle="Sources of your retirement wealth">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={breakdownData} 
                layout="vertical"
                margin={{ top: 10, right: 30, left: 100, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  type="number"
                  tickFormatter={formatYAxis}
                  stroke="#6B7280"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  stroke="#6B7280"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#8B5CF6"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      {/* Success Probability */}
      <Card title="Success Rate Analysis" subtitle="Probability of not running out of money">
        <div className="flex items-center justify-center py-8">
          <div className="relative w-48 h-48">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                className="text-gray-200"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
              <circle
                className={monteCarloResults.successRate >= 80 ? 'text-green-500' : 
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
              <span className="text-4xl font-bold text-gray-900">
                {monteCarloResults.successRate.toFixed(0)}%
              </span>
              <span className="text-sm text-gray-500">Success Rate</span>
            </div>
          </div>
        </div>
        <div className="text-center text-gray-600">
          Based on {retirementData.monteCarloRuns.toLocaleString()} Monte Carlo simulations with{' '}
          {(retirementData.standardDeviation * 100).toFixed(0)}% standard deviation
        </div>
      </Card>
    </div>
  );
}
