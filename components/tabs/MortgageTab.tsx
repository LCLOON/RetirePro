'use client';

import { useState } from 'react';
import { Card, CardGrid, StatCard } from '@/components/ui';
import { CurrencyInput, NumberInput, PercentInput, SelectInput, TextInput } from '@/components/ui';
import { Button } from '@/components/ui';
import { useApp } from '@/lib/store';
import { calculateMortgagePayment, generateAmortizationSchedule, formatCurrency } from '@/lib/calculations';
import type { MortgageEntry } from '@/lib/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Property type options
const PROPERTY_TYPES = [
  { value: 'primary', label: 'Primary Residence' },
  { value: 'investment', label: 'Investment Property' },
  { value: 'vacation', label: 'Vacation Home' },
  { value: 'rental', label: 'Rental Property' },
];

// Collapsible mortgage card
function MortgageCard({
  mortgage,
  onUpdate,
  onRemove,
  canRemove,
  isExpanded,
  onToggle,
}: {
  mortgage: MortgageEntry;
  onUpdate: (data: Partial<MortgageEntry>) => void;
  onRemove: () => void;
  canRemove: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [showAmortization, setShowAmortization] = useState(false);
  
  // Calculate equity
  const equity = mortgage.currentHomeValue - mortgage.currentBalance;
  const equityPercent = mortgage.currentHomeValue > 0 
    ? (equity / mortgage.currentHomeValue) * 100 
    : 0;
  const ltv = mortgage.currentHomeValue > 0 
    ? (mortgage.currentBalance / mortgage.currentHomeValue) * 100 
    : 0;
  
  // Calculate monthly payment
  const monthlyPayment = calculateMortgagePayment(
    mortgage.currentBalance,
    mortgage.interestRate,
    mortgage.loanTermYears - (new Date().getFullYear() - mortgage.startYear)
  );
  
  const remainingYears = Math.max(0, mortgage.loanTermYears - (new Date().getFullYear() - mortgage.startYear));
  const totalMonthlyPayment = monthlyPayment + 
    (mortgage.propertyTax / 12) + 
    (mortgage.insurance / 12) + 
    (mortgage.pmi / 12) + 
    (mortgage.hoaFees);
  
  // Amortization
  const amortization = generateAmortizationSchedule(
    mortgage.currentBalance,
    mortgage.interestRate,
    remainingYears,
    mortgage.extraPayment
  );
  
  const totalInterest = amortization.reduce((sum, a) => sum + a.interest, 0);
  
  // Property type color
  const typeColors: Record<string, string> = {
    primary: 'bg-blue-500',
    investment: 'bg-green-500',
    vacation: 'bg-purple-500',
    rental: 'bg-orange-500',
  };
  
  return (
    <div className="border border-slate-700/50 rounded-lg overflow-hidden bg-slate-800/50 shadow-sm">
      {/* Header */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${typeColors[mortgage.propertyType]}`} />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{mortgage.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {mortgage.location || PROPERTY_TYPES.find(t => t.value === mortgage.propertyType)?.label}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="font-bold text-green-600 dark:text-green-400">{formatCurrency(equity)}</p>
            <p className="text-xs text-gray-500">Equity ({equityPercent.toFixed(1)}%)</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(mortgage.currentBalance)}</p>
            <p className="text-xs text-gray-500">Balance</p>
          </div>
          <svg 
            className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-slate-700/50 p-4 space-y-6 bg-slate-800/30">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-900/30 rounded-lg">
              <p className="text-xs font-medium text-blue-400">Home Value</p>
              <p className="text-lg font-bold text-blue-300">{formatCurrency(mortgage.currentHomeValue)}</p>
            </div>
            <div className="p-3 bg-green-900/30 rounded-lg">
              <p className="text-xs font-medium text-green-400">Equity</p>
              <p className="text-lg font-bold text-green-300">{formatCurrency(equity)}</p>
            </div>
            <div className="p-3 bg-amber-900/30 rounded-lg">
              <p className="text-xs font-medium text-amber-400">Monthly Payment</p>
              <p className="text-lg font-bold text-amber-300">{formatCurrency(totalMonthlyPayment)}</p>
            </div>
            <div className="p-3 bg-purple-900/30 rounded-lg">
              <p className="text-xs font-medium text-purple-400">LTV Ratio</p>
              <p className="text-lg font-bold text-purple-300">{ltv.toFixed(1)}%</p>
            </div>
          </div>
          
          {/* Equity Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-400">Equity Progress</span>
              <span className="font-medium text-white">{equityPercent.toFixed(1)}% owned</span>
            </div>
            <div className="h-4 bg-slate-600 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                style={{ width: `${Math.min(equityPercent, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1 text-slate-400">
              <span>{formatCurrency(equity)} equity</span>
              <span>{formatCurrency(mortgage.currentBalance)} remaining</span>
            </div>
          </div>
          
          {/* Property Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Property Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <TextInput
                label="Property Name"
                value={mortgage.name}
                onChange={(v) => onUpdate({ name: v })}
                placeholder="e.g., 123 Main St"
              />
              <SelectInput
                label="Property Type"
                value={mortgage.propertyType}
                onChange={(v) => onUpdate({ propertyType: v as MortgageEntry['propertyType'] })}
                options={PROPERTY_TYPES}
              />
              <TextInput
                label="Location (City, State)"
                value={mortgage.location}
                onChange={(v) => onUpdate({ location: v })}
                placeholder="e.g., Austin, TX"
              />
              <CurrencyInput
                label="Current Home Value"
                value={mortgage.currentHomeValue}
                onChange={(v) => onUpdate({ currentHomeValue: v })}
              />
              <CurrencyInput
                label="Purchase Price"
                value={mortgage.purchasePrice}
                onChange={(v) => onUpdate({ purchasePrice: v })}
              />
              <NumberInput
                label="Purchase Year"
                value={mortgage.purchaseYear}
                onChange={(v) => onUpdate({ purchaseYear: v })}
                min={1950}
                max={new Date().getFullYear()}
              />
              {(mortgage.propertyType === 'rental' || mortgage.propertyType === 'investment') && (
                <CurrencyInput
                  label="Monthly Rental Income"
                  value={mortgage.monthlyRentalIncome}
                  onChange={(v) => onUpdate({ monthlyRentalIncome: v })}
                />
              )}
            </div>
          </div>
          
          {/* Loan Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Loan Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <CurrencyInput
                label="Original Loan Amount"
                value={mortgage.loanAmount}
                onChange={(v) => onUpdate({ loanAmount: v })}
              />
              <CurrencyInput
                label="Current Balance"
                value={mortgage.currentBalance}
                onChange={(v) => onUpdate({ currentBalance: v })}
              />
              <PercentInput
                label="Interest Rate"
                value={mortgage.interestRate}
                onChange={(v) => onUpdate({ interestRate: v })}
              />
              <NumberInput
                label="Loan Term"
                value={mortgage.loanTermYears}
                onChange={(v) => onUpdate({ loanTermYears: v })}
                min={1}
                max={40}
                suffix="years"
              />
              <NumberInput
                label="Start Year"
                value={mortgage.startYear}
                onChange={(v) => onUpdate({ startYear: v })}
                min={1980}
                max={new Date().getFullYear()}
              />
              <CurrencyInput
                label="Extra Monthly Payment"
                value={mortgage.extraPayment}
                onChange={(v) => onUpdate({ extraPayment: v })}
                hint="Additional principal"
              />
            </div>
          </div>
          
          {/* Monthly Costs */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Monthly Costs
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <CurrencyInput
                label="Property Tax (Annual)"
                value={mortgage.propertyTax}
                onChange={(v) => onUpdate({ propertyTax: v })}
              />
              <CurrencyInput
                label="Insurance (Annual)"
                value={mortgage.insurance}
                onChange={(v) => onUpdate({ insurance: v })}
              />
              <CurrencyInput
                label="PMI (Annual)"
                value={mortgage.pmi}
                onChange={(v) => onUpdate({ pmi: v })}
                hint={ltv > 80 ? 'PMI required (LTV > 80%)' : 'No PMI needed'}
              />
              <CurrencyInput
                label="HOA Fees (Monthly)"
                value={mortgage.hoaFees}
                onChange={(v) => onUpdate({ hoaFees: v })}
              />
            </div>
          </div>
          
          {/* Payment Summary */}
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <h4 className="font-semibold text-white mb-3">Payment Breakdown</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Principal & Interest</p>
                <p className="font-semibold">{formatCurrency(monthlyPayment)}</p>
              </div>
              <div>
                <p className="text-gray-500">Property Tax</p>
                <p className="font-semibold">{formatCurrency(mortgage.propertyTax / 12)}</p>
              </div>
              <div>
                <p className="text-gray-500">Insurance</p>
                <p className="font-semibold">{formatCurrency(mortgage.insurance / 12)}</p>
              </div>
              <div>
                <p className="text-gray-500">PMI</p>
                <p className="font-semibold">{formatCurrency(mortgage.pmi / 12)}</p>
              </div>
              <div>
                <p className="text-gray-500">HOA</p>
                <p className="font-semibold">{formatCurrency(mortgage.hoaFees)}</p>
              </div>
              <div className="bg-blue-900/40 -m-2 p-2 rounded">
                <p className="text-blue-400 font-medium">Total Monthly</p>
                <p className="font-bold text-blue-300">{formatCurrency(totalMonthlyPayment)}</p>
              </div>
            </div>
          </div>
          
          {/* Visual Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Breakdown Pie Chart */}
            <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
              <h4 className="font-semibold text-white mb-3 text-sm">Monthly Payment Breakdown</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Principal & Interest', value: monthlyPayment, color: '#3B82F6' },
                        { name: 'Property Tax', value: mortgage.propertyTax / 12, color: '#10B981' },
                        { name: 'Insurance', value: mortgage.insurance / 12, color: '#8B5CF6' },
                        { name: 'PMI', value: mortgage.pmi / 12, color: '#F59E0B' },
                        { name: 'HOA', value: mortgage.hoaFees, color: '#EF4444' },
                      ].filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {[
                        { color: '#3B82F6' },
                        { color: '#10B981' },
                        { color: '#8B5CF6' },
                        { color: '#F59E0B' },
                        { color: '#EF4444' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs mt-2">
                {[
                  { name: 'P&I', value: monthlyPayment, color: '#3B82F6' },
                  { name: 'Tax', value: mortgage.propertyTax / 12, color: '#10B981' },
                  { name: 'Insurance', value: mortgage.insurance / 12, color: '#8B5CF6' },
                  { name: 'PMI', value: mortgage.pmi / 12, color: '#F59E0B' },
                  { name: 'HOA', value: mortgage.hoaFees, color: '#EF4444' },
                ].filter(d => d.value > 0).map((item) => (
                  <div key={item.name} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600 dark:text-gray-400 truncate">{item.name}: {formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Amortization Chart - Principal vs Interest Over Time */}
            <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
              <h4 className="font-semibold text-white mb-3 text-sm">Balance Paydown Over Time</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={amortization.filter((_, i) => i % 12 === 0 || i === amortization.length - 1).map(row => ({
                      year: Math.ceil(row.month / 12),
                      balance: row.endingBalance,
                      equity: mortgage.currentHomeValue - row.endingBalance,
                    }))}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="year" tick={{ fontSize: 10 }} tickFormatter={(v) => `Yr ${v}`} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Area type="monotone" dataKey="equity" stackId="1" fill="#10B981" stroke="#10B981" name="Equity" />
                    <Area type="monotone" dataKey="balance" stackId="1" fill="#EF4444" stroke="#EF4444" name="Remaining Debt" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 text-xs mt-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span className="text-gray-600 dark:text-gray-400">Equity</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-red-500" />
                  <span className="text-gray-600 dark:text-gray-400">Remaining Debt</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Principal vs Interest Over Loan Life */}
          <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
            <h4 className="font-semibold text-white mb-3 text-sm">Monthly Principal vs Interest</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={amortization.filter((_, i) => i % 6 === 0).map(row => ({
                    month: row.month,
                    principal: row.principal,
                    interest: row.interest,
                  }))}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} tickFormatter={(v) => `Mo ${v}`} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v.toFixed(0)}`} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="principal" fill="#3B82F6" stroke="#3B82F6" name="Principal" />
                  <Area type="monotone" dataKey="interest" fill="#F59E0B" stroke="#F59E0B" name="Interest" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Over time, more of your payment goes to principal as the loan balance decreases
            </p>
          </div>
          
          {/* Amortization Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Remaining: {remainingYears} years | Total Interest: {formatCurrency(totalInterest)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAmortization(!showAmortization)}
              >
                {showAmortization ? 'Hide' : 'Show'} Amortization
              </Button>
              {canRemove && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onRemove}
                  className="text-red-600 hover:bg-red-50"
                >
                  Remove Property
                </Button>
              )}
            </div>
          </div>
          
          {/* Amortization Table */}
          {showAmortization && (
            <div className="overflow-x-auto max-h-[500px] border rounded-lg">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-700">
                  <tr>
                    <th className="text-left py-2 px-3 font-semibold">Month</th>
                    <th className="text-right py-2 px-3 font-semibold">Payment</th>
                    <th className="text-right py-2 px-3 font-semibold">Principal</th>
                    <th className="text-right py-2 px-3 font-semibold">Interest</th>
                    <th className="text-right py-2 px-3 font-semibold">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {amortization.map((row) => (
                    <tr key={row.month} className="border-t border-gray-100 dark:border-gray-600">
                      <td className="py-2 px-3">{row.month}</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(row.payment)}</td>
                      <td className="py-2 px-3 text-right text-blue-600">{formatCurrency(row.principal)}</td>
                      <td className="py-2 px-3 text-right text-red-600">{formatCurrency(row.interest)}</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(Math.max(0, row.endingBalance))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-center text-gray-500 py-2 text-xs bg-slate-700/50">
                Showing all {amortization.length} months ({(amortization.length / 12).toFixed(1)} years)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function MortgageTab() {
  const { state, addMortgage, updateMortgageEntry, removeMortgage } = useApp();
  const mortgages = state.mortgageData.mortgages;
  
  const [expandedId, setExpandedId] = useState<string | null>(mortgages[0]?.id || null);
  
  // Calculate totals
  const totalPropertyValue = mortgages.reduce((sum, m) => sum + m.currentHomeValue, 0);
  const totalDebt = mortgages.reduce((sum, m) => sum + m.currentBalance, 0);
  const totalEquity = totalPropertyValue - totalDebt;
  const totalMonthlyPayments = mortgages.reduce((sum, m) => {
    const remainingYears = Math.max(0, m.loanTermYears - (new Date().getFullYear() - m.startYear));
    const payment = calculateMortgagePayment(m.currentBalance, m.interestRate, remainingYears);
    return sum + payment + (m.propertyTax / 12) + (m.insurance / 12) + (m.pmi / 12) + m.hoaFees;
  }, 0);
  const totalRentalIncome = mortgages.reduce((sum, m) => sum + m.monthlyRentalIncome, 0);
  
  // Chart data for equity distribution
  const equityData = mortgages.map((m, i) => ({
    name: m.name,
    equity: m.currentHomeValue - m.currentBalance,
    debt: m.currentBalance,
    color: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'][i % 5],
  }));
  
  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];
  
  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <CardGrid columns={4}>
        <StatCard
          label="Total Property Value"
          value={formatCurrency(totalPropertyValue)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          }
        />
        <StatCard
          label="Total Equity"
          value={formatCurrency(totalEquity)}
          trend={totalEquity > 0 ? 'up' : 'neutral'}
          trendValue={`${((totalEquity / totalPropertyValue) * 100 || 0).toFixed(1)}% ownership`}
        />
        <StatCard
          label="Total Debt"
          value={formatCurrency(totalDebt)}
          subValue={`${mortgages.length} ${mortgages.length === 1 ? 'property' : 'properties'}`}
        />
        <StatCard
          label="Monthly Costs"
          value={formatCurrency(totalMonthlyPayments)}
          subValue={totalRentalIncome > 0 ? `Net: ${formatCurrency(totalMonthlyPayments - totalRentalIncome)}` : 'All properties'}
        />
      </CardGrid>
      
      {/* Portfolio Overview */}
      {mortgages.length > 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Equity by Property">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={equityData.filter(d => d.equity > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="equity"
                    nameKey="name"
                  >
                    {equityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {equityData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {item.name}: {formatCurrency(item.equity)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
          
          <Card title="Property Comparison">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={equityData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 100, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Area type="monotone" dataKey="equity" stackId="1" fill="#10B981" stroke="#10B981" name="Equity" />
                  <Area type="monotone" dataKey="debt" stackId="1" fill="#EF4444" stroke="#EF4444" name="Debt" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
      
      {/* Add Property Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Properties ({mortgages.length})
        </h2>
        <Button onClick={() => addMortgage()}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Property
        </Button>
      </div>
      
      {/* Mortgage Cards */}
      <div className="space-y-4">
        {mortgages.map((mortgage) => (
          <MortgageCard
            key={mortgage.id}
            mortgage={mortgage}
            onUpdate={(data) => updateMortgageEntry(mortgage.id, data)}
            onRemove={() => removeMortgage(mortgage.id)}
            canRemove={mortgages.length > 1}
            isExpanded={expandedId === mortgage.id}
            onToggle={() => setExpandedId(expandedId === mortgage.id ? null : mortgage.id)}
          />
        ))}
      </div>
      
      {/* Tips */}
      <Card>
        <div className="p-4 bg-blue-900/30 rounded-lg">
          <h4 className="font-semibold text-blue-300 mb-2">💡 Mortgage Tips</h4>
          <ul className="text-sm text-blue-400 space-y-1">
            <li>• <strong>LTV &gt; 80%:</strong> You may be paying PMI (Private Mortgage Insurance)</li>
            <li>• <strong>Extra payments:</strong> Even $100/month extra can save years of payments and thousands in interest</li>
            <li>• <strong>Equity:</strong> Your equity grows as you pay down the loan and as property values increase</li>
            <li>• <strong>Investment properties:</strong> Track rental income to see your true cash flow</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
