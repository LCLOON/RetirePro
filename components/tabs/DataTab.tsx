'use client';
import { Card } from '@/components/ui';
import { CurrencyInput, PercentInput, NumberInput } from '@/components/ui';
import { Select, Checkbox } from '@/components/ui';
import { Button } from '@/components/ui';
import { useApp } from '@/lib/store';
import { US_STATES, IncomeSource, DEFAULT_INHERITED_IRA, DEFAULT_DIVIDEND_PORTFOLIO, DEFAULT_CRYPTO_HOLDINGS } from '@/lib/types';

export function DataTab() {
  const { state, updateRetirementData, runCalculations } = useApp();
  const data = state.retirementData;

  // Helper to generate unique ID
  const generateId = () => Math.random().toString(36).substring(2, 9);

  // Add new income source
  const addIncomeSource = () => {
    const newSource: IncomeSource = {
      id: generateId(),
      name: 'New Income Source',
      amount: 0,
      startAge: data.retirementAge,
      endAge: data.lifeExpectancy,
      adjustForInflation: true,
      type: 'other',
    };
    updateRetirementData({ 
      additionalIncome: [...data.additionalIncome, newSource] 
    });
  };

  // Update income source
  const updateIncomeSource = (id: string, updates: Partial<IncomeSource>) => {
    updateRetirementData({
      additionalIncome: data.additionalIncome.map(source =>
        source.id === id ? { ...source, ...updates } : source
      ),
    });
  };

  // Remove income source
  const removeIncomeSource = (id: string) => {
    updateRetirementData({
      additionalIncome: data.additionalIncome.filter(source => source.id !== id),
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Social Security Summary - Shows synced values from SS tab */}
      {data.includeSocialSecurity && data.socialSecurityBenefit > 0 && (
        <div className="bg-gradient-to-r from-blue-500/10 to-emerald-500/10 rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🏛️</span>
            <div>
              <h3 className="text-lg font-semibold text-white">Social Security Benefits (Synced)</h3>
              <p className="text-xs text-slate-400">Values from Social Security tab</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-xs text-slate-400">Your Annual SS</p>
              <p className="text-lg font-bold text-emerald-400">${data.socialSecurityBenefit.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Starting age {data.socialSecurityStartAge}</p>
            </div>
            {data.hasSpouse && data.spouseSocialSecurityBenefit > 0 && (
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs text-slate-400">Spouse Annual SS</p>
                <p className="text-lg font-bold text-purple-400">${data.spouseSocialSecurityBenefit.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Starting age {data.spouseSocialSecurityStartAge}</p>
              </div>
            )}
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-xs text-slate-400">Combined Annual</p>
              <p className="text-lg font-bold text-blue-400">
                ${(data.socialSecurityBenefit + (data.hasSpouse ? data.spouseSocialSecurityBenefit : 0)).toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">Per year</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-center">
              <span className="text-emerald-400 text-sm flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Included in projections
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Personal Information */}
      <Card title="Personal Information" subtitle="Enter your basic information and retirement timeline">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
            onChange={(v) => {
              const isMarried = v === 'married';
              updateRetirementData({ 
                filingStatus: v as 'single' | 'married' | 'head_of_household',
                hasSpouse: isMarried
              });
            }}
            options={[
              { value: 'single', label: 'Single' },
              { value: 'married', label: 'Married Filing Jointly' },
              { value: 'head_of_household', label: 'Head of Household' },
            ]}
          />
          <Select
            label="State of Residence"
            value={data.state}
            onChange={(v) => updateRetirementData({ state: v })}
            options={US_STATES.map(s => ({ value: s.value, label: s.label }))}
          />
        </div>
      </Card>

      {/* Spouse Information - Collapsible */}
      {data.filingStatus === 'married' && (
        <Card 
          title="👫 Spouse Information" 
          subtitle="Enter your spouse's retirement details"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <NumberInput
              label="Spouse Current Age"
              value={data.spouseCurrentAge}
              onChange={(v) => updateRetirementData({ spouseCurrentAge: v })}
              min={18}
              max={100}
              suffix="years"
            />
            <NumberInput
              label="Spouse Retirement Age"
              value={data.spouseRetirementAge}
              onChange={(v) => updateRetirementData({ spouseRetirementAge: v })}
              min={data.spouseCurrentAge + 1}
              max={100}
              suffix="years"
            />
            <NumberInput
              label="Spouse Life Expectancy"
              value={data.spouseLifeExpectancy}
              onChange={(v) => updateRetirementData({ spouseLifeExpectancy: v })}
              min={data.spouseRetirementAge + 1}
              max={120}
              suffix="years"
            />
            <CurrencyInput
              label="Spouse Social Security (Annual)"
              value={data.spouseSocialSecurityBenefit}
              onChange={(v) => updateRetirementData({ spouseSocialSecurityBenefit: v })}
            />
            <NumberInput
              label="Spouse SS Start Age"
              value={data.spouseSocialSecurityStartAge}
              onChange={(v) => updateRetirementData({ spouseSocialSecurityStartAge: v })}
              min={62}
              max={70}
            />
          </div>
        </Card>
      )}
      
      {/* Current Savings */}
      <Card title="💰 Current Savings" subtitle="Enter your current retirement account balances">
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

      {/* HSA Account */}
      <Card 
        title="🏥 Health Savings Account (HSA)" 
        subtitle="Triple tax-advantaged healthcare savings"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CurrencyInput
            label="Current HSA Balance"
            value={data.currentHSA}
            onChange={(v) => updateRetirementData({ currentHSA: v })}
            hint="Health Savings Account balance"
          />
          <CurrencyInput
            label="Annual HSA Contribution"
            value={data.annualHSAContribution}
            onChange={(v) => updateRetirementData({ annualHSAContribution: v })}
            hint="2024 limit: $4,150 (self) / $8,300 (family)"
          />
          <Checkbox
            label="Include HSA Catch-Up (Age 55+)"
            checked={data.hsaCatchUp}
            onChange={(v) => updateRetirementData({ hsaCatchUp: v })}
          />
        </div>
      </Card>

      {/* Dividend Income Portfolio */}
      <Card 
        title="💹 Dividend Income Portfolio" 
        subtitle="Track dividend-paying stocks and funds for retirement income"
      >
        <div className="space-y-4">
          <Checkbox
            label="I have a dividend income portfolio"
            checked={data.hasDividendPortfolio}
            onChange={(v) => {
              updateRetirementData({ 
                hasDividendPortfolio: v,
                dividendPortfolio: v ? data.dividendPortfolio : DEFAULT_DIVIDEND_PORTFOLIO
              });
            }}
          />
          
          {data.hasDividendPortfolio && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-slate-700">
              <CurrencyInput
                label="Current Portfolio Value"
                value={data.dividendPortfolio.currentValue}
                onChange={(v) => updateRetirementData({ 
                  dividendPortfolio: { ...data.dividendPortfolio, currentValue: v }
                })}
                hint="Total value of dividend-paying investments"
              />
              <CurrencyInput
                label="Annual Dividend Income"
                value={data.dividendPortfolio.annualDividendIncome}
                onChange={(v) => updateRetirementData({ 
                  dividendPortfolio: { ...data.dividendPortfolio, annualDividendIncome: v }
                })}
                hint="Expected annual dividend payments"
              />
              <PercentInput
                label="Dividend Yield"
                value={data.dividendPortfolio.yieldOnCost}
                onChange={(v) => updateRetirementData({ 
                  dividendPortfolio: { ...data.dividendPortfolio, yieldOnCost: v }
                })}
                hint="Current yield on cost"
              />
              <PercentInput
                label="Dividend Growth Rate"
                value={data.dividendPortfolio.dividendGrowthRate}
                onChange={(v) => updateRetirementData({ 
                  dividendPortfolio: { ...data.dividendPortfolio, dividendGrowthRate: v }
                })}
                hint="Expected annual dividend increase"
              />
              <Checkbox
                label="Reinvest dividends until retirement"
                checked={data.dividendPortfolio.reinvestDividends}
                onChange={(v) => updateRetirementData({ 
                  dividendPortfolio: { ...data.dividendPortfolio, reinvestDividends: v }
                })}
              />
              <Checkbox
                label="Include in retirement projections"
                checked={data.dividendPortfolio.includeInProjections}
                onChange={(v) => updateRetirementData({ 
                  dividendPortfolio: { ...data.dividendPortfolio, includeInProjections: v }
                })}
              />
            </div>
          )}
          
          <p className="text-xs text-slate-400 mt-2">
            💡 Tip: Use Dividend Pro to plan and track your dividend portfolio. 
            Dividend income can provide reliable cash flow in retirement without selling shares.
          </p>
        </div>
      </Card>

      {/* Cryptocurrency Holdings */}
      <Card 
        title="₿ Cryptocurrency Holdings" 
        subtitle="Track crypto assets for retirement planning"
      >
        <div className="space-y-4">
          <Checkbox
            label="I have cryptocurrency holdings"
            checked={data.hasCryptoHoldings}
            onChange={(v) => {
              updateRetirementData({ 
                hasCryptoHoldings: v,
                cryptoHoldings: v ? data.cryptoHoldings : DEFAULT_CRYPTO_HOLDINGS
              });
            }}
          />
          
          {data.hasCryptoHoldings && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-slate-700">
              <CurrencyInput
                label="Current Crypto Value"
                value={data.cryptoHoldings.currentValue}
                onChange={(v) => updateRetirementData({ 
                  cryptoHoldings: { ...data.cryptoHoldings, currentValue: v }
                })}
                hint="Total crypto portfolio value"
              />
              <PercentInput
                label="Expected Annual Growth"
                value={data.cryptoHoldings.expectedGrowthRate}
                onChange={(v) => updateRetirementData({ 
                  cryptoHoldings: { ...data.cryptoHoldings, expectedGrowthRate: v }
                })}
                hint="Long-term expected return"
              />
              <PercentInput
                label="Volatility (Std Dev)"
                value={data.cryptoHoldings.volatility}
                onChange={(v) => updateRetirementData({ 
                  cryptoHoldings: { ...data.cryptoHoldings, volatility: v }
                })}
                hint="For Monte Carlo simulations"
              />
              <NumberInput
                label="Withdrawal Start Age"
                value={data.cryptoHoldings.withdrawalStartAge}
                onChange={(v) => updateRetirementData({ 
                  cryptoHoldings: { ...data.cryptoHoldings, withdrawalStartAge: v }
                })}
                min={data.currentAge}
                max={100}
                suffix="years"
              />
              <PercentInput
                label="Annual Withdrawal Rate"
                value={data.cryptoHoldings.withdrawalPercent}
                onChange={(v) => updateRetirementData({ 
                  cryptoHoldings: { ...data.cryptoHoldings, withdrawalPercent: v }
                })}
                hint="% of crypto to withdraw annually"
              />
              <Checkbox
                label="Include in retirement projections"
                checked={data.cryptoHoldings.includeInProjections}
                onChange={(v) => updateRetirementData({ 
                  cryptoHoldings: { ...data.cryptoHoldings, includeInProjections: v }
                })}
              />
            </div>
          )}
          
          <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <p className="text-xs text-amber-400">
              ⚠️ Cryptocurrency is highly volatile. Consider limiting crypto to 5-10% of your total portfolio. 
              The default 50% volatility reflects historical Bitcoin/Ethereum price swings.
            </p>
          </div>
        </div>
      </Card>

      {/* Inherited IRA */}
      <Card 
        title="📜 Inherited IRA" 
        subtitle="Track inherited retirement accounts with RMD rules"
      >
        <div className="space-y-4">
          <Checkbox
            label="I have an Inherited IRA"
            checked={data.hasInheritedIRA}
            onChange={(v) => {
              updateRetirementData({ 
                hasInheritedIRA: v,
                inheritedIRA: v ? data.inheritedIRA : DEFAULT_INHERITED_IRA
              });
            }}
          />
          
          {data.hasInheritedIRA && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-slate-700">
              <CurrencyInput
                label="Inherited IRA Balance"
                value={data.inheritedIRA.balance}
                onChange={(v) => updateRetirementData({ 
                  inheritedIRA: { ...data.inheritedIRA, balance: v }
                })}
              />
              <PercentInput
                label="Expected Growth Rate"
                value={data.inheritedIRA.expectedGrowthRate ?? 0.05}
                onChange={(v) => updateRetirementData({ 
                  inheritedIRA: { ...data.inheritedIRA, expectedGrowthRate: v }
                })}
                hint="Annual return while holding"
              />
              <NumberInput
                label="Year Inherited"
                value={data.inheritedIRA.inheritedYear}
                onChange={(v) => updateRetirementData({ 
                  inheritedIRA: { ...data.inheritedIRA, inheritedYear: v }
                })}
                min={1990}
                max={new Date().getFullYear()}
              />
              <NumberInput
                label="Original Owner Birth Year"
                value={data.inheritedIRA.originalOwnerBirthYear}
                onChange={(v) => updateRetirementData({ 
                  inheritedIRA: { ...data.inheritedIRA, originalOwnerBirthYear: v }
                })}
                min={1900}
                max={new Date().getFullYear()}
              />
              <Select
                label="Beneficiary Type"
                value={data.inheritedIRA.beneficiaryType}
                onChange={(v) => updateRetirementData({ 
                  inheritedIRA: { ...data.inheritedIRA, beneficiaryType: v as 'spouse' | 'non_spouse_eligible' | 'non_spouse_10_year' }
                })}
                options={[
                  { value: 'spouse', label: 'Spouse (can treat as own)' },
                  { value: 'non_spouse_eligible', label: 'Eligible Designated Beneficiary' },
                  { value: 'non_spouse_10_year', label: 'Non-Spouse (10-Year Rule)' },
                ]}
              />
              <Select
                label="Withdrawal Strategy"
                value={data.inheritedIRA.withdrawalStrategy || 'annual_rmd'}
                onChange={(v) => updateRetirementData({ 
                  inheritedIRA: { ...data.inheritedIRA, withdrawalStrategy: v as 'spread_evenly' | 'year_10_lump_sum' | 'back_loaded' | 'annual_rmd' }
                })}
                options={[
                  { value: 'annual_rmd', label: 'Annual RMDs (Life Expectancy)' },
                  { value: 'spread_evenly', label: 'Spread Evenly (10 years)' },
                  { value: 'back_loaded', label: 'Back-Loaded (Years 8-10)' },
                  { value: 'year_10_lump_sum', label: 'Year 10 Lump Sum' },
                ]}
              />
              {data.inheritedIRA.beneficiaryType === 'non_spouse_eligible' && (
                <Checkbox
                  label="Use Stretch IRA (Life Expectancy)"
                  checked={data.inheritedIRA.useStretchIRA}
                  onChange={(v) => updateRetirementData({ 
                    inheritedIRA: { ...data.inheritedIRA, useStretchIRA: v }
                  })}
                />
              )}
            </div>
          )}
          
          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 mt-2">
            <p className="text-xs text-blue-300 font-medium mb-1">Withdrawal Strategy Options:</p>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• <strong>Annual RMDs</strong> - Required if original owner was already taking RMDs (most common)</li>
              <li>• <strong>Spread Evenly</strong> - Divide balance equally over 10 years</li>
              <li>• <strong>Back-Loaded</strong> - Wait until years 8-10 to withdraw</li>
              <li>• <strong>Year 10 Lump Sum</strong> - No withdrawals until final year (if no annual RMD required)</li>
            </ul>
          </div>
          
          <p className="text-xs text-slate-400 mt-2">
            Note: SECURE Act 2.0 rules apply. If the original owner died AFTER starting RMDs, you must continue annual RMDs 
            AND empty the account within 10 years. If they died BEFORE RMDs started, you only need to empty by year 10.
          </p>
        </div>
      </Card>
      
      {/* Annual Contributions */}
      <Card title="📈 Annual Contributions" subtitle="How much you save each year (all account types)">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CurrencyInput
            label="Pre-Tax (401k/403b/TSP)"
            value={data.annualContributionPreTax}
            onChange={(v) => updateRetirementData({ annualContributionPreTax: v })}
            hint="2024 limit: $23,000 (under 50) / $30,500 (50+)"
          />
          <CurrencyInput
            label="Roth (401k Roth or Roth IRA)"
            value={data.annualContributionRoth}
            onChange={(v) => updateRetirementData({ annualContributionRoth: v })}
            hint="401k Roth: $23K / Roth IRA: $7K limit"
          />
          <CurrencyInput
            label="After-Tax (Brokerage/Taxable)"
            value={data.annualContributionAfterTax}
            onChange={(v) => updateRetirementData({ annualContributionAfterTax: v })}
            hint="Non-retirement taxable investments"
          />
          <CurrencyInput
            label="Employer 401k Match"
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
          <Checkbox
            label="Include Catch-Up Contributions (Age 50+)"
            checked={data.includeCatchUpContributions}
            onChange={(v) => updateRetirementData({ includeCatchUpContributions: v })}
          />
        </div>
      </Card>
      
      {/* Investment Returns */}
      <Card title="📊 Investment Returns" subtitle="Expected returns and inflation assumptions">
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
      
      {/* Retirement Income Needs */}
      <Card title="🎯 Retirement Income Needs" subtitle="Expected expenses and withdrawal strategy">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <CurrencyInput
            label="Desired Legacy Amount"
            value={data.desiredLegacy}
            onChange={(v) => updateRetirementData({ desiredLegacy: v })}
            hint="Amount you want to leave to heirs"
          />
        </div>
      </Card>

      {/* Healthcare Costs */}
      <Card 
        title="🏥 Healthcare Costs" 
        subtitle="Medical expenses before and after Medicare eligibility"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CurrencyInput
            label="Annual Healthcare Cost (Pre-Medicare)"
            value={data.annualHealthcareCost}
            onChange={(v) => updateRetirementData({ annualHealthcareCost: v })}
            hint="Insurance premiums + out-of-pocket"
          />
          <PercentInput
            label="Healthcare Inflation Rate"
            value={data.healthcareInflationRate}
            onChange={(v) => updateRetirementData({ healthcareInflationRate: v })}
            hint="Typically 5-7% per year"
          />
          <NumberInput
            label="Medicare Start Age"
            value={data.medicareStartAge}
            onChange={(v) => updateRetirementData({ medicareStartAge: v })}
            min={65}
            max={100}
            suffix="years"
          />
          <CurrencyInput
            label="Medicare Part B Premium (Monthly)"
            value={data.medicarePremium}
            onChange={(v) => updateRetirementData({ medicarePremium: v })}
            hint="2024 standard: $174.70/month"
          />
          <CurrencyInput
            label="Supplement/Advantage Premium (Monthly)"
            value={data.medicareSupplementPremium}
            onChange={(v) => updateRetirementData({ medicareSupplementPremium: v })}
            hint="Medigap or Medicare Advantage plan"
          />
        </div>
      </Card>
      
      {/* Social Security */}
      <Card title="🏛️ Social Security" subtitle="Your Social Security benefits">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CurrencyInput
            label="Your Social Security (Annual)"
            value={data.socialSecurityBenefit}
            onChange={(v) => updateRetirementData({ socialSecurityBenefit: v })}
          />
          <NumberInput
            label="Your SS Start Age"
            value={data.socialSecurityStartAge}
            onChange={(v) => updateRetirementData({ socialSecurityStartAge: v })}
            min={62}
            max={70}
          />
          <Checkbox
            label="Include Social Security in Projections"
            checked={data.includeSocialSecurity}
            onChange={(v) => updateRetirementData({ includeSocialSecurity: v })}
          />
        </div>
        <p className="text-xs text-slate-400 mt-4">
          Tip: Delaying Social Security from 62 to 70 can increase your benefit by ~77%. 
          Visit ssa.gov/myaccount for your personalized estimate.
        </p>
      </Card>

      {/* Pension */}
      <Card 
        title="🏢 Pension Income" 
        subtitle="Defined benefit pension details"
      >
        <div className="space-y-4">
          <Checkbox
            label="I have a pension"
            checked={data.hasPension}
            onChange={(v) => updateRetirementData({ hasPension: v })}
          />
          
          {data.hasPension && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-slate-700">
              <CurrencyInput
                label="Annual Pension Income"
                value={data.pensionIncome}
                onChange={(v) => updateRetirementData({ pensionIncome: v })}
              />
              <NumberInput
                label="Pension Start Age"
                value={data.pensionStartAge}
                onChange={(v) => updateRetirementData({ pensionStartAge: v })}
                min={data.currentAge}
                max={100}
              />
              <PercentInput
                label="Cost of Living Adjustment (COLA)"
                value={data.pensionCOLA}
                onChange={(v) => updateRetirementData({ pensionCOLA: v })}
                hint="Annual pension increase %"
              />
              {data.filingStatus === 'married' && (
                <PercentInput
                  label="Survivor Benefit"
                  value={data.pensionSurvivorBenefit}
                  onChange={(v) => updateRetirementData({ pensionSurvivorBenefit: v })}
                  hint="% of pension for surviving spouse"
                />
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Additional Income Sources */}
      <Card 
        title="💵 Additional Income Sources" 
        subtitle="Rental income, part-time work, annuities, etc."
      >
        <div className="space-y-4">
          {data.additionalIncome.map((source, index) => (
            <div key={source.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-medium text-white">Income Source #{index + 1}</h4>
                <button
                  onClick={() => removeIncomeSource(source.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={source.name}
                    onChange={(e) => updateIncomeSource(source.id, { name: e.target.value })}
                    placeholder="Enter income source name"
                    title="Income source name"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <Select
                  label="Type"
                  value={source.type}
                  onChange={(v) => updateIncomeSource(source.id, { type: v as IncomeSource['type'] })}
                  options={[
                    { value: 'rental', label: 'Rental Income' },
                    { value: 'part_time', label: 'Part-Time Work' },
                    { value: 'annuity', label: 'Annuity' },
                    { value: 'trust', label: 'Trust Distribution' },
                    { value: 'royalty', label: 'Royalty/Licensing' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
                <CurrencyInput
                  label="Annual Amount"
                  value={source.amount}
                  onChange={(v) => updateIncomeSource(source.id, { amount: v })}
                />
                <NumberInput
                  label="Start Age"
                  value={source.startAge}
                  onChange={(v) => updateIncomeSource(source.id, { startAge: v })}
                  min={data.currentAge}
                  max={120}
                />
                <NumberInput
                  label="End Age"
                  value={source.endAge}
                  onChange={(v) => updateIncomeSource(source.id, { endAge: v })}
                  min={source.startAge}
                  max={120}
                />
                <Checkbox
                  label="Adjust for Inflation"
                  checked={source.adjustForInflation}
                  onChange={(v) => updateIncomeSource(source.id, { adjustForInflation: v })}
                />
              </div>
            </div>
          ))}
          
          <Button 
            variant="secondary" 
            onClick={addIncomeSource}
            className="w-full"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Income Source
          </Button>
        </div>
      </Card>

      {/* Drawdown Strategy */}
      <Card 
        title="📉 Withdrawal Strategy" 
        subtitle="How to withdraw from different account types"
      >
        <div className="space-y-4">
          <Select
            label="Drawdown Strategy"
            value={data.drawdownStrategy}
            onChange={(v) => updateRetirementData({ drawdownStrategy: v as typeof data.drawdownStrategy })}
            options={[
              { value: 'traditional', label: 'Traditional (Taxable → Tax-Deferred → Tax-Free)' },
              { value: 'roth_first', label: 'Roth First (Tax-Free → Taxable → Tax-Deferred)' },
              { value: 'proportional', label: 'Proportional (Pro-rata from all accounts)' },
              { value: 'tax_efficient', label: 'Tax-Efficient (Optimize based on tax brackets)' },
            ]}
          />
          
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <h4 className="text-sm font-medium text-white mb-2">Strategy Explanation</h4>
            <p className="text-xs text-slate-400">
              {data.drawdownStrategy === 'traditional' && 
                "Traditional: Withdraw from taxable accounts first, then tax-deferred (401k/IRA), then Roth. This preserves tax-free growth longest."}
              {data.drawdownStrategy === 'roth_first' && 
                "Roth First: Use Roth funds first, then taxable, then tax-deferred. May be beneficial if you expect higher tax rates later."}
              {data.drawdownStrategy === 'proportional' && 
                "Proportional: Withdraw proportionally from all accounts. Provides consistent tax treatment each year."}
              {data.drawdownStrategy === 'tax_efficient' && 
                "Tax-Efficient: Optimizes withdrawals based on tax brackets. May include Roth conversions in low-income years."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Checkbox
              label="Include Required Minimum Distributions (RMDs)"
              checked={data.includeRMD}
              onChange={(v) => updateRetirementData({ includeRMD: v })}
            />
            <NumberInput
              label="RMD Start Age"
              value={data.rmdStartAge}
              onChange={(v) => updateRetirementData({ rmdStartAge: v })}
              min={72}
              max={75}
              hint="73 (born 1951-1959) or 75 (born 1960+)"
            />
          </div>
        </div>
      </Card>

      {/* Roth Conversion Strategy */}
      <Card 
        title="🔄 Roth Conversion Strategy" 
        subtitle="Plan tax-efficient Roth conversions"
      >
        <div className="space-y-4">
          <Checkbox
            label="Enable Roth Conversion Strategy"
            checked={data.rothConversionEnabled}
            onChange={(v) => updateRetirementData({ rothConversionEnabled: v })}
          />
          
          {data.rothConversionEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-slate-700">
              <CurrencyInput
                label="Annual Conversion Amount"
                value={data.rothConversionAmount}
                onChange={(v) => updateRetirementData({ rothConversionAmount: v })}
                hint="Amount to convert from Traditional to Roth each year"
              />
              <NumberInput
                label="Conversion Start Age"
                value={data.rothConversionStartAge}
                onChange={(v) => updateRetirementData({ rothConversionStartAge: v })}
                min={data.currentAge}
                max={data.rmdStartAge}
              />
              <NumberInput
                label="Conversion End Age"
                value={data.rothConversionEndAge}
                onChange={(v) => updateRetirementData({ rothConversionEndAge: v })}
                min={data.rothConversionStartAge}
                max={data.rmdStartAge}
              />
            </div>
          )}
          
          <p className="text-xs text-slate-400">
            Roth conversions can reduce future RMDs and create tax-free income. 
            Best done during low-income years (early retirement, before Social Security).
          </p>
        </div>
      </Card>
      
      {/* Simulation Settings */}
      <Card title="🎲 Monte Carlo Settings" subtitle="Parameters for retirement simulations">
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
