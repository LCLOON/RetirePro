'use client';

import { Card, CardGrid, StatCard } from '@/components/ui';
import { NumberInput, CurrencyInput } from '@/components/ui';
import { Button } from '@/components/ui';
import { useApp } from '@/lib/store';
import { formatCurrency } from '@/lib/calculations';
import { SS_BEND_POINTS, SS_BENEFIT_MULTIPLIERS } from '@/lib/types';
import { useState, useEffect } from 'react';

export function SocialSecurityTab() {
  const { state, updateSocialSecurityData, updateRetirementData, setActiveTab } = useApp();
  const ssData = state.socialSecurityData;
  const retData = state.retirementData;
  
  // Track if we've synced to retirement data
  const [synced, setSynced] = useState(false);
  
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
  
  // YOUR calculations
  const estimatedAIME = ssData.averageEarnings / 12;
  const pia = calculatePIA(estimatedAIME);
  const fraAge = 67; // Full Retirement Age for those born 1960 or later
  
  const yourBenefit62 = calculateAdjustedBenefit(pia, 62, fraAge);
  const yourBenefit67 = calculateAdjustedBenefit(pia, 67, fraAge);
  const yourBenefit70 = calculateAdjustedBenefit(pia, 70, fraAge);
  const yourSelectedBenefit = calculateAdjustedBenefit(pia, ssData.claimingAge, fraAge);
  
  // SPOUSE calculations
  const spouseAIME = (ssData.spouseAverageEarnings || 0) / 12;
  const spousePIA = calculatePIA(spouseAIME);
  
  const spouseBenefit62 = calculateAdjustedBenefit(spousePIA, 62, fraAge);
  const spouseBenefit67 = calculateAdjustedBenefit(spousePIA, 67, fraAge);
  const spouseBenefit70 = calculateAdjustedBenefit(spousePIA, 70, fraAge);
  const spouseSelectedBenefit = calculateAdjustedBenefit(spousePIA, ssData.spouseClaimingAge || 67, fraAge);
  
  // Combined household benefit
  const combinedBenefit = yourSelectedBenefit + (retData.hasSpouse ? spouseSelectedBenefit : 0);
  
  // Calculate lifetime benefits for comparison
  const lifeExpectancy = retData.lifeExpectancy;
  const spouseLifeExpectancy = retData.spouseLifeExpectancy;
  
  const lifetimeBenefit = (age: number, monthlyBenefit: number, lifeExp: number) => {
    const yearsCollecting = Math.max(0, lifeExp - age);
    return monthlyBenefit * 12 * yearsCollecting;
  };
  
  // Find optimal ages
  const yourLifetimes = [
    { age: 62, value: lifetimeBenefit(62, yourBenefit62, lifeExpectancy) },
    { age: 67, value: lifetimeBenefit(67, yourBenefit67, lifeExpectancy) },
    { age: 70, value: lifetimeBenefit(70, yourBenefit70, lifeExpectancy) },
  ];
  const yourOptimalAge = yourLifetimes.reduce((a, b) => (a.value > b.value ? a : b)).age;
  
  const spouseLifetimes = [
    { age: 62, value: lifetimeBenefit(62, spouseBenefit62, spouseLifeExpectancy) },
    { age: 67, value: lifetimeBenefit(67, spouseBenefit67, spouseLifeExpectancy) },
    { age: 70, value: lifetimeBenefit(70, spouseBenefit70, spouseLifeExpectancy) },
  ];
  const spouseOptimalAge = spouseLifetimes.reduce((a, b) => (a.value > b.value ? a : b)).age;
  
  // Sync SS data to retirement data (convert monthly to annual)
  const syncToRetirementData = () => {
    updateRetirementData({
      includeSocialSecurity: true,
      socialSecurityBenefit: Math.round(yourSelectedBenefit * 12), // Annual
      socialSecurityStartAge: ssData.claimingAge,
      spouseSocialSecurityBenefit: retData.hasSpouse ? Math.round(spouseSelectedBenefit * 12) : 0, // Annual
      spouseSocialSecurityStartAge: ssData.spouseClaimingAge || 67,
    });
    setSynced(true);
  };
  
  // Auto-sync when values change (after initial sync)
  useEffect(() => {
    if (synced) {
      updateRetirementData({
        socialSecurityBenefit: Math.round(yourSelectedBenefit * 12), // Annual
        socialSecurityStartAge: ssData.claimingAge,
        spouseSocialSecurityBenefit: retData.hasSpouse ? Math.round(spouseSelectedBenefit * 12) : 0, // Annual
        spouseSocialSecurityStartAge: ssData.spouseClaimingAge || 67,
      });
    }
  }, [yourSelectedBenefit, spouseSelectedBenefit, ssData.claimingAge, ssData.spouseClaimingAge, retData.hasSpouse]);
  
  return (
    <div className="space-y-6">
      {/* Header with Instructions */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🏛️</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">Social Security Estimator</h2>
            <p className="text-slate-300 text-sm mb-4">
              Enter your Social Security details first. Once complete, click &quot;Sync &amp; Continue&quot; to automatically 
              populate the Data Entry tab with your calculated benefits.
            </p>
            <div className="flex items-center gap-3">
              <Button 
                variant="primary"
                onClick={() => {
                  syncToRetirementData();
                  setActiveTab('data');
                }}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600"
              >
                ✅ Sync &amp; Continue to Data Entry
              </Button>
              {synced && (
                <span className="text-emerald-400 text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Data synced!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <CardGrid columns={4}>
        <StatCard
          label="Your Monthly Benefit"
          value={formatCurrency(yourSelectedBenefit)}
          subtitle={`At age ${ssData.claimingAge}`}
          color="blue"
        />
        {retData.hasSpouse && (
          <StatCard
            label="Spouse Monthly Benefit"
            value={formatCurrency(spouseSelectedBenefit)}
            subtitle={`At age ${ssData.spouseClaimingAge || 67}`}
            color="purple"
          />
        )}
        <StatCard
          label="Combined Monthly"
          value={formatCurrency(combinedBenefit)}
          subtitle="Household total"
          color="emerald"
        />
        <StatCard
          label="Annual Benefits"
          value={formatCurrency(combinedBenefit * 12)}
          subtitle="Per year"
          color="amber"
        />
      </CardGrid>
      
      {/* Input Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Your Information */}
        <Card title="👤 Your Social Security" subtitle="Enter your earnings history and claiming strategy">
          <div className="space-y-4">
            <CurrencyInput
              label="Your Average Annual Earnings"
              value={ssData.averageEarnings}
              onChange={(v) => updateSocialSecurityData({ averageEarnings: v })}
              helpText="Average of your highest 35 years of indexed earnings"
            />
            <NumberInput
              label="Your Birth Year"
              value={ssData.birthYear}
              onChange={(v) => updateSocialSecurityData({ birthYear: v })}
              min={1940}
              max={2000}
            />
            <NumberInput
              label="Your Planned Claiming Age"
              value={ssData.claimingAge}
              onChange={(v) => updateSocialSecurityData({ claimingAge: v })}
              min={62}
              max={70}
              helpText="When do you plan to start benefits? (62-70)"
            />
            
            {/* Your PIA breakdown */}
            <div className="pt-4 border-t border-slate-700">
              <h4 className="text-sm font-medium text-slate-300 mb-3">Your Benefit by Age</h4>
              <div className="space-y-2">
                {[
                  { age: 62, benefit: yourBenefit62, label: 'Early', color: 'text-amber-400' },
                  { age: 67, benefit: yourBenefit67, label: 'FRA', color: 'text-blue-400' },
                  { age: 70, benefit: yourBenefit70, label: 'Max', color: 'text-emerald-400' },
                ].map((row) => (
                  <div 
                    key={row.age}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      ssData.claimingAge === row.age ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-slate-800/50'
                    }`}
                  >
                    <span className="text-sm text-slate-300">
                      Age {row.age} ({row.label})
                      {row.age === yourOptimalAge && (
                        <span className="ml-2 text-emerald-400 text-xs">★ Optimal</span>
                      )}
                    </span>
                    <span className={`font-medium ${row.color}`}>
                      {formatCurrency(row.benefit)}/mo
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
        
        {/* Spouse Information */}
        <Card 
          title="👫 Spouse Social Security" 
          subtitle={retData.hasSpouse ? "Enter your spouse's details" : "Enable spouse to unlock"}
        >
          {!retData.hasSpouse ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👤</span>
              </div>
              <p className="text-slate-400 mb-4">
                To include spouse benefits, enable the spouse option below.
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  updateRetirementData({ filingStatus: 'married', hasSpouse: true });
                }}
              >
                👫 Enable Spouse
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <CurrencyInput
                label="Spouse Average Annual Earnings"
                value={ssData.spouseAverageEarnings || 0}
                onChange={(v) => updateSocialSecurityData({ spouseAverageEarnings: v })}
                helpText="Average of spouse's highest 35 years"
              />
              <NumberInput
                label="Spouse Birth Year"
                value={ssData.spouseBirthYear || 1965}
                onChange={(v) => updateSocialSecurityData({ spouseBirthYear: v })}
                min={1940}
                max={2000}
              />
              <NumberInput
                label="Spouse Planned Claiming Age"
                value={ssData.spouseClaimingAge || 67}
                onChange={(v) => updateSocialSecurityData({ spouseClaimingAge: v })}
                min={62}
                max={70}
                helpText="When will spouse start benefits? (62-70)"
              />
              
              {/* Spouse PIA breakdown */}
              <div className="pt-4 border-t border-slate-700">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Spouse Benefit by Age</h4>
                <div className="space-y-2">
                  {[
                    { age: 62, benefit: spouseBenefit62, label: 'Early', color: 'text-amber-400' },
                    { age: 67, benefit: spouseBenefit67, label: 'FRA', color: 'text-blue-400' },
                    { age: 70, benefit: spouseBenefit70, label: 'Max', color: 'text-emerald-400' },
                  ].map((row) => (
                    <div 
                      key={row.age}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        (ssData.spouseClaimingAge || 67) === row.age ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-slate-800/50'
                      }`}
                    >
                      <span className="text-sm text-slate-300">
                        Age {row.age} ({row.label})
                        {row.age === spouseOptimalAge && (
                          <span className="ml-2 text-emerald-400 text-xs">★ Optimal</span>
                        )}
                      </span>
                      <span className={`font-medium ${row.color}`}>
                        {formatCurrency(row.benefit)}/mo
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
      
      {/* Strategy Comparison */}
      <Card title="📊 Claiming Strategy Comparison" subtitle="Compare different claiming age scenarios">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Scenario</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Your Monthly</th>
                {retData.hasSpouse && (
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Spouse Monthly</th>
                )}
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Combined Annual</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Lifetime Total*</th>
              </tr>
            </thead>
            <tbody>
              {[
                { 
                  label: 'Both at 62 (Early)', 
                  yourBenefit: yourBenefit62, 
                  spouseBenefit: spouseBenefit62,
                  yourAge: 62,
                  spouseAge: 62
                },
                { 
                  label: 'Both at 67 (FRA)', 
                  yourBenefit: yourBenefit67, 
                  spouseBenefit: spouseBenefit67,
                  yourAge: 67,
                  spouseAge: 67
                },
                { 
                  label: 'Both at 70 (Maximum)', 
                  yourBenefit: yourBenefit70, 
                  spouseBenefit: spouseBenefit70,
                  yourAge: 70,
                  spouseAge: 70
                },
                { 
                  label: 'Your Selection', 
                  yourBenefit: yourSelectedBenefit, 
                  spouseBenefit: spouseSelectedBenefit,
                  yourAge: ssData.claimingAge,
                  spouseAge: ssData.spouseClaimingAge || 67,
                  isSelected: true
                },
              ].map((row, idx) => {
                const combined = row.yourBenefit + (retData.hasSpouse ? row.spouseBenefit : 0);
                const yourLifetime = lifetimeBenefit(row.yourAge, row.yourBenefit, lifeExpectancy);
                const spouseLifetime = retData.hasSpouse 
                  ? lifetimeBenefit(row.spouseAge, row.spouseBenefit, spouseLifeExpectancy)
                  : 0;
                const totalLifetime = yourLifetime + spouseLifetime;
                
                return (
                  <tr 
                    key={idx}
                    className={`border-b border-slate-700/50 ${
                      row.isSelected ? 'bg-emerald-500/10' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="py-3 px-4 text-white font-medium">
                      {row.label}
                      {row.isSelected && <span className="ml-2 text-emerald-400">✓</span>}
                    </td>
                    <td className="py-3 px-4 text-right text-blue-400">
                      {formatCurrency(row.yourBenefit)}
                    </td>
                    {retData.hasSpouse && (
                      <td className="py-3 px-4 text-right text-purple-400">
                        {formatCurrency(row.spouseBenefit)}
                      </td>
                    )}
                    <td className="py-3 px-4 text-right text-emerald-400 font-medium">
                      {formatCurrency(combined * 12)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">
                      {formatCurrency(totalLifetime)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-4">
          * Lifetime totals based on life expectancy of {lifeExpectancy} (you) 
          {retData.hasSpouse && ` and ${spouseLifeExpectancy} (spouse)`}. 
          Does not include COLA adjustments.
        </p>
      </Card>
      
      {/* Bend Points Info */}
      <Card title="📈 2025 Social Security Formula" subtitle="How your benefit is calculated from earnings">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <h4 className="font-medium text-white">First Tier</h4>
            <p className="text-3xl font-bold text-emerald-400 mt-2">90%</p>
            <p className="text-sm text-slate-400 mt-1">
              of first ${formatCurrency(SS_BEND_POINTS.firstBendPoint)} AIME
            </p>
          </div>
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="font-medium text-white">Second Tier</h4>
            <p className="text-3xl font-bold text-blue-400 mt-2">32%</p>
            <p className="text-sm text-slate-400 mt-1">
              ${formatCurrency(SS_BEND_POINTS.firstBendPoint)} to ${formatCurrency(SS_BEND_POINTS.secondBendPoint)}
            </p>
          </div>
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <h4 className="font-medium text-white">Third Tier</h4>
            <p className="text-3xl font-bold text-purple-400 mt-2">15%</p>
            <p className="text-sm text-slate-400 mt-1">
              over ${formatCurrency(SS_BEND_POINTS.secondBendPoint)}
            </p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-slate-800/50 rounded-lg">
          <h4 className="font-medium text-white mb-2">💡 Claiming Age Impact</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-amber-400 font-medium">Early (62):</span>
              <span className="text-slate-300 ml-2">~30% reduction</span>
            </div>
            <div>
              <span className="text-blue-400 font-medium">FRA (67):</span>
              <span className="text-slate-300 ml-2">100% of PIA</span>
            </div>
            <div>
              <span className="text-emerald-400 font-medium">Max (70):</span>
              <span className="text-slate-300 ml-2">~24% increase</span>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Bottom CTA */}
      <div className="flex justify-center gap-4">
        <Button 
          variant="primary"
          onClick={() => {
            syncToRetirementData();
            setActiveTab('data');
          }}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-8"
        >
          ✅ Sync &amp; Continue to Data Entry →
        </Button>
      </div>
    </div>
  );
}
