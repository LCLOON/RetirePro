'use client';

import { useState } from 'react';
import { Card, CardGrid, StatCard } from '@/components/ui';
import { CurrencyInput } from '@/components/ui';
import { useApp } from '@/lib/store';
import { calculateBudgetSummary, formatCurrency } from '@/lib/calculations';
import { DEFAULT_BUDGET } from '@/lib/types';
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

// Collapsible section component
function ExpenseSection({ 
  title, 
  subtitle,
  icon,
  total,
  color,
  children,
  defaultOpen = false
}: { 
  title: string; 
  subtitle: string;
  icon: React.ReactNode;
  total: number;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-slate-700/50 rounded-lg overflow-hidden bg-slate-800/50 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
            {icon}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            {formatCurrency(total)}
          </span>
          <svg 
            className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {isOpen && (
        <div className="p-4 pt-0 border-t border-slate-700/50 bg-slate-800/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export function BudgetTab() {
  const { state, updateBudgetData } = useApp();
  
  // Use DEFAULT_BUDGET as fallback if data is missing or corrupted
  const rawData = state.budgetData;
  const data = {
    income: rawData?.income || DEFAULT_BUDGET.income,
    fixedExpenses: rawData?.fixedExpenses || DEFAULT_BUDGET.fixedExpenses,
    debtPayments: rawData?.debtPayments || DEFAULT_BUDGET.debtPayments,
    subscriptions: rawData?.subscriptions || DEFAULT_BUDGET.subscriptions,
    variableExpenses: rawData?.variableExpenses || DEFAULT_BUDGET.variableExpenses,
    savings: rawData?.savings || DEFAULT_BUDGET.savings,
  };
  
  const summary = calculateBudgetSummary(data);
  
  // Expense chart data by category
  const categoryData = [
    { name: 'Fixed', value: summary.fixedExpensesTotal, color: '#EF4444' },
    { name: 'Debt', value: summary.debtPaymentsTotal, color: '#F59E0B' },
    { name: 'Subscriptions', value: summary.subscriptionsTotal, color: '#8B5CF6' },
    { name: 'Variable', value: summary.variableExpensesTotal, color: '#3B82F6' },
    { name: 'Savings', value: summary.savingsTotal, color: '#10B981' },
  ].filter(item => item.value > 0);
  
  const savingsRate = summary.totalIncome > 0 
    ? ((summary.savingsTotal + Math.max(0, summary.netIncome)) / summary.totalIncome) * 100 
    : 0;
  
  return (
    <div className="space-y-6">
      {/* Budget Summary Stats */}
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
          label="Total Expenses"
          value={formatCurrency(summary.totalExpenses)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
        />
        <StatCard
          label="Monthly Savings"
          value={formatCurrency(summary.savingsTotal)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          label="Net Remaining"
          value={formatCurrency(summary.netIncome)}
          trend={summary.netIncome > 0 ? 'up' : summary.netIncome < 0 ? 'down' : 'neutral'}
          trendValue={summary.netIncome > 0 ? 'Surplus' : summary.netIncome < 0 ? 'Deficit' : 'Balanced'}
        />
      </CardGrid>
      
      {/* Annual Summary & Savings Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Annual Summary">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-green-900/30 rounded-lg">
              <p className="text-sm font-medium text-green-400">Annual Income</p>
              <p className="text-xl font-bold text-green-300">{formatCurrency(summary.totalIncome * 12)}</p>
            </div>
            <div className="p-4 bg-red-900/30 rounded-lg">
              <p className="text-sm font-medium text-red-400">Annual Expenses</p>
              <p className="text-xl font-bold text-red-300">{formatCurrency(summary.totalExpenses * 12)}</p>
            </div>
            <div className={`p-4 rounded-lg ${summary.netIncome >= 0 ? 'bg-blue-900/30' : 'bg-amber-900/30'}`}>
              <p className={`text-sm font-medium ${summary.netIncome >= 0 ? 'text-blue-400' : 'text-amber-400'}`}>
                Annual Net
              </p>
              <p className={`text-xl font-bold ${summary.netIncome >= 0 ? 'text-blue-300' : 'text-amber-300'}`}>
                {formatCurrency(summary.netIncome * 12)}
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-emerald-900/30 rounded-lg">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-emerald-400">Savings Rate</p>
              <p className="text-2xl font-bold text-emerald-300">{savingsRate.toFixed(1)}%</p>
            </div>
            <div className="mt-2 h-2 bg-emerald-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(savingsRate, 100)}%` }}
              />
            </div>
            <p className="text-xs text-emerald-500 mt-1">
              {savingsRate >= 20 ? '🎉 Excellent! You\'re on track for financial independence' : 
               savingsRate >= 15 ? '👍 Great! Above average savings rate' :
               savingsRate >= 10 ? '📈 Good start, try to increase to 15-20%' :
               '💡 Aim for at least 10-20% savings rate'}
            </p>
          </div>
        </Card>
        
        <Card title="Expense Breakdown by Category">
          <div className="h-64">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Enter expenses to see breakdown
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {item.name}: {formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      {/* Income Section */}
      <Card title="💰 Monthly Income" subtitle="Enter all sources of monthly income">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <CurrencyInput
            label="Primary Salary (Net)"
            value={data.income.salary}
            onChange={(v) => updateBudgetData({ 
              income: { ...data.income, salary: v }
            })}
          />
          <CurrencyInput
            label="Spouse Salary (Net)"
            value={data.income.spouseSalary}
            onChange={(v) => updateBudgetData({ 
              income: { ...data.income, spouseSalary: v }
            })}
          />
          <CurrencyInput
            label="Bonus Income"
            value={data.income.bonusIncome}
            onChange={(v) => updateBudgetData({ 
              income: { ...data.income, bonusIncome: v }
            })}
          />
          <CurrencyInput
            label="Investment Income"
            value={data.income.investmentIncome}
            onChange={(v) => updateBudgetData({ 
              income: { ...data.income, investmentIncome: v }
            })}
          />
          <CurrencyInput
            label="Side Hustle"
            value={data.income.sideHustle}
            onChange={(v) => updateBudgetData({ 
              income: { ...data.income, sideHustle: v }
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
      
      {/* Expense Sections */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Expenses</h2>
        
        {/* Fixed Expenses */}
        <ExpenseSection
          title="🏠 Fixed Expenses"
          subtitle="Housing and essential bills"
          icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
          total={summary.fixedExpensesTotal}
          color="bg-red-500"
          defaultOpen={true}
        >
          <CurrencyInput
            label="Mortgage/Rent"
            value={data.fixedExpenses.mortgageRent}
            onChange={(v) => updateBudgetData({ 
              fixedExpenses: { ...data.fixedExpenses, mortgageRent: v }
            })}
          />
          <CurrencyInput
            label="Property Tax & HOA"
            value={data.fixedExpenses.propertyTaxHoa}
            onChange={(v) => updateBudgetData({ 
              fixedExpenses: { ...data.fixedExpenses, propertyTaxHoa: v }
            })}
          />
          <CurrencyInput
            label="Home Insurance"
            value={data.fixedExpenses.homeInsurance}
            onChange={(v) => updateBudgetData({ 
              fixedExpenses: { ...data.fixedExpenses, homeInsurance: v }
            })}
          />
          <CurrencyInput
            label="Utilities (Elec/Gas/Water)"
            value={data.fixedExpenses.utilities}
            onChange={(v) => updateBudgetData({ 
              fixedExpenses: { ...data.fixedExpenses, utilities: v }
            })}
          />
          <CurrencyInput
            label="Auto Payment"
            value={data.fixedExpenses.autoPayment}
            onChange={(v) => updateBudgetData({ 
              fixedExpenses: { ...data.fixedExpenses, autoPayment: v }
            })}
          />
        </ExpenseSection>
        
        {/* Debt Payments */}
        <ExpenseSection
          title="💳 Debt Payments"
          subtitle="Credit cards, loans, and financing"
          icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
          total={summary.debtPaymentsTotal}
          color="bg-amber-500"
        >
          <CurrencyInput
            label="Credit Card #1"
            value={data.debtPayments.creditCard1}
            onChange={(v) => updateBudgetData({ 
              debtPayments: { ...data.debtPayments, creditCard1: v }
            })}
          />
          <CurrencyInput
            label="Credit Card #2"
            value={data.debtPayments.creditCard2}
            onChange={(v) => updateBudgetData({ 
              debtPayments: { ...data.debtPayments, creditCard2: v }
            })}
          />
          <CurrencyInput
            label="Credit Card #3"
            value={data.debtPayments.creditCard3}
            onChange={(v) => updateBudgetData({ 
              debtPayments: { ...data.debtPayments, creditCard3: v }
            })}
          />
          <CurrencyInput
            label="Phone Equipment"
            value={data.debtPayments.phoneEquipment}
            onChange={(v) => updateBudgetData({ 
              debtPayments: { ...data.debtPayments, phoneEquipment: v }
            })}
          />
          <CurrencyInput
            label="Computer/Laptop"
            value={data.debtPayments.computerLaptop}
            onChange={(v) => updateBudgetData({ 
              debtPayments: { ...data.debtPayments, computerLaptop: v }
            })}
          />
          <CurrencyInput
            label="Furniture Financing"
            value={data.debtPayments.furnitureFinancing}
            onChange={(v) => updateBudgetData({ 
              debtPayments: { ...data.debtPayments, furnitureFinancing: v }
            })}
          />
          <CurrencyInput
            label="Appliance Financing"
            value={data.debtPayments.applianceFinancing}
            onChange={(v) => updateBudgetData({ 
              debtPayments: { ...data.debtPayments, applianceFinancing: v }
            })}
          />
          <CurrencyInput
            label="Other Equipment"
            value={data.debtPayments.otherEquipment}
            onChange={(v) => updateBudgetData({ 
              debtPayments: { ...data.debtPayments, otherEquipment: v }
            })}
          />
          <CurrencyInput
            label="Student Loans"
            value={data.debtPayments.studentLoans}
            onChange={(v) => updateBudgetData({ 
              debtPayments: { ...data.debtPayments, studentLoans: v }
            })}
          />
          <CurrencyInput
            label="Personal Loans"
            value={data.debtPayments.personalLoans}
            onChange={(v) => updateBudgetData({ 
              debtPayments: { ...data.debtPayments, personalLoans: v }
            })}
          />
          <CurrencyInput
            label="Medical Debt"
            value={data.debtPayments.medicalDebt}
            onChange={(v) => updateBudgetData({ 
              debtPayments: { ...data.debtPayments, medicalDebt: v }
            })}
          />
          <CurrencyInput
            label="Other Debt"
            value={data.debtPayments.otherDebt}
            onChange={(v) => updateBudgetData({ 
              debtPayments: { ...data.debtPayments, otherDebt: v }
            })}
          />
        </ExpenseSection>
        
        {/* Subscriptions */}
        <ExpenseSection
          title="📱 Subscriptions & Services"
          subtitle="Internet, streaming, apps, and memberships"
          icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
          total={summary.subscriptionsTotal}
          color="bg-purple-500"
        >
          <CurrencyInput
            label="Home Internet"
            value={data.subscriptions.internet}
            onChange={(v) => updateBudgetData({ 
              subscriptions: { ...data.subscriptions, internet: v }
            })}
          />
          <CurrencyInput
            label="Starlink"
            value={data.subscriptions.starlink}
            onChange={(v) => updateBudgetData({ 
              subscriptions: { ...data.subscriptions, starlink: v }
            })}
          />
          <CurrencyInput
            label="Cell Phone Plans"
            value={data.subscriptions.cellPhone}
            onChange={(v) => updateBudgetData({ 
              subscriptions: { ...data.subscriptions, cellPhone: v }
            })}
          />
          <CurrencyInput
            label="Cable/Satellite TV"
            value={data.subscriptions.cableTv}
            onChange={(v) => updateBudgetData({ 
              subscriptions: { ...data.subscriptions, cableTv: v }
            })}
          />
          <CurrencyInput
            label="Netflix"
            value={data.subscriptions.netflix}
            onChange={(v) => updateBudgetData({ 
              subscriptions: { ...data.subscriptions, netflix: v }
            })}
          />
          <CurrencyInput
            label="Other Streaming"
            value={data.subscriptions.otherStreaming}
            onChange={(v) => updateBudgetData({ 
              subscriptions: { ...data.subscriptions, otherStreaming: v }
            })}
          />
          <CurrencyInput
            label="Music Streaming"
            value={data.subscriptions.musicStreaming}
            onChange={(v) => updateBudgetData({ 
              subscriptions: { ...data.subscriptions, musicStreaming: v }
            })}
          />
          <CurrencyInput
            label="X/Twitter Premium"
            value={data.subscriptions.xTwitter}
            onChange={(v) => updateBudgetData({ 
              subscriptions: { ...data.subscriptions, xTwitter: v }
            })}
          />
          <CurrencyInput
            label="Social Media Subs"
            value={data.subscriptions.socialMedia}
            onChange={(v) => updateBudgetData({ 
              subscriptions: { ...data.subscriptions, socialMedia: v }
            })}
          />
          <CurrencyInput
            label="Software & Apps"
            value={data.subscriptions.softwareApps}
            onChange={(v) => updateBudgetData({ 
              subscriptions: { ...data.subscriptions, softwareApps: v }
            })}
          />
          <CurrencyInput
            label="Gym & Fitness"
            value={data.subscriptions.gymFitness}
            onChange={(v) => updateBudgetData({ 
              subscriptions: { ...data.subscriptions, gymFitness: v }
            })}
          />
          <CurrencyInput
            label="News & Magazines"
            value={data.subscriptions.newsMagazines}
            onChange={(v) => updateBudgetData({ 
              subscriptions: { ...data.subscriptions, newsMagazines: v }
            })}
          />
          <CurrencyInput
            label="Learning Platforms"
            value={data.subscriptions.learningPlatforms}
            onChange={(v) => updateBudgetData({ 
              subscriptions: { ...data.subscriptions, learningPlatforms: v }
            })}
          />
          <CurrencyInput
            label="Cloud Storage"
            value={data.subscriptions.cloudStorage}
            onChange={(v) => updateBudgetData({ 
              subscriptions: { ...data.subscriptions, cloudStorage: v }
            })}
          />
          <CurrencyInput
            label="Other Subscriptions"
            value={data.subscriptions.otherSubscriptions}
            onChange={(v) => updateBudgetData({ 
              subscriptions: { ...data.subscriptions, otherSubscriptions: v }
            })}
          />
        </ExpenseSection>
        
        {/* Variable Expenses */}
        <ExpenseSection
          title="🛒 Variable Expenses"
          subtitle="Daily living, food, transportation, and personal care"
          icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
          total={summary.variableExpensesTotal}
          color="bg-blue-500"
        >
          <CurrencyInput
            label="Groceries"
            value={data.variableExpenses.groceries}
            onChange={(v) => updateBudgetData({ 
              variableExpenses: { ...data.variableExpenses, groceries: v }
            })}
          />
          <CurrencyInput
            label="Dining Out"
            value={data.variableExpenses.diningOut}
            onChange={(v) => updateBudgetData({ 
              variableExpenses: { ...data.variableExpenses, diningOut: v }
            })}
          />
          <CurrencyInput
            label="Gas"
            value={data.variableExpenses.gas}
            onChange={(v) => updateBudgetData({ 
              variableExpenses: { ...data.variableExpenses, gas: v }
            })}
          />
          <CurrencyInput
            label="Car Maintenance"
            value={data.variableExpenses.carMaintenance}
            onChange={(v) => updateBudgetData({ 
              variableExpenses: { ...data.variableExpenses, carMaintenance: v }
            })}
          />
          <CurrencyInput
            label="Car Insurance"
            value={data.variableExpenses.carInsurance}
            onChange={(v) => updateBudgetData({ 
              variableExpenses: { ...data.variableExpenses, carInsurance: v }
            })}
          />
          <CurrencyInput
            label="Other Transportation"
            value={data.variableExpenses.otherTransportation}
            onChange={(v) => updateBudgetData({ 
              variableExpenses: { ...data.variableExpenses, otherTransportation: v }
            })}
          />
          <CurrencyInput
            label="Hair Care"
            value={data.variableExpenses.hairCare}
            onChange={(v) => updateBudgetData({ 
              variableExpenses: { ...data.variableExpenses, hairCare: v }
            })}
          />
          <CurrencyInput
            label="Nail Care"
            value={data.variableExpenses.nailCare}
            onChange={(v) => updateBudgetData({ 
              variableExpenses: { ...data.variableExpenses, nailCare: v }
            })}
          />
          <CurrencyInput
            label="Personal Care"
            value={data.variableExpenses.personalCare}
            onChange={(v) => updateBudgetData({ 
              variableExpenses: { ...data.variableExpenses, personalCare: v }
            })}
          />
          <CurrencyInput
            label="Pet Care"
            value={data.variableExpenses.petCare}
            onChange={(v) => updateBudgetData({ 
              variableExpenses: { ...data.variableExpenses, petCare: v }
            })}
          />
          <CurrencyInput
            label="Healthcare"
            value={data.variableExpenses.healthcare}
            onChange={(v) => updateBudgetData({ 
              variableExpenses: { ...data.variableExpenses, healthcare: v }
            })}
          />
          <CurrencyInput
            label="Entertainment"
            value={data.variableExpenses.entertainment}
            onChange={(v) => updateBudgetData({ 
              variableExpenses: { ...data.variableExpenses, entertainment: v }
            })}
          />
          <CurrencyInput
            label="Clothing"
            value={data.variableExpenses.clothing}
            onChange={(v) => updateBudgetData({ 
              variableExpenses: { ...data.variableExpenses, clothing: v }
            })}
          />
          <CurrencyInput
            label="Travel"
            value={data.variableExpenses.travel}
            onChange={(v) => updateBudgetData({ 
              variableExpenses: { ...data.variableExpenses, travel: v }
            })}
          />
          <CurrencyInput
            label="Miscellaneous"
            value={data.variableExpenses.miscellaneous}
            onChange={(v) => updateBudgetData({ 
              variableExpenses: { ...data.variableExpenses, miscellaneous: v }
            })}
          />
        </ExpenseSection>
        
        {/* Savings */}
        <ExpenseSection
          title="💎 Savings & Investments"
          subtitle="Retirement contributions and savings goals"
          icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          total={summary.savingsTotal}
          color="bg-emerald-500"
          defaultOpen={true}
        >
          <CurrencyInput
            label="401(k) Contribution"
            value={data.savings.contribution401k}
            onChange={(v) => updateBudgetData({ 
              savings: { ...data.savings, contribution401k: v }
            })}
          />
          <CurrencyInput
            label="IRA Contribution"
            value={data.savings.iraContribution}
            onChange={(v) => updateBudgetData({ 
              savings: { ...data.savings, iraContribution: v }
            })}
          />
          <CurrencyInput
            label="Emergency Fund"
            value={data.savings.emergencyFund}
            onChange={(v) => updateBudgetData({ 
              savings: { ...data.savings, emergencyFund: v }
            })}
          />
          <CurrencyInput
            label="Other Savings"
            value={data.savings.otherSavings}
            onChange={(v) => updateBudgetData({ 
              savings: { ...data.savings, otherSavings: v }
            })}
          />
        </ExpenseSection>
      </div>
      
      {/* Budget Analysis Chart */}
      <Card title="Income vs Expenses Comparison">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: 'Income', value: summary.totalIncome, fill: '#10B981' },
                { name: 'Fixed', value: summary.fixedExpensesTotal, fill: '#EF4444' },
                { name: 'Debt', value: summary.debtPaymentsTotal, fill: '#F59E0B' },
                { name: 'Subs', value: summary.subscriptionsTotal, fill: '#8B5CF6' },
                { name: 'Variable', value: summary.variableExpensesTotal, fill: '#3B82F6' },
                { name: 'Savings', value: summary.savingsTotal, fill: '#059669' },
              ]}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
              <YAxis 
                tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`}
                stroke="#6B7280"
              />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {[
                  { fill: '#10B981' },
                  { fill: '#EF4444' },
                  { fill: '#F59E0B' },
                  { fill: '#8B5CF6' },
                  { fill: '#3B82F6' },
                  { fill: '#059669' },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
