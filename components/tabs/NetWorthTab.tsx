'use client';

import { Card, CardGrid, StatCard } from '@/components/ui';
import { CurrencyInput } from '@/components/ui';
import { useApp } from '@/lib/store';
import { calculateNetWorthSummary, formatCurrency } from '@/lib/calculations';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export function NetWorthTab() {
  const { state, updateNetWorthData } = useApp();
  const data = state.netWorthData;
  const summary = calculateNetWorthSummary(data);
  
  // Prepare chart data
  const assetData = Object.entries(data.assets)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      name: formatLabel(key),
      value,
    }));
  
  const liabilityData = Object.entries(data.liabilities)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      name: formatLabel(key),
      value,
    }));
  
  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899'];
  
  function formatLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
  
  return (
    <div className="space-y-6">
      {/* Net Worth Summary */}
      <CardGrid columns={3}>
        <StatCard
          label="Total Assets"
          value={formatCurrency(summary.totalAssets)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend="up"
          trendValue="Assets"
        />
        <StatCard
          label="Total Liabilities"
          value={formatCurrency(summary.totalLiabilities)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          }
          trend="down"
          trendValue="Debts"
        />
        <StatCard
          label="Net Worth"
          value={formatCurrency(summary.netWorth)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          }
          trend={summary.netWorth > 0 ? 'up' : 'down'}
          trendValue={summary.netWorth > 0 ? 'Positive' : 'Negative'}
        />
      </CardGrid>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Asset Breakdown">
          <div className="h-80">
            {assetData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {assetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Enter asset values to see breakdown
              </div>
            )}
          </div>
        </Card>
        
        <Card title="Liability Breakdown">
          <div className="h-80">
            {liabilityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={liabilityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {liabilityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#EF4444', '#F59E0B', '#F97316', '#DC2626'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Enter liability values to see breakdown
              </div>
            )}
          </div>
        </Card>
      </div>
      
      {/* Assets */}
      <Card title="Assets" subtitle="Enter the current value of your assets">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CurrencyInput
            label="Cash & Savings"
            value={data.assets.cashSavings}
            onChange={(v) => updateNetWorthData({ 
              assets: { ...data.assets, cashSavings: v }
            })}
          />
          <CurrencyInput
            label="Checking Accounts"
            value={data.assets.checking}
            onChange={(v) => updateNetWorthData({ 
              assets: { ...data.assets, checking: v }
            })}
          />
          <CurrencyInput
            label="Retirement Accounts"
            value={data.assets.retirement}
            onChange={(v) => updateNetWorthData({ 
              assets: { ...data.assets, retirement: v }
            })}
          />
          <CurrencyInput
            label="Brokerage / Investments"
            value={data.assets.brokerage}
            onChange={(v) => updateNetWorthData({ 
              assets: { ...data.assets, brokerage: v }
            })}
          />
          <CurrencyInput
            label="Real Estate"
            value={data.assets.realEstate}
            onChange={(v) => updateNetWorthData({ 
              assets: { ...data.assets, realEstate: v }
            })}
          />
          <CurrencyInput
            label="Vehicles"
            value={data.assets.vehicles}
            onChange={(v) => updateNetWorthData({ 
              assets: { ...data.assets, vehicles: v }
            })}
          />
          <CurrencyInput
            label="Other Assets"
            value={data.assets.other}
            onChange={(v) => updateNetWorthData({ 
              assets: { ...data.assets, other: v }
            })}
          />
        </div>
      </Card>
      
      {/* Liabilities */}
      <Card title="Liabilities" subtitle="Enter your current debts and obligations">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CurrencyInput
            label="Mortgage"
            value={data.liabilities.mortgage}
            onChange={(v) => updateNetWorthData({ 
              liabilities: { ...data.liabilities, mortgage: v }
            })}
          />
          <CurrencyInput
            label="Auto Loans"
            value={data.liabilities.autoLoans}
            onChange={(v) => updateNetWorthData({ 
              liabilities: { ...data.liabilities, autoLoans: v }
            })}
          />
          <CurrencyInput
            label="Student Loans"
            value={data.liabilities.studentLoans}
            onChange={(v) => updateNetWorthData({ 
              liabilities: { ...data.liabilities, studentLoans: v }
            })}
          />
          <CurrencyInput
            label="Credit Cards"
            value={data.liabilities.creditCards}
            onChange={(v) => updateNetWorthData({ 
              liabilities: { ...data.liabilities, creditCards: v }
            })}
          />
          <CurrencyInput
            label="Other Debts"
            value={data.liabilities.other}
            onChange={(v) => updateNetWorthData({ 
              liabilities: { ...data.liabilities, other: v }
            })}
          />
        </div>
      </Card>
    </div>
  );
}
