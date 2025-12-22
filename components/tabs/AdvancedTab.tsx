'use client';

import { useApp } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';

interface CustomScenario {
  name: string;
  returnRate: number;
  inflationRate: number;
  withdrawalRate: number;
  retirementAge: number;
  ssStartAge: number;
}

export function AdvancedTab() {
  const { state, updateRetirementData } = useApp();
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
    const totalSavings = data.currentSavingsPreTax + data.currentSavingsRoth + data.currentSavingsAfterTax;
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
    updateRetirementData({
      preRetirementReturn: scenario.returnRate,
      postRetirementReturn: scenario.returnRate - 1,
      inflationRate: scenario.inflationRate,
      safeWithdrawalRate: scenario.withdrawalRate,
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
            <Button variant="primary" className="w-full">
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
                  const rate = data.preRetirementReturn + delta;
                  const outcome = calculateScenarioOutcome({
                    ...scenarios[1],
                    returnRate: rate,
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
                    {(data.inflationRate + delta).toFixed(1)}%
                  </td>
                ))}
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-3 px-4 text-white">Withdrawal Rate</td>
                {[-2, -1, 0, 1, 2].map((delta) => (
                  <td key={delta} className={`py-3 px-4 text-center ${delta === 0 ? 'text-emerald-400 font-medium' : 'text-slate-300'}`}>
                    {(data.safeWithdrawalRate + delta).toFixed(1)}%
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
