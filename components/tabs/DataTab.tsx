'use client';

import { Card } from '@/components/ui';
import { CurrencyInput, PercentInput, NumberInput } from '@/components/ui';
import { Select, Checkbox } from '@/components/ui';
import { Button } from '@/components/ui';
import { useApp } from '@/lib/store';

export function DataTab() {
  const { state, updateRetirementData, runCalculations } = useApp();
  const data = state.retirementData;
  
  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card title="Personal Information" subtitle="Enter your basic information and retirement timeline">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <NumberInput
            label="Current Age"
            value={data.currentAge}
            onChange={(v) => updateRetirementData({ currentAge: v })}
            min={18}
            max={100}
            suffix="years"
          />
          <NumberInput
            label="Retirement Age"
            value={data.retirementAge}
            onChange={(v) => updateRetirementData({ retirementAge: v })}
            min={data.currentAge + 1}
            max={100}
            suffix="years"
          />
          <NumberInput
            label="Life Expectancy"
            value={data.lifeExpectancy}
            onChange={(v) => updateRetirementData({ lifeExpectancy: v })}
            min={data.retirementAge + 1}
            max={120}
            suffix="years"
          />
          <Select
            label="Filing Status"
            value={data.filingStatus}
            onChange={(v) => updateRetirementData({ filingStatus: v as 'single' | 'married' | 'head_of_household' })}
            options={[
              { value: 'single', label: 'Single' },
              { value: 'married', label: 'Married Filing Jointly' },
              { value: 'head_of_household', label: 'Head of Household' },
            ]}
          />
        </div>
      </Card>
      
      {/* Current Savings */}
      <Card title="Current Savings" subtitle="Enter your current retirement account balances">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CurrencyInput
            label="Pre-Tax Accounts (401k, Traditional IRA)"
            value={data.currentSavingsPreTax}
            onChange={(v) => updateRetirementData({ currentSavingsPreTax: v })}
            hint="Tax-deferred retirement accounts"
          />
          <CurrencyInput
            label="Roth Accounts (Roth 401k, Roth IRA)"
            value={data.currentSavingsRoth}
            onChange={(v) => updateRetirementData({ currentSavingsRoth: v })}
            hint="Tax-free growth retirement accounts"
          />
          <CurrencyInput
            label="After-Tax / Brokerage"
            value={data.currentSavingsAfterTax}
            onChange={(v) => updateRetirementData({ currentSavingsAfterTax: v })}
            hint="Taxable investment accounts"
          />
        </div>
      </Card>
      
      {/* Annual Contributions */}
      <Card title="Annual Contributions" subtitle="How much you save each year">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CurrencyInput
            label="Pre-Tax Contribution"
            value={data.annualContributionPreTax}
            onChange={(v) => updateRetirementData({ annualContributionPreTax: v })}
          />
          <CurrencyInput
            label="Roth Contribution"
            value={data.annualContributionRoth}
            onChange={(v) => updateRetirementData({ annualContributionRoth: v })}
          />
          <CurrencyInput
            label="After-Tax Contribution"
            value={data.annualContributionAfterTax}
            onChange={(v) => updateRetirementData({ annualContributionAfterTax: v })}
          />
          <CurrencyInput
            label="Employer Match"
            value={data.employerMatch}
            onChange={(v) => updateRetirementData({ employerMatch: v })}
            hint="Annual employer matching contribution"
          />
          <PercentInput
            label="Contribution Growth Rate"
            value={data.contributionGrowthRate}
            onChange={(v) => updateRetirementData({ contributionGrowthRate: v })}
            hint="Annual increase in contributions"
          />
        </div>
      </Card>
      
      {/* Investment Returns */}
      <Card title="Investment Returns" subtitle="Expected returns and inflation assumptions">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <PercentInput
            label="Pre-Retirement Return"
            value={data.preRetirementReturn}
            onChange={(v) => updateRetirementData({ preRetirementReturn: v })}
            hint="Expected annual return before retirement"
          />
          <PercentInput
            label="Post-Retirement Return"
            value={data.postRetirementReturn}
            onChange={(v) => updateRetirementData({ postRetirementReturn: v })}
            hint="Expected annual return after retirement"
          />
          <PercentInput
            label="Inflation Rate"
            value={data.inflationRate}
            onChange={(v) => updateRetirementData({ inflationRate: v })}
          />
          <PercentInput
            label="Standard Deviation"
            value={data.standardDeviation}
            onChange={(v) => updateRetirementData({ standardDeviation: v })}
            hint="Volatility for Monte Carlo simulation"
          />
        </div>
      </Card>
      
      {/* Retirement Income */}
      <Card title="Retirement Income Needs" subtitle="Expected expenses and withdrawal strategy">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CurrencyInput
            label="Annual Retirement Expenses"
            value={data.retirementExpenses}
            onChange={(v) => updateRetirementData({ retirementExpenses: v })}
            hint="Expected annual spending in retirement"
          />
          <PercentInput
            label="Expense Growth Rate"
            value={data.expenseGrowthRate}
            onChange={(v) => updateRetirementData({ expenseGrowthRate: v })}
            hint="Annual increase in expenses"
          />
          <PercentInput
            label="Safe Withdrawal Rate"
            value={data.safeWithdrawalRate}
            onChange={(v) => updateRetirementData({ safeWithdrawalRate: v })}
            hint="Typically 3-4% of portfolio"
          />
        </div>
      </Card>
      
      {/* Other Income */}
      <Card title="Other Income Sources" subtitle="Additional income during retirement">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CurrencyInput
            label="Social Security (Annual)"
            value={data.socialSecurityBenefit}
            onChange={(v) => updateRetirementData({ socialSecurityBenefit: v })}
          />
          <NumberInput
            label="SS Start Age"
            value={data.socialSecurityStartAge}
            onChange={(v) => updateRetirementData({ socialSecurityStartAge: v })}
            min={62}
            max={70}
          />
          <CurrencyInput
            label="Pension (Annual)"
            value={data.pensionIncome}
            onChange={(v) => updateRetirementData({ pensionIncome: v })}
          />
          <CurrencyInput
            label="Other Income (Annual)"
            value={data.otherIncome}
            onChange={(v) => updateRetirementData({ otherIncome: v })}
          />
          <NumberInput
            label="Other Income Start Age"
            value={data.otherIncomeStartAge}
            onChange={(v) => updateRetirementData({ otherIncomeStartAge: v })}
            min={data.currentAge}
            max={100}
          />
          <NumberInput
            label="Other Income End Age"
            value={data.otherIncomeEndAge}
            onChange={(v) => updateRetirementData({ otherIncomeEndAge: v })}
            min={data.otherIncomeStartAge}
            max={120}
          />
        </div>
      </Card>
      
      {/* Simulation Settings */}
      <Card title="Monte Carlo Settings" subtitle="Parameters for retirement simulations">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <NumberInput
            label="Number of Simulations"
            value={data.monteCarloRuns}
            onChange={(v) => updateRetirementData({ monteCarloRuns: v })}
            min={100}
            max={10000}
            step={100}
          />
          <PercentInput
            label="Success Probability Target"
            value={data.successProbability / 100}
            onChange={(v) => updateRetirementData({ successProbability: v * 100 })}
            asDecimal={false}
          />
          <Checkbox
            label="Include Social Security"
            checked={data.includeSocialSecurity}
            onChange={(v) => updateRetirementData({ includeSocialSecurity: v })}
          />
          <Checkbox
            label="Inflation-Adjusted Returns"
            checked={data.inflationAdjusted}
            onChange={(v) => updateRetirementData({ inflationAdjusted: v })}
          />
        </div>
      </Card>
      
      {/* Calculate Button */}
      <div className="flex justify-center pt-4">
        <Button 
          size="lg" 
          onClick={runCalculations}
          loading={state.isCalculating}
          className="px-12"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Run Calculations
        </Button>
      </div>
    </div>
  );
}
