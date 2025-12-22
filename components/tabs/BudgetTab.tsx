'use client';

import { Card, CardGrid, StatCard } from '@/components/ui';
import { CurrencyInput } from '@/components/ui';
import { useApp } from '@/lib/store';
import { calculateBudgetSummary, formatCurrency } from '@/lib/calculations';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function BudgetTab() {
  const { state, updateBudgetData } = useApp();
  const data = state.budgetData;
  const summary = calculateBudgetSummary(data);
  
  // Expense chart data
  const expenseData = Object.entries(data.expenses)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      name: formatLabel(key),
      value,
    }));
  
  const EXPENSE_COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
  
  function formatLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
  
  const savingsRate = summary.totalIncome > 0 
    ? (summary.netIncome / summary.totalIncome) * 100 
    : 0;
  
  return (
    <div className="space-y-6">
      {/* Budget Summary */}
      <CardGrid columns={4}>
        <StatCard
          label="Monthly Income"
          value={formatCurrency(summary.totalIncome)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Monthly Expenses"
          value={formatCurrency(summary.totalExpenses)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
        />
        <StatCard
          label="Monthly Surplus"
          value={formatCurrency(summary.netIncome)}
          trend={summary.netIncome > 0 ? 'up' : 'down'}
          trendValue={summary.netIncome > 0 ? 'Saving' : 'Deficit'}
        />
        <StatCard
          label="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          trend={savingsRate >= 20 ? 'up' : savingsRate >= 10 ? 'neutral' : 'down'}
          trendValue={savingsRate >= 20 ? 'Excellent' : savingsRate >= 10 ? 'Good' : 'Improve'}
        />
      </CardGrid>
      
      {/* Annual Summary */}
      <Card title="Annual Summary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-700">Annual Income</p>
            <p className="text-2xl font-bold text-green-900">{formatCurrency(summary.totalIncome * 12)}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm font-medium text-red-700">Annual Expenses</p>
            <p className="text-2xl font-bold text-red-900">{formatCurrency(summary.totalExpenses * 12)}</p>
          </div>
          <div className={`p-4 rounded-lg ${summary.netIncome >= 0 ? 'bg-blue-50' : 'bg-amber-50'}`}>
            <p className={`text-sm font-medium ${summary.netIncome >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>
              Annual Savings
            </p>
            <p className={`text-2xl font-bold ${summary.netIncome >= 0 ? 'text-blue-900' : 'text-amber-900'}`}>
              {formatCurrency(summary.netIncome * 12)}
            </p>
          </div>
        </div>
      </Card>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Expense Breakdown">
          <div className="h-80">
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Enter expense values to see breakdown
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {expenseData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: EXPENSE_COLORS[index % EXPENSE_COLORS.length] }}
                />
                <span className="text-sm text-gray-600 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </Card>
        
        <Card title="Income vs Expenses">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Income', value: summary.totalIncome, fill: '#10B981' },
                  { name: 'Expenses', value: summary.totalExpenses, fill: '#EF4444' },
                  { name: 'Savings', value: Math.max(0, summary.netIncome), fill: '#3B82F6' },
                ]}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis 
                  tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`}
                  stroke="#6B7280"
                />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {[
                    { fill: '#10B981' },
                    { fill: '#EF4444' },
                    { fill: '#3B82F6' },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      {/* Income */}
      <Card title="Monthly Income" subtitle="Enter your sources of monthly income">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CurrencyInput
            label="Salary (After Tax)"
            value={data.income.salary}
            onChange={(v) => updateBudgetData({ 
              income: { ...data.income, salary: v }
            })}
          />
          <CurrencyInput
            label="Spouse Salary"
            value={data.income.spouseSalary}
            onChange={(v) => updateBudgetData({ 
              income: { ...data.income, spouseSalary: v }
            })}
          />
          <CurrencyInput
            label="Investment Income"
            value={data.income.investment}
            onChange={(v) => updateBudgetData({ 
              income: { ...data.income, investment: v }
            })}
          />
          <CurrencyInput
            label="Other Income"
            value={data.income.other}
            onChange={(v) => updateBudgetData({ 
              income: { ...data.income, other: v }
            })}
          />
        </div>
      </Card>
      
      {/* Expenses */}
      <Card title="Monthly Expenses" subtitle="Track your monthly spending">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CurrencyInput
            label="Housing (Mortgage/Rent)"
            value={data.expenses.housing}
            onChange={(v) => updateBudgetData({ 
              expenses: { ...data.expenses, housing: v }
            })}
          />
          <CurrencyInput
            label="Utilities"
            value={data.expenses.utilities}
            onChange={(v) => updateBudgetData({ 
              expenses: { ...data.expenses, utilities: v }
            })}
          />
          <CurrencyInput
            label="Food & Groceries"
            value={data.expenses.food}
            onChange={(v) => updateBudgetData({ 
              expenses: { ...data.expenses, food: v }
            })}
          />
          <CurrencyInput
            label="Transportation"
            value={data.expenses.transportation}
            onChange={(v) => updateBudgetData({ 
              expenses: { ...data.expenses, transportation: v }
            })}
          />
          <CurrencyInput
            label="Healthcare"
            value={data.expenses.healthcare}
            onChange={(v) => updateBudgetData({ 
              expenses: { ...data.expenses, healthcare: v }
            })}
          />
          <CurrencyInput
            label="Insurance"
            value={data.expenses.insurance}
            onChange={(v) => updateBudgetData({ 
              expenses: { ...data.expenses, insurance: v }
            })}
          />
          <CurrencyInput
            label="Entertainment"
            value={data.expenses.entertainment}
            onChange={(v) => updateBudgetData({ 
              expenses: { ...data.expenses, entertainment: v }
            })}
          />
          <CurrencyInput
            label="Other Expenses"
            value={data.expenses.other}
            onChange={(v) => updateBudgetData({ 
              expenses: { ...data.expenses, other: v }
            })}
          />
        </div>
      </Card>
    </div>
  );
}
