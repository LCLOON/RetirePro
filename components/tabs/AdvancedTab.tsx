'use client';

import { useApp } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState, useMemo } from 'react';
import { calculate72tSEPP, formatCurrency } from '@/lib/calculations';

interface CustomScenario {
  name: string;
  returnRate: number;
  inflationRate: number;
  withdrawalRate: number;
  retirementAge: number;
  ssStartAge: number;
}

// 72(t) SEPP Calculator Component
function SEPPCalculator({ currentAge, preTaxBalance }: { currentAge: number; preTaxBalance: number }) {
  const [showCalculator, setShowCalculator] = useState(false);
  const [balance, setBalance] = useState(preTaxBalance);
  const [age, setAge] = useState(Math.max(currentAge, 40));
  const [interestRate, setInterestRate] = useState(0.045); // IRS 120% mid-term rate (approx)

  const seppResults = useMemo(() => {
    if (age < 40 || age >= 59.5 || balance <= 0) return null;
    return calculate72tSEPP(balance, age, interestRate);
  }, [balance, age, interestRate]);

  const endAge = Math.max(age + 5, 59.5);
  const years = Math.ceil(endAge - age);

  return (
    <Card title="🔓 72(t) SEPP Calculator" subtitle="Penalty-free early retirement withdrawals">
      <div className="space-y-4">
        {/* Toggle */}
        <button
          onClick={() => setShowCalculator(!showCalculator)}
          className="w-full flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔓</span>
            <div className="text-left">
              <p className="font-semibold text-white">72(t) Substantially Equal Periodic Payments</p>
              <p className="text-sm text-slate-400">
                Withdraw from IRA/401k before 59½ without the 10% early withdrawal penalty
              </p>
            </div>
          </div>
          <svg 
            className={`w-5 h-5 text-slate-400 transition-transform ${showCalculator ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showCalculator && (
          <div className="space-y-6">
            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">IRA/401k Balance</label>
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Your Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 40)}
                  min={40}
                  max={58}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  IRS Interest Rate (120% Mid-term)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={(interestRate * 100).toFixed(1)}
                  onChange={(e) => setInterestRate((parseFloat(e.target.value) || 4.5) / 100)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
                <p className="text-xs text-slate-500 mt-1">
                  <a href="https://www.irs.gov/applicable-federal-rates" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
                    Check current IRS rates →
                  </a>
                </p>
              </div>
            </div>

            {/* Age Warning */}
            {age >= 59 && (
              <div className="p-3 bg-amber-900/30 border border-amber-600/50 rounded-lg">
                <p className="text-amber-300 text-sm">
                  ⚠️ You&apos;re close to 59½! SEPP may not be needed. After 59½, you can withdraw penalty-free anyway.
                </p>
              </div>
            )}

            {/* Results */}
            {seppResults && (
              <>
                {/* Method Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {seppResults.map((result) => (
                    <div 
                      key={result.method}
                      className={`p-4 rounded-lg border-2 ${
                        result.method === 'amortization' 
                          ? 'border-emerald-500 bg-emerald-900/30' 
                          : 'border-slate-600 bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">
                          {result.method === 'rmd' ? '📊' : result.method === 'amortization' ? '📈' : '💰'}
                        </span>
                        <h4 className="font-semibold text-white capitalize">{result.method}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">
                        {result.method === 'rmd' && 'Lowest amount, recalculated yearly'}
                        {result.method === 'amortization' && 'Fixed amount, most popular'}
                        {result.method === 'annuitization' && 'Fixed amount, uses annuity factors'}
                      </p>
                      <div className="space-y-2">
                        <div className="text-center p-3 bg-slate-800/50 rounded">
                          <p className="text-xs text-slate-400">Annual Withdrawal</p>
                          <p className="text-xl font-bold text-emerald-400">
                            {formatCurrency(result.annualWithdrawal)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatCurrency(result.monthlyWithdrawal)}/month
                          </p>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Total over {years}yr:</span>
                          <span className="text-white">{formatCurrency(result.totalWithdrawn)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Balance at {result.endAge.toFixed(1)}:</span>
                          <span className="text-white">{formatCurrency(result.remainingBalance)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Important Rules */}
                <div className="p-4 bg-blue-900/30 border border-blue-600/50 rounded-lg">
                  <h4 className="font-semibold text-blue-300 mb-2">⚠️ Important 72(t) Rules</h4>
                  <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
                    <li>Must continue for <strong>5 years OR until age 59½</strong> (whichever is LATER)</li>
                    <li>Your SEPP ends at age: <strong>{endAge.toFixed(1)}</strong> ({years} years)</li>
                    <li>Modifying payments triggers 10% penalty on ALL prior withdrawals + interest</li>
                    <li>Consider using a separate IRA to fund only what you need</li>
                    <li>Consult a tax professional before starting a 72(t) plan</li>
                  </ul>
                </div>
              </>
            )}

            {!seppResults && balance > 0 && (
              <div className="p-4 bg-slate-800/50 rounded-lg text-center text-slate-400">
                Enter your age (40-58) to calculate SEPP options
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export function AdvancedTab() {
  const { state, updateRetirementData, runCalculations } = useApp();
  const data = state.retirementData;
  
  const [scenarios, setScenarios] = useState<CustomScenario[]>([
    { name: 'Conservative', returnRate: 4, inflationRate: 3.5, withdrawalRate: 3, retirementAge: 67, ssStartAge: 70 },
    { name: 'Moderate', returnRate: 6, inflationRate: 3, withdrawalRate: 4, retirementAge: 65, ssStartAge: 67 },
    { name: 'Aggressive', returnRate: 8, inflationRate: 2.5, withdrawalRate: 5, retirementAge: 62, ssStartAge: 62 },
  ]);

  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);
  const [newScenario, setNewScenario] = useState<CustomScenario>({
    name: '',
    returnRate: 6,
    inflationRate: 3,
    withdrawalRate: 4,
    retirementAge: 65,
    ssStartAge: 67,
  });

  // Calculate projected outcome for a scenario
  const calculateScenarioOutcome = (scenario: CustomScenario) => {
    const totalSavings = data.currentSavingsPreTax + data.currentSavingsRoth + data.currentSavingsAfterTax +
      (data.hasInheritedIRA ? data.inheritedIRA.balance : 0) +
      (data.hasDividendPortfolio && data.dividendPortfolio.includeInProjections ? data.dividendPortfolio.currentValue : 0) +
      (data.hasCryptoHoldings && data.cryptoHoldings.includeInProjections ? data.cryptoHoldings.currentValue : 0);
    const totalContributions = data.annualContributionPreTax + data.annualContributionRoth + data.annualContributionAfterTax + data.employerMatch;
    const yearsToRetirement = scenario.retirementAge - data.currentAge;
    
    const futureValue = totalSavings * Math.pow(1 + scenario.returnRate / 100, yearsToRetirement) +
      totalContributions * ((Math.pow(1 + scenario.returnRate / 100, yearsToRetirement) - 1) / (scenario.returnRate / 100));
    
    const annualWithdrawal = futureValue * (scenario.withdrawalRate / 100);
    const yearsLast = futureValue / (annualWithdrawal - (annualWithdrawal * scenario.inflationRate / 100));
    
    return {
      atRetirement: futureValue,
      annualIncome: annualWithdrawal + data.socialSecurityBenefit,
      yearsLastEstimate: Math.min(40, Math.max(0, yearsLast)),
    };
  };

  const applyScenario = (index: number) => {
    const scenario = scenarios[index];
    // Convert percentages to decimals for the store
    updateRetirementData({
      preRetirementReturn: scenario.returnRate / 100,
      postRetirementReturn: (scenario.returnRate - 1) / 100,
      inflationRate: scenario.inflationRate / 100,
      safeWithdrawalRate: scenario.withdrawalRate / 100,
      retirementAge: scenario.retirementAge,
      socialSecurityStartAge: scenario.ssStartAge,
    });
    setSelectedScenario(index);
  };

  const addCustomScenario = () => {
    if (newScenario.name.trim()) {
      setScenarios([...scenarios, { ...newScenario }]);
      setNewScenario({
        name: '',
        returnRate: 6,
        inflationRate: 3,
        withdrawalRate: 4,
        retirementAge: 65,
        ssStartAge: 67,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            Advanced Settings
          </h1>
          <p className="text-slate-400 mt-1">Custom scenarios and advanced simulation parameters</p>
        </div>
      </div>

      {/* 72(t) SEPP Calculator */}
      <SEPPCalculator currentAge={data.currentAge} preTaxBalance={data.currentSavingsPreTax} />

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((scenario, index) => {
          const outcome = calculateScenarioOutcome(scenario);
          const isSelected = selectedScenario === index;
          
          return (
            <Card 
              key={index}
              className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-emerald-500' : ''}`}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{scenario.name}</h3>
                  <span className={`text-2xl ${
                    index === 0 ? '🛡️' : index === 1 ? '⚖️' : '🚀'
                  }`}></span>
                </div>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Return Rate</span>
                    <span className="text-white">{scenario.returnRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Inflation</span>
                    <span className="text-white">{scenario.inflationRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Withdrawal Rate</span>
                    <span className="text-white">{scenario.withdrawalRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Retire at</span>
                    <span className="text-white">Age {scenario.retirementAge}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">SS Start</span>
                    <span className="text-white">Age {scenario.ssStartAge}</span>
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-3 mb-4">
                  <div className="text-center">
                    <p className="text-slate-400 text-xs">Projected at Retirement</p>
                    <p className="text-xl font-bold text-emerald-400">
                      ${Math.round(outcome.atRetirement).toLocaleString()}
                    </p>
                  </div>
                </div>

                <Button 
                  variant={isSelected ? 'primary' : 'secondary'}
                  className="w-full"
                  onClick={() => applyScenario(index)}
                >
                  {isSelected ? '✓ Applied' : 'Apply Scenario'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Monte Carlo Settings */}
      <Card title="🎲 Monte Carlo Simulation Settings" icon="🎲">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            label="Number of Simulations"
            type="number"
            value={data.monteCarloRuns}
            onChange={(e) => updateRetirementData({ monteCarloRuns: parseInt(e.target.value) || 1000 })}
            hint="More runs = more accurate results"
          />
          <Input
            label="Standard Deviation (%)"
            type="number"
            step="0.1"
            value={data.standardDeviation}
            onChange={(e) => updateRetirementData({ standardDeviation: parseFloat(e.target.value) || 15 })}
            hint="Market volatility assumption"
          />
          <Input
            label="Success Probability Target (%)"
            type="number"
            step="1"
            value={data.successProbability}
            onChange={(e) => updateRetirementData({ successProbability: parseInt(e.target.value) || 90 })}
            hint="Target success rate"
          />
          <div className="flex items-end">
            <Button variant="primary" className="w-full" onClick={runCalculations} loading={state.isCalculating}>
              🎲 Run Simulation
            </Button>
          </div>
        </div>
      </Card>

      {/* Create Custom Scenario */}
      <Card title="➕ Create Custom Scenario" icon="➕">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Scenario Name"
            value={newScenario.name}
            onChange={(e) => setNewScenario({ ...newScenario, name: e.target.value })}
            placeholder="My Custom Scenario"
          />
          <Input
            label="Return Rate (%)"
            type="number"
            step="0.1"
            value={newScenario.returnRate}
            onChange={(e) => setNewScenario({ ...newScenario, returnRate: parseFloat(e.target.value) || 6 })}
          />
          <Input
            label="Inflation Rate (%)"
            type="number"
            step="0.1"
            value={newScenario.inflationRate}
            onChange={(e) => setNewScenario({ ...newScenario, inflationRate: parseFloat(e.target.value) || 3 })}
          />
          <Input
            label="Withdrawal Rate (%)"
            type="number"
            step="0.1"
            value={newScenario.withdrawalRate}
            onChange={(e) => setNewScenario({ ...newScenario, withdrawalRate: parseFloat(e.target.value) || 4 })}
          />
          <Input
            label="Retirement Age"
            type="number"
            value={newScenario.retirementAge}
            onChange={(e) => setNewScenario({ ...newScenario, retirementAge: parseInt(e.target.value) || 65 })}
          />
          <Input
            label="SS Start Age"
            type="number"
            value={newScenario.ssStartAge}
            onChange={(e) => setNewScenario({ ...newScenario, ssStartAge: parseInt(e.target.value) || 67 })}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="primary" onClick={addCustomScenario} disabled={!newScenario.name.trim()}>
            ➕ Add Scenario
          </Button>
        </div>
      </Card>

      {/* Sensitivity Analysis */}
      <Card title="📊 Sensitivity Analysis" icon="📊">
        <p className="text-slate-400 mb-4">See how changes in key variables affect your retirement outcome</p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400">Variable</th>
                <th className="text-center py-3 px-4 text-slate-400">-2%</th>
                <th className="text-center py-3 px-4 text-slate-400">-1%</th>
                <th className="text-center py-3 px-4 text-emerald-400">Current</th>
                <th className="text-center py-3 px-4 text-slate-400">+1%</th>
                <th className="text-center py-3 px-4 text-slate-400">+2%</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-700/50">
                <td className="py-3 px-4 text-white">Return Rate</td>
                {[-2, -1, 0, 1, 2].map((delta) => {
                  // data.preRetirementReturn is decimal (e.g., 0.07), convert to percentage and add delta
                  const ratePercent = (data.preRetirementReturn * 100) + delta;
                  const outcome = calculateScenarioOutcome({
                    ...scenarios[1],
                    returnRate: ratePercent,
                  });
                  return (
                    <td key={delta} className={`py-3 px-4 text-center ${delta === 0 ? 'text-emerald-400 font-medium' : 'text-slate-300'}`}>
                      ${Math.round(outcome.atRetirement / 1000)}K
                    </td>
                  );
                })}
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-3 px-4 text-white">Inflation Rate</td>
                {[-2, -1, 0, 1, 2].map((delta) => (
                  <td key={delta} className={`py-3 px-4 text-center ${delta === 0 ? 'text-emerald-400 font-medium' : 'text-slate-300'}`}>
                    {((data.inflationRate * 100) + delta).toFixed(1)}%
                  </td>
                ))}
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-3 px-4 text-white">Withdrawal Rate</td>
                {[-2, -1, 0, 1, 2].map((delta) => (
                  <td key={delta} className={`py-3 px-4 text-center ${delta === 0 ? 'text-emerald-400 font-medium' : 'text-slate-300'}`}>
                    {((data.safeWithdrawalRate * 100) + delta).toFixed(1)}%
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Additional Options */}
      <Card title="⚙️ Additional Options" icon="⚙️">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-white font-medium">Income Adjustments</h4>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.includeSocialSecurity}
                onChange={(e) => updateRetirementData({ includeSocialSecurity: e.target.checked })}
                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-slate-300">Include Social Security Benefits</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.inflationAdjusted}
                onChange={(e) => updateRetirementData({ inflationAdjusted: e.target.checked })}
                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-slate-300">Inflation-Adjusted Results</span>
            </label>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-white font-medium">Expense Growth</h4>
            <Input
              label="Expense Growth Rate (%)"
              type="number"
              step="0.1"
              value={data.expenseGrowthRate}
              onChange={(e) => updateRetirementData({ expenseGrowthRate: parseFloat(e.target.value) || 2 })}
              hint="Annual increase in retirement expenses"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
