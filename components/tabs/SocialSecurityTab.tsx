'use client';

import { Card, CardGrid, StatCard } from '@/components/ui';
import { NumberInput, CurrencyInput } from '@/components/ui';
import { useApp } from '@/lib/store';
import { formatCurrency } from '@/lib/calculations';
import { SS_BEND_POINTS, SS_BENEFIT_MULTIPLIERS } from '@/lib/types';

export function SocialSecurityTab() {
  const { state, updateSocialSecurityData, updateRetirementData } = useApp();
  const ssData = state.socialSecurityData;
  const retData = state.retirementData;
  
  // Calculate PIA (Primary Insurance Amount) based on AIME
  const calculatePIA = (aime: number): number => {
    const { firstBendPoint, secondBendPoint } = SS_BEND_POINTS;
    const { firstTier, secondTier, thirdTier } = SS_BENEFIT_MULTIPLIERS;
    
    if (aime <= firstBendPoint) {
      return aime * firstTier;
    } else if (aime <= secondBendPoint) {
      return firstBendPoint * firstTier + (aime - firstBendPoint) * secondTier;
    } else {
      return firstBendPoint * firstTier + 
             (secondBendPoint - firstBendPoint) * secondTier + 
             (aime - secondBendPoint) * thirdTier;
    }
  };
  
  // Calculate benefit adjustment based on claiming age
  const calculateAdjustedBenefit = (pia: number, claimAge: number, fra: number): number => {
    const monthsDiff = (claimAge - fra) * 12;
    
    if (monthsDiff < 0) {
      // Early claiming - reduce benefit
      const monthsEarly = Math.abs(monthsDiff);
      if (monthsEarly <= 36) {
        return pia * (1 - monthsEarly * (5 / 9 / 100));
      } else {
        const reduction36 = 36 * (5 / 9 / 100);
        const additionalMonths = monthsEarly - 36;
        return pia * (1 - reduction36 - additionalMonths * (5 / 12 / 100));
      }
    } else if (monthsDiff > 0) {
      // Delayed claiming - increase benefit (8% per year)
      return pia * (1 + monthsDiff * (8 / 12 / 100));
    }
    
    return pia;
  };
  
  // Estimate AIME from current salary
  const estimatedAIME = ssData.averageEarnings / 12;
  const pia = calculatePIA(estimatedAIME);
  const fraAge = 67; // Full Retirement Age for those born 1960 or later
  
  const benefit62 = calculateAdjustedBenefit(pia, 62, fraAge);
  const benefit67 = calculateAdjustedBenefit(pia, 67, fraAge);
  const benefit70 = calculateAdjustedBenefit(pia, 70, fraAge);
  
  const selectedBenefit = calculateAdjustedBenefit(pia, ssData.claimingAge, fraAge);
  
  // Calculate lifetime benefits for comparison
  const lifeExpectancy = retData.lifeExpectancy;
  const lifetimeBenefit = (age: number, monthlyBenefit: number) => {
    const yearsCollecting = Math.max(0, lifeExpectancy - age);
    return monthlyBenefit * 12 * yearsCollecting;
  };
  
  const lifetime62 = lifetimeBenefit(62, benefit62);
  const lifetime67 = lifetimeBenefit(67, benefit67);
  const lifetime70 = lifetimeBenefit(70, benefit70);
  
  // Find optimal age
  const lifetimes = [
    { age: 62, value: lifetime62 },
    { age: 67, value: lifetime67 },
    { age: 70, value: lifetime70 },
  ];
  const optimalAge = lifetimes.reduce((a, b) => (a.value > b.value ? a : b)).age;
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <CardGrid columns={4}>
        <StatCard
          label="Your PIA"
          value={formatCurrency(pia)}
          subtitle="Primary Insurance Amount"
          color="blue"
        />
        <StatCard
          label="At Age 62"
          value={formatCurrency(benefit62)}
          subtitle={`${((benefit62 / pia) * 100).toFixed(0)}% of PIA`}
          color="amber"
        />
        <StatCard
          label="At Age 67 (FRA)"
          value={formatCurrency(benefit67)}
          subtitle="Full Retirement Age"
          color="green"
        />
        <StatCard
          label="At Age 70"
          value={formatCurrency(benefit70)}
          subtitle={`${((benefit70 / pia) * 100).toFixed(0)}% of PIA`}
          color="purple"
        />
      </CardGrid>
      
      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Your Information" subtitle="Enter your Social Security details">
          <div className="space-y-4">
            <CurrencyInput
              label="Average Annual Earnings"
              value={ssData.averageEarnings}
              onChange={(v) => updateSocialSecurityData({ averageEarnings: v })}
              helpText="Your average indexed monthly earnings (top 35 years)"
            />
            <NumberInput
              label="Planned Claiming Age"
              value={ssData.claimingAge}
              onChange={(v) => updateSocialSecurityData({ claimingAge: v })}
              min={62}
              max={70}
              helpText="When do you plan to start receiving benefits?"
            />
            <NumberInput
              label="Your Birth Year"
              value={ssData.birthYear}
              onChange={(v) => updateSocialSecurityData({ birthYear: v })}
              min={1940}
              max={2000}
            />
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Link to Retirement Plan</h4>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={retData.includeSocialSecurity}
                    onChange={(e) => updateRetirementData({ includeSocialSecurity: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Include in retirement calculations
                  </span>
                </label>
              </div>
              {retData.includeSocialSecurity && (
                <div className="mt-4 space-y-4">
                  <NumberInput
                    label="Start Age for Retirement Calc"
                    value={retData.socialSecurityStartAge}
                    onChange={(v) => updateRetirementData({ socialSecurityStartAge: v })}
                    min={62}
                    max={70}
                  />
                  <CurrencyInput
                    label="Monthly Benefit Amount"
                    value={retData.socialSecurityBenefit}
                    onChange={(v) => updateRetirementData({ socialSecurityBenefit: v })}
                  />
                </div>
              )}
            </div>
          </div>
        </Card>
        
        <Card title="Claiming Strategy Analysis" subtitle="Compare your options">
          <div className="space-y-4">
            {/* Selected Age Result */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Your Selected Age: {ssData.claimingAge}
                </span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(selectedBenefit)}/mo
                </span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Lifetime total: {formatCurrency(lifetimeBenefit(ssData.claimingAge, selectedBenefit))}
              </p>
            </div>
            
            {/* Comparison Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Claiming Age
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Monthly
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Lifetime*
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {[
                    { age: 62, benefit: benefit62, lifetime: lifetime62, label: 'Early' },
                    { age: 67, benefit: benefit67, lifetime: lifetime67, label: 'FRA' },
                    { age: 70, benefit: benefit70, lifetime: lifetime70, label: 'Maximum' },
                  ].map((row) => (
                    <tr 
                      key={row.age}
                      className={`
                        ${ssData.claimingAge === row.age ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                        ${row.age === optimalAge ? 'ring-2 ring-green-500 ring-inset' : ''}
                      `}
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {row.age} ({row.label})
                        {row.age === optimalAge && (
                          <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-medium">
                            ★ Optimal
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-medium">
                        {formatCurrency(row.benefit)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                        {formatCurrency(row.lifetime)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400">
              * Lifetime benefits calculated assuming life expectancy of {lifeExpectancy} years.
              Actual benefits may vary based on COLA adjustments.
            </p>
          </div>
        </Card>
      </div>
      
      {/* Bend Points Info */}
      <Card title="2025 Social Security Bend Points" subtitle="How your benefit is calculated">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white">First Tier</h4>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">90%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              of first ${formatCurrency(SS_BEND_POINTS.firstBendPoint)} AIME
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white">Second Tier</h4>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">32%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              of AIME from ${formatCurrency(SS_BEND_POINTS.firstBendPoint)} to ${formatCurrency(SS_BEND_POINTS.secondBendPoint)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white">Third Tier</h4>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">15%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              of AIME over ${formatCurrency(SS_BEND_POINTS.secondBendPoint)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
