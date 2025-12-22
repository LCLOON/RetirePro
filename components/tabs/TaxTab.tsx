'use client';

import { Card, CardGrid, StatCard } from '@/components/ui';
import { CurrencyInput, PercentInput } from '@/components/ui';
import { useApp } from '@/lib/store';
import { formatCurrency, formatPercent } from '@/lib/calculations';

export function TaxTab() {
  const { state, updateTaxSettings } = useApp();
  const tax = state.taxSettings;
  
  // 2025 Tax Brackets (Married Filing Jointly)
  const mfjBrackets = [
    { min: 0, max: 23850, rate: 0.10 },
    { min: 23850, max: 96950, rate: 0.12 },
    { min: 96950, max: 206700, rate: 0.22 },
    { min: 206700, max: 394600, rate: 0.24 },
    { min: 394600, max: 501050, rate: 0.32 },
    { min: 501050, max: 751600, rate: 0.35 },
    { min: 751600, max: Infinity, rate: 0.37 },
  ];
  
  // 2025 Tax Brackets (Single)
  const singleBrackets = [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ];
  
  const brackets = tax.filingStatus === 'married' ? mfjBrackets : singleBrackets;
  const standardDeduction = tax.filingStatus === 'married' ? 30000 : 15000;
  
  // Calculate tax for a given income
  const calculateTax = (income: number, brackets: typeof mfjBrackets): number => {
    let tax = 0;
    let remainingIncome = Math.max(0, income - standardDeduction);
    
    for (const bracket of brackets) {
      if (remainingIncome <= 0) break;
      
      const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min);
      tax += taxableInBracket * bracket.rate;
      remainingIncome -= taxableInBracket;
    }
    
    return tax;
  };
  
  // Calculate current tax situation
  const taxableIncome = Math.max(0, tax.annualIncome - standardDeduction);
  const federalTax = calculateTax(tax.annualIncome, brackets);
  const stateTax = tax.annualIncome * tax.stateTaxRate;
  const effectiveRate = tax.annualIncome > 0 ? (federalTax + stateTax) / tax.annualIncome : 0;
  
  // Find marginal bracket
  const marginalBracket = brackets.find(b => taxableIncome >= b.min && taxableIncome < b.max);
  const marginalRate = marginalBracket?.rate || 0;
  
  // Retirement tax projection
  const retirementIncome = state.retirementData.retirementExpenses;
  const retirementFederalTax = calculateTax(retirementIncome, brackets);
  const retirementStateTax = retirementIncome * tax.stateTaxRate;
  const retirementEffectiveRate = retirementIncome > 0 
    ? (retirementFederalTax + retirementStateTax) / retirementIncome 
    : 0;
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <CardGrid columns={4}>
        <StatCard
          label="Taxable Income"
          value={formatCurrency(taxableIncome)}
          subtitle="After standard deduction"
          color="blue"
        />
        <StatCard
          label="Federal Tax"
          value={formatCurrency(federalTax)}
          subtitle="Estimated federal tax"
          color="red"
        />
        <StatCard
          label="Marginal Rate"
          value={formatPercent(marginalRate)}
          subtitle="Current tax bracket"
          color="amber"
        />
        <StatCard
          label="Effective Rate"
          value={formatPercent(effectiveRate)}
          subtitle="Combined fed + state"
          color="purple"
        />
      </CardGrid>
      
      {/* Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Current Tax Situation" subtitle="Enter your current income and tax details">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filing Status
              </label>
              <div className="flex gap-4">
                {[
                  { value: 'single', label: 'Single' },
                  { value: 'married', label: 'Married Filing Jointly' },
                ].map((status) => (
                  <button
                    key={status.value}
                    onClick={() => updateTaxSettings({ filingStatus: status.value as 'single' | 'married' })}
                    className={`
                      flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all
                      ${tax.filingStatus === status.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                      }
                    `}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
            
            <CurrencyInput
              label="Annual Gross Income"
              value={tax.annualIncome}
              onChange={(v) => updateTaxSettings({ annualIncome: v })}
              helpText="Your total annual income before taxes"
            />
            
            <PercentInput
              label="State Tax Rate"
              value={tax.stateTaxRate}
              onChange={(v) => updateTaxSettings({ stateTaxRate: v })}
              helpText="Your state's income tax rate"
            />
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Standard Deduction</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(standardDeduction)}</span>
              </div>
            </div>
          </div>
        </Card>
        
        <Card title="Retirement Tax Projection" subtitle="Estimated taxes in retirement">
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Retirement Expenses</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(retirementIncome)}/yr</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Estimated Federal Tax</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(retirementFederalTax)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Estimated State Tax</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(retirementStateTax)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Effective Rate</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{formatPercent(retirementEffectiveRate)}</span>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${
              retirementEffectiveRate < effectiveRate 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
            }`}>
              <div className="flex items-center gap-3">
                {retirementEffectiveRate < effectiveRate ? (
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                <div>
                  <p className={`text-sm font-medium ${
                    retirementEffectiveRate < effectiveRate 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-amber-700 dark:text-amber-300'
                  }`}>
                    {retirementEffectiveRate < effectiveRate 
                      ? 'Lower taxes in retirement!' 
                      : 'Consider Roth conversions'}
                  </p>
                  <p className={`text-xs ${
                    retirementEffectiveRate < effectiveRate 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {retirementEffectiveRate < effectiveRate 
                      ? `You'll save ${formatPercent(effectiveRate - retirementEffectiveRate)} in taxes` 
                      : 'Your retirement tax rate may be similar or higher'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Tax Brackets */}
      <Card 
        title={`2025 Federal Tax Brackets (${tax.filingStatus === 'married' ? 'Married Filing Jointly' : 'Single'})`}
        subtitle="Know your marginal tax rate"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Tax Rate
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Income Range
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Your Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {brackets.map((bracket, index) => {
                const isCurrentBracket = taxableIncome >= bracket.min && taxableIncome < bracket.max;
                const isPastBracket = taxableIncome >= bracket.max;
                
                return (
                  <tr 
                    key={index}
                    className={isCurrentBracket ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  >
                    <td className="px-4 py-3">
                      <span className={`
                        font-bold
                        ${isCurrentBracket ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}
                      `}>
                        {(bracket.rate * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {formatCurrency(bracket.min)} – {bracket.max === Infinity ? '∞' : formatCurrency(bracket.max)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isCurrentBracket && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 rounded-full">
                          Current Bracket
                        </span>
                      )}
                      {isPastBracket && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200 rounded-full">
                          Fully Taxed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
