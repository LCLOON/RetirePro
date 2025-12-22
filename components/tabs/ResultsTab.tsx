'use client';

import { Card, CardGrid, StatCard } from '@/components/ui';
import { Button } from '@/components/ui';
import { useApp } from '@/lib/store';
import { formatCurrency, formatPercent } from '@/lib/calculations';

export function ResultsTab() {
  const { state, setActiveTab, runCalculations } = useApp();
  const { scenarioResults, monteCarloResults, retirementData } = state;
  
  if (!scenarioResults || !monteCarloResults) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Yet</h3>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Enter your data and run the calculations to see your retirement projections.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setActiveTab('data')}>
            Enter Data
          </Button>
          <Button onClick={runCalculations} loading={state.isCalculating}>
            Run Calculations
          </Button>
        </div>
      </div>
    );
  }
  
  const yearsToRetirement = retirementData.retirementAge - retirementData.currentAge;
  const yearsInRetirement = retirementData.lifeExpectancy - retirementData.retirementAge;
  
  // Get success status
  const successRate = monteCarloResults.successRate;
  const isSuccess = successRate >= 80;
  const isWarning = successRate >= 50 && successRate < 80;
  
  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <div className={`rounded-xl p-6 ${
        isSuccess ? 'bg-green-50 border border-green-200' :
        isWarning ? 'bg-amber-50 border border-amber-200' :
        'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isSuccess ? 'bg-green-100' : isWarning ? 'bg-amber-100' : 'bg-red-100'
          }`}>
            <span className={`text-2xl font-bold ${
              isSuccess ? 'text-green-700' : isWarning ? 'text-amber-700' : 'text-red-700'
            }`}>
              {successRate.toFixed(0)}%
            </span>
          </div>
          <div>
            <h3 className={`text-xl font-bold ${
              isSuccess ? 'text-green-800' : isWarning ? 'text-amber-800' : 'text-red-800'
            }`}>
              {isSuccess ? 'On Track for Retirement!' : 
               isWarning ? 'Retirement Plan Needs Attention' : 
               'Retirement Plan at Risk'}
            </h3>
            <p className={`${
              isSuccess ? 'text-green-700' : isWarning ? 'text-amber-700' : 'text-red-700'
            }`}>
              Based on {retirementData.monteCarloRuns.toLocaleString()} Monte Carlo simulations, 
              you have a {successRate.toFixed(1)}% probability of not running out of money.
            </p>
          </div>
        </div>
      </div>
      
      {/* Key Metrics */}
      <CardGrid columns={4}>
        <StatCard
          label="At Retirement"
          value={formatCurrency(scenarioResults.expected.atRetirement)}
          subValue={`Age ${retirementData.retirementAge}`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Years Savings Last"
          value={`${scenarioResults.expected.yearsLast.toFixed(1)} years`}
          subValue={scenarioResults.expected.yearsLast >= yearsInRetirement ? 'Sufficient' : 'Shortfall'}
          trend={scenarioResults.expected.yearsLast >= yearsInRetirement ? 'up' : 'down'}
          trendValue={scenarioResults.expected.yearsLast >= yearsInRetirement ? 'On track' : 'Adjust plan'}
        />
        <StatCard
          label="Safe Withdrawal"
          value={formatCurrency(scenarioResults.expected.atRetirement * retirementData.safeWithdrawalRate)}
          subValue={`${formatPercent(retirementData.safeWithdrawalRate)} rate`}
        />
        <StatCard
          label="Total Contributions"
          value={formatCurrency(
            (retirementData.annualContributionPreTax + 
             retirementData.annualContributionRoth + 
             retirementData.annualContributionAfterTax +
             retirementData.employerMatch) * yearsToRetirement
          )}
          subValue={`Over ${yearsToRetirement} years`}
        />
      </CardGrid>
      
      {/* Scenario Comparison */}
      <Card title="Scenario Comparison" subtitle="How your portfolio performs under different market conditions">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Scenario</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">At Retirement</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">At End</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Years Last</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 bg-green-50">
                <td className="py-3 px-4">
                  <span className="font-medium text-green-800">Optimistic (+2%)</span>
                </td>
                <td className="py-3 px-4 text-right text-green-700">
                  {formatCurrency(scenarioResults.optimistic.atRetirement)}
                </td>
                <td className="py-3 px-4 text-right text-green-700">
                  {formatCurrency(scenarioResults.optimistic.atEnd)}
                </td>
                <td className="py-3 px-4 text-right text-green-700">
                  {scenarioResults.optimistic.yearsLast > 100 ? '∞' : scenarioResults.optimistic.yearsLast.toFixed(1)}
                </td>
              </tr>
              <tr className="border-b border-gray-100 bg-blue-50">
                <td className="py-3 px-4">
                  <span className="font-medium text-blue-800">Expected</span>
                </td>
                <td className="py-3 px-4 text-right text-blue-700">
                  {formatCurrency(scenarioResults.expected.atRetirement)}
                </td>
                <td className="py-3 px-4 text-right text-blue-700">
                  {formatCurrency(scenarioResults.expected.atEnd)}
                </td>
                <td className="py-3 px-4 text-right text-blue-700">
                  {scenarioResults.expected.yearsLast > 100 ? '∞' : scenarioResults.expected.yearsLast.toFixed(1)}
                </td>
              </tr>
              <tr className="bg-red-50">
                <td className="py-3 px-4">
                  <span className="font-medium text-red-800">Pessimistic (-2%)</span>
                </td>
                <td className="py-3 px-4 text-right text-red-700">
                  {formatCurrency(scenarioResults.pessimistic.atRetirement)}
                </td>
                <td className="py-3 px-4 text-right text-red-700">
                  {formatCurrency(scenarioResults.pessimistic.atEnd)}
                </td>
                <td className="py-3 px-4 text-right text-red-700">
                  {scenarioResults.pessimistic.yearsLast > 100 ? '∞' : scenarioResults.pessimistic.yearsLast.toFixed(1)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Monte Carlo Results */}
      <Card title="Monte Carlo Distribution" subtitle="Percentile outcomes from simulation">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: '10th Percentile', value: monteCarloResults.percentile10, color: 'red' },
            { label: '25th Percentile', value: monteCarloResults.percentile25, color: 'amber' },
            { label: '50th (Median)', value: monteCarloResults.median, color: 'blue' },
            { label: '75th Percentile', value: monteCarloResults.percentile75, color: 'green' },
            { label: '90th Percentile', value: monteCarloResults.percentile90, color: 'emerald' },
          ].map((item) => (
            <div key={item.label} className={`p-4 rounded-lg bg-${item.color}-50 border border-${item.color}-100`}>
              <p className={`text-sm font-medium text-${item.color}-700`}>{item.label}</p>
              <p className={`text-lg font-bold text-${item.color}-900 mt-1`}>
                {formatCurrency(item.value)}
              </p>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Actions */}
      <div className="flex justify-center gap-4 pt-4">
        <Button variant="outline" onClick={() => setActiveTab('charts')}>
          View Charts
        </Button>
        <Button variant="outline" onClick={() => setActiveTab('data')}>
          Adjust Inputs
        </Button>
      </div>
    </div>
  );
}
