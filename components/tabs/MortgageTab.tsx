'use client';

import { useState } from 'react';
import { Card, CardGrid, StatCard } from '@/components/ui';
import { CurrencyInput, NumberInput, PercentInput } from '@/components/ui';
import { Button } from '@/components/ui';
import { useApp } from '@/lib/store';
import { calculateMortgagePayment, generateAmortizationSchedule, formatCurrency } from '@/lib/calculations';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export function MortgageTab() {
  const { state, updateMortgageData } = useApp();
  const data = state.mortgageData;
  
  const [showAmortization, setShowAmortization] = useState(false);
  
  // Calculate mortgage
  const monthlyPayment = calculateMortgagePayment(
    data.loanAmount,
    data.interestRate,
    data.loanTermYears
  );
  
  const totalPayments = monthlyPayment * data.loanTermYears * 12;
  const totalInterest = totalPayments - data.loanAmount;
  const amortization = generateAmortizationSchedule(
    data.loanAmount,
    data.interestRate,
    data.loanTermYears,
    data.extraPayment
  );
  
  // Calculate with extra payment impact
  const lastPayment = amortization.find(a => a.endingBalance <= 0) || amortization[amortization.length - 1];
  const monthsSaved = data.loanTermYears * 12 - (lastPayment?.month || data.loanTermYears * 12);
  const interestSaved = totalInterest - amortization.reduce((sum, a) => sum + a.interest, 0);
  
  // Chart data - yearly summary
  const yearlyData: { year: number; principal: number; interest: number; balance: number }[] = [];
  for (let year = 1; year <= Math.ceil(amortization.length / 12); year++) {
    const yearPayments = amortization.filter(a => Math.ceil(a.month / 12) === year);
    yearlyData.push({
      year,
      principal: yearPayments.reduce((sum, a) => sum + a.principal, 0),
      interest: yearPayments.reduce((sum, a) => sum + a.interest, 0),
      balance: yearPayments[yearPayments.length - 1]?.endingBalance || 0,
    });
  }
  
  const formatYAxis = (value: number) => {
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };
  
  return (
    <div className="space-y-6">
      {/* Mortgage Input */}
      <Card title="Mortgage Details" subtitle="Enter your mortgage information">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CurrencyInput
            label="Home Price"
            value={data.homePrice}
            onChange={(v) => updateMortgageData({ 
              homePrice: v,
              loanAmount: v - data.downPayment
            })}
          />
          <CurrencyInput
            label="Down Payment"
            value={data.downPayment}
            onChange={(v) => updateMortgageData({ 
              downPayment: v,
              loanAmount: data.homePrice - v
            })}
          />
          <CurrencyInput
            label="Loan Amount"
            value={data.loanAmount}
            onChange={(v) => updateMortgageData({ loanAmount: v })}
          />
          <PercentInput
            label="Interest Rate"
            value={data.interestRate}
            onChange={(v) => updateMortgageData({ interestRate: v })}
          />
          <NumberInput
            label="Loan Term"
            value={data.loanTermYears}
            onChange={(v) => updateMortgageData({ loanTermYears: v })}
            min={1}
            max={40}
            suffix="years"
          />
          <CurrencyInput
            label="Extra Monthly Payment"
            value={data.extraPayment}
            onChange={(v) => updateMortgageData({ extraPayment: v })}
            hint="Additional principal payment"
          />
          <CurrencyInput
            label="Property Tax (Annual)"
            value={data.propertyTax}
            onChange={(v) => updateMortgageData({ propertyTax: v })}
          />
          <CurrencyInput
            label="Insurance (Annual)"
            value={data.insurance}
            onChange={(v) => updateMortgageData({ insurance: v })}
          />
        </div>
      </Card>
      
      {/* Results */}
      <CardGrid columns={4}>
        <StatCard
          label="Monthly Payment"
          value={formatCurrency(monthlyPayment)}
          subValue="Principal & Interest"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Total Monthly Cost"
          value={formatCurrency(monthlyPayment + data.propertyTax / 12 + data.insurance / 12 + (data.pmi || 0))}
          subValue="Including taxes & insurance"
        />
        <StatCard
          label="Total Interest"
          value={formatCurrency(totalInterest)}
          subValue={`Over ${data.loanTermYears} years`}
        />
        <StatCard
          label="Loan-to-Value"
          value={`${((data.loanAmount / data.homePrice) * 100).toFixed(1)}%`}
          subValue={data.loanAmount / data.homePrice > 0.8 ? 'PMI may apply' : 'No PMI required'}
          trend={data.loanAmount / data.homePrice > 0.8 ? 'down' : 'up'}
        />
      </CardGrid>
      
      {/* Extra Payment Impact */}
      {data.extraPayment > 0 && (
        <Card title="Extra Payment Impact" subtitle="Benefits of making additional principal payments">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-700">Interest Saved</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(interestSaved)}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-700">Months Saved</p>
              <p className="text-2xl font-bold text-blue-900">{monthsSaved} months</p>
              <p className="text-sm text-blue-600">{(monthsSaved / 12).toFixed(1)} years earlier</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-purple-700">New Payoff Date</p>
              <p className="text-2xl font-bold text-purple-900">
                {new Date(Date.now() + (amortization.length) * 30 * 24 * 60 * 60 * 1000).getFullYear()}
              </p>
            </div>
          </div>
        </Card>
      )}
      
      {/* Payment Breakdown Chart */}
      <Card title="Payment Breakdown Over Time" subtitle="How your payments are split between principal and interest">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={yearlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="principalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="interestGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="year" 
                stroke="#6B7280"
                tick={{ fill: '#6B7280', fontSize: 12 }}
                label={{ value: 'Year', position: 'bottom', fill: '#6B7280' }}
              />
              <YAxis 
                tickFormatter={formatYAxis}
                stroke="#6B7280"
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value as number)}
                labelFormatter={(label) => `Year ${label}`}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="principal"
                name="Principal"
                stroke="#3B82F6"
                fill="url(#principalGradient)"
                stackId="1"
              />
              <Area
                type="monotone"
                dataKey="interest"
                name="Interest"
                stroke="#EF4444"
                fill="url(#interestGradient)"
                stackId="1"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      {/* Balance Over Time */}
      <Card title="Loan Balance" subtitle="Remaining balance over the life of the loan">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={yearlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="year" 
                stroke="#6B7280"
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={formatYAxis}
                stroke="#6B7280"
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value as number)}
                labelFormatter={(label) => `Year ${label}`}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                name="Remaining Balance"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      {/* Amortization Table */}
      <Card 
        title="Amortization Schedule" 
        action={
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowAmortization(!showAmortization)}
          >
            {showAmortization ? 'Hide' : 'Show'} Table
          </Button>
        }
      >
        {showAmortization && (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-3 font-semibold">Month</th>
                  <th className="text-right py-2 px-3 font-semibold">Payment</th>
                  <th className="text-right py-2 px-3 font-semibold">Principal</th>
                  <th className="text-right py-2 px-3 font-semibold">Interest</th>
                  <th className="text-right py-2 px-3 font-semibold">Balance</th>
                </tr>
              </thead>
              <tbody>
                {amortization.slice(0, 120).map((row) => (
                  <tr key={row.month} className="border-t border-gray-100">
                    <td className="py-2 px-3">{row.month}</td>
                    <td className="py-2 px-3 text-right">{formatCurrency(row.payment)}</td>
                    <td className="py-2 px-3 text-right text-blue-600">{formatCurrency(row.principal)}</td>
                    <td className="py-2 px-3 text-right text-red-600">{formatCurrency(row.interest)}</td>
                    <td className="py-2 px-3 text-right">{formatCurrency(Math.max(0, row.endingBalance))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {amortization.length > 120 && (
              <p className="text-center text-gray-500 py-4">
                Showing first 120 months of {amortization.length} total
              </p>
            )}
          </div>
        )}
        {!showAmortization && (
          <p className="text-gray-500 text-center py-8">
            Click &quot;Show Table&quot; to view the full amortization schedule
          </p>
        )}
      </Card>
    </div>
  );
}
