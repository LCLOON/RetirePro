'use client';

import { useState } from 'react';
import { Card, CardGrid, StatCard, CurrencyInput, TextInput, SelectInput } from '@/components/ui';
import { useApp } from '@/lib/store';
import { formatCurrency } from '@/lib/calculations';
import type { 
  PropertyEntry, 
  VehicleEntry, 
  BankAccountEntry, 
  BrokerageAccountEntry, 
  CryptoEntry, 
  RetirementAccountEntry, 
  PersonalAssetEntry, 
  DebtEntry 
} from '@/lib/types';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

// Collapsible Section Component
function AssetSection({ 
  title, 
  children, 
  defaultOpen = false,
  onAdd,
  addLabel = 'Add Item',
  total,
  count,
}: { 
  title: string; 
  children: React.ReactNode;
  defaultOpen?: boolean;
  onAdd?: () => void;
  addLabel?: string;
  total?: number;
  count?: number;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-slate-700/50 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-medium text-white">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full">
              {count} item{count !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {total !== undefined && (
            <span className={`font-semibold ${total >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(total)}
            </span>
          )}
          <svg 
            className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {isOpen && (
        <div className="p-4 space-y-4 bg-slate-800/30">
          {children}
          {onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {addLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Property Card Component
function PropertyCard({ 
  property, 
  onUpdate, 
  onRemove 
}: { 
  property: PropertyEntry; 
  onUpdate: (data: Partial<PropertyEntry>) => void;
  onRemove: () => void;
}) {
  const equity = property.currentValue - property.mortgageBalance;
  
  return (
    <div className="border border-slate-700/50 rounded-lg p-4 space-y-4 bg-slate-700/50">
      <div className="flex items-center justify-between">
        <TextInput
          label="Property Name"
          value={property.name}
          onChange={(v) => onUpdate({ name: v })}
          placeholder="e.g., Primary Residence"
        />
        <button
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 p-1"
          title="Remove Property"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SelectInput
          label="Property Type"
          value={property.type}
          onChange={(v) => onUpdate({ type: v as PropertyEntry['type'] })}
          options={[
            { value: 'primary_residence', label: 'Primary Residence' },
            { value: 'land', label: 'Land' },
            { value: 'investment', label: 'Investment Property' },
            { value: 'vacation', label: 'Vacation Home' },
            { value: 'commercial', label: 'Commercial' },
          ]}
        />
        <CurrencyInput
          label="Current Value"
          value={property.currentValue}
          onChange={(v) => onUpdate({ currentValue: v })}
        />
        <CurrencyInput
          label="Purchase Price"
          value={property.purchasePrice}
          onChange={(v) => onUpdate({ purchasePrice: v })}
        />
        <CurrencyInput
          label="Mortgage Balance"
          value={property.mortgageBalance}
          onChange={(v) => onUpdate({ mortgageBalance: v })}
        />
        <CurrencyInput
          label="Monthly Rental Income"
          value={property.rentalIncome}
          onChange={(v) => onUpdate({ rentalIncome: v })}
        />
        <div className="flex flex-col justify-end">
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Equity</span>
          <span className={`text-lg font-semibold ${equity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(equity)}
          </span>
        </div>
      </div>
      <TextInput
        label="Address"
        value={property.address}
        onChange={(v) => onUpdate({ address: v })}
        placeholder="123 Main St, City, State"
      />
    </div>
  );
}

// Vehicle Card Component
function VehicleCard({ 
  vehicle, 
  onUpdate, 
  onRemove 
}: { 
  vehicle: VehicleEntry; 
  onUpdate: (data: Partial<VehicleEntry>) => void;
  onRemove: () => void;
}) {
  const equity = vehicle.currentValue - vehicle.loanBalance;
  
  return (
    <div className="border border-slate-700/50 rounded-lg p-4 space-y-4 bg-slate-700/50">
      <div className="flex items-center justify-between">
        <TextInput
          label="Vehicle Name"
          value={vehicle.name}
          onChange={(v) => onUpdate({ name: v })}
          placeholder="e.g., 2023 Toyota Camry"
        />
        <button onClick={onRemove} className="text-red-500 hover:text-red-700 p-1" title="Remove Vehicle">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SelectInput
          label="Vehicle Type"
          value={vehicle.type}
          onChange={(v) => onUpdate({ type: v as VehicleEntry['type'] })}
          options={[
            { value: 'car', label: 'Car' },
            { value: 'truck', label: 'Truck' },
            { value: 'suv', label: 'SUV' },
            { value: 'motorcycle', label: 'Motorcycle' },
            { value: 'rv', label: 'RV' },
            { value: 'boat', label: 'Boat' },
            { value: 'other', label: 'Other' },
          ]}
        />
        <CurrencyInput
          label="Current Value"
          value={vehicle.currentValue}
          onChange={(v) => onUpdate({ currentValue: v })}
        />
        <CurrencyInput
          label="Loan Balance"
          value={vehicle.loanBalance}
          onChange={(v) => onUpdate({ loanBalance: v })}
        />
        <div className="flex flex-col justify-end">
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Equity</span>
          <span className={`text-lg font-semibold ${equity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(equity)}
          </span>
        </div>
      </div>
    </div>
  );
}

// Bank Account Card
function BankAccountCard({ 
  account, 
  onUpdate, 
  onRemove 
}: { 
  account: BankAccountEntry; 
  onUpdate: (data: Partial<BankAccountEntry>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border border-slate-700/50 rounded-lg p-4 bg-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <TextInput
          label="Account Name"
          value={account.name}
          onChange={(v) => onUpdate({ name: v })}
          placeholder="e.g., Chase Checking"
        />
        <button onClick={onRemove} className="text-red-500 hover:text-red-700 p-1" title="Remove">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectInput
          label="Account Type"
          value={account.type}
          onChange={(v) => onUpdate({ type: v as BankAccountEntry['type'] })}
          options={[
            { value: 'checking', label: 'Checking' },
            { value: 'savings', label: 'Savings' },
            { value: 'money_market', label: 'Money Market' },
            { value: 'cd', label: 'CD' },
          ]}
        />
        <TextInput
          label="Institution"
          value={account.institution}
          onChange={(v) => onUpdate({ institution: v })}
          placeholder="e.g., Chase Bank"
        />
        <CurrencyInput
          label="Balance"
          value={account.balance}
          onChange={(v) => onUpdate({ balance: v })}
        />
      </div>
    </div>
  );
}

// Brokerage Account Card
function BrokerageCard({ 
  account, 
  onUpdate, 
  onRemove 
}: { 
  account: BrokerageAccountEntry; 
  onUpdate: (data: Partial<BrokerageAccountEntry>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border border-slate-700/50 rounded-lg p-4 bg-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <TextInput
          label="Account Name"
          value={account.name}
          onChange={(v) => onUpdate({ name: v })}
          placeholder="e.g., Robinhood"
        />
        <button onClick={onRemove} className="text-red-500 hover:text-red-700 p-1" title="Remove">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextInput
          label="Institution"
          value={account.institution}
          onChange={(v) => onUpdate({ institution: v })}
          placeholder="e.g., Fidelity, Schwab"
        />
        <SelectInput
          label="Account Type"
          value={account.accountType}
          onChange={(v) => onUpdate({ accountType: v as BrokerageAccountEntry['accountType'] })}
          options={[
            { value: 'individual', label: 'Individual' },
            { value: 'joint', label: 'Joint' },
            { value: 'custodial', label: 'Custodial' },
          ]}
        />
        <CurrencyInput
          label="Balance"
          value={account.balance}
          onChange={(v) => onUpdate({ balance: v })}
        />
      </div>
    </div>
  );
}

// Crypto Card
function CryptoCard({ 
  crypto, 
  onUpdate, 
  onRemove 
}: { 
  crypto: CryptoEntry; 
  onUpdate: (data: Partial<CryptoEntry>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border border-slate-700/50 rounded-lg p-4 bg-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <TextInput
          label="Cryptocurrency"
          value={crypto.name}
          onChange={(v) => onUpdate({ name: v })}
          placeholder="e.g., Bitcoin"
        />
        <button onClick={onRemove} className="text-red-500 hover:text-red-700 p-1" title="Remove">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextInput
          label="Symbol"
          value={crypto.symbol}
          onChange={(v) => onUpdate({ symbol: v })}
          placeholder="e.g., BTC"
        />
        <CurrencyInput
          label="Current Value"
          value={crypto.currentValue}
          onChange={(v) => onUpdate({ currentValue: v })}
        />
      </div>
    </div>
  );
}

// Retirement Account Card
function RetirementCard({ 
  account, 
  onUpdate, 
  onRemove 
}: { 
  account: RetirementAccountEntry; 
  onUpdate: (data: Partial<RetirementAccountEntry>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border border-slate-700/50 rounded-lg p-4 bg-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <TextInput
          label="Account Name"
          value={account.name}
          onChange={(v) => onUpdate({ name: v })}
          placeholder="e.g., Work 401(k)"
        />
        <button onClick={onRemove} className="text-red-500 hover:text-red-700 p-1" title="Remove">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectInput
          label="Account Type"
          value={account.type}
          onChange={(v) => onUpdate({ type: v as RetirementAccountEntry['type'] })}
          options={[
            { value: '401k', label: '401(k)' },
            { value: 'roth_401k', label: 'Roth 401(k)' },
            { value: 'traditional_ira', label: 'Traditional IRA' },
            { value: 'roth_ira', label: 'Roth IRA' },
            { value: 'inherited_ira', label: 'Inherited IRA' },
            { value: 'sep_ira', label: 'SEP IRA' },
            { value: 'simple_ira', label: 'SIMPLE IRA' },
            { value: '403b', label: '403(b)' },
            { value: '457b', label: '457(b)' },
            { value: 'pension', label: 'Pension' },
          ]}
        />
        <TextInput
          label="Institution"
          value={account.institution}
          onChange={(v) => onUpdate({ institution: v })}
          placeholder="e.g., Vanguard"
        />
        <CurrencyInput
          label="Balance"
          value={account.balance}
          onChange={(v) => onUpdate({ balance: v })}
        />
      </div>
    </div>
  );
}

// Personal Asset Card
function PersonalAssetCard({ 
  asset, 
  onUpdate, 
  onRemove 
}: { 
  asset: PersonalAssetEntry; 
  onUpdate: (data: Partial<PersonalAssetEntry>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border border-slate-700/50 rounded-lg p-4 bg-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <TextInput
          label="Asset Name"
          value={asset.name}
          onChange={(v) => onUpdate({ name: v })}
          placeholder="e.g., Jewelry Collection"
        />
        <button onClick={onRemove} className="text-red-500 hover:text-red-700 p-1" title="Remove">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectInput
          label="Category"
          value={asset.category}
          onChange={(v) => onUpdate({ category: v as PersonalAssetEntry['category'] })}
          options={[
            { value: 'electronics', label: 'Electronics' },
            { value: 'jewelry', label: 'Jewelry' },
            { value: 'collectibles', label: 'Collectibles' },
            { value: 'art', label: 'Art' },
            { value: 'tools', label: 'Tools & Equipment' },
            { value: 'furniture', label: 'Furniture' },
            { value: 'equipment', label: 'Equipment' },
            { value: 'other', label: 'Other' },
          ]}
        />
        <CurrencyInput
          label="Current Value"
          value={asset.currentValue}
          onChange={(v) => onUpdate({ currentValue: v })}
        />
        <CurrencyInput
          label="Purchase Price"
          value={asset.purchasePrice}
          onChange={(v) => onUpdate({ purchasePrice: v })}
        />
      </div>
    </div>
  );
}

// Debt Card
function DebtCard({ 
  debt, 
  onUpdate, 
  onRemove 
}: { 
  debt: DebtEntry; 
  onUpdate: (data: Partial<DebtEntry>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border border-red-200 dark:border-red-900 rounded-lg p-4 bg-red-50 dark:bg-red-950">
      <div className="flex items-center justify-between mb-4">
        <TextInput
          label="Debt Name"
          value={debt.name}
          onChange={(v) => onUpdate({ name: v })}
          placeholder="e.g., Chase Credit Card"
        />
        <button onClick={onRemove} className="text-red-500 hover:text-red-700 p-1" title="Remove">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SelectInput
          label="Debt Type"
          value={debt.type}
          onChange={(v) => onUpdate({ type: v as DebtEntry['type'] })}
          options={[
            { value: 'mortgage', label: 'Mortgage' },
            { value: 'heloc', label: 'HELOC' },
            { value: 'auto_loan', label: 'Auto Loan' },
            { value: 'student_loan', label: 'Student Loan' },
            { value: 'credit_card', label: 'Credit Card' },
            { value: 'personal_loan', label: 'Personal Loan' },
            { value: 'medical_debt', label: 'Medical Debt' },
            { value: 'business_loan', label: 'Business Loan' },
            { value: 'other', label: 'Other' },
          ]}
        />
        <TextInput
          label="Creditor"
          value={debt.creditor}
          onChange={(v) => onUpdate({ creditor: v })}
          placeholder="e.g., Bank of America"
        />
        <CurrencyInput
          label="Balance"
          value={debt.balance}
          onChange={(v) => onUpdate({ balance: v })}
        />
        <CurrencyInput
          label="Minimum Payment"
          value={debt.minimumPayment}
          onChange={(v) => onUpdate({ minimumPayment: v })}
        />
      </div>
    </div>
  );
}

export function NetWorthTab() {
  const { 
    state, 
    addProperty, updateProperty, removeProperty,
    addVehicle, updateVehicle, removeVehicle,
    addBankAccount, updateBankAccount, removeBankAccount,
    addBrokerageAccount, updateBrokerageAccount, removeBrokerageAccount,
    addCrypto, updateCrypto, removeCrypto,
    addRetirementAccount, updateRetirementAccount, removeRetirementAccount,
    addPersonalAsset, updatePersonalAsset, removePersonalAsset,
    addDebt, updateDebt, removeDebt,
    syncMortgageToNetWorth,
  } = useApp();
  
  const data = state.netWorthData;
  
  // Calculate totals
  const propertyTotal = data.properties.reduce((sum, p) => sum + (p.currentValue - p.mortgageBalance), 0);
  const propertyValue = data.properties.reduce((sum, p) => sum + p.currentValue, 0);
  const vehicleTotal = data.vehicles.reduce((sum, v) => sum + (v.currentValue - v.loanBalance), 0);
  const vehicleValue = data.vehicles.reduce((sum, v) => sum + v.currentValue, 0);
  const bankTotal = data.bankAccounts.reduce((sum, a) => sum + a.balance, 0);
  const brokerageTotal = data.brokerageAccounts.reduce((sum, a) => sum + a.balance, 0);
  const cryptoTotal = data.cryptoHoldings.reduce((sum, c) => sum + c.currentValue, 0);
  const retirementTotal = data.retirementAccounts.reduce((sum, a) => sum + a.balance, 0);
  const personalTotal = data.personalAssets.reduce((sum, a) => sum + a.currentValue, 0);
  const debtTotal = data.debts.reduce((sum, d) => sum + d.balance, 0);
  
  // Include property mortgages and vehicle loans in total debt
  const propertyMortgages = data.properties.reduce((sum, p) => sum + p.mortgageBalance, 0);
  const vehicleLoans = data.vehicles.reduce((sum, v) => sum + v.loanBalance, 0);
  
  const totalAssets = propertyValue + vehicleValue + bankTotal + brokerageTotal + cryptoTotal + retirementTotal + personalTotal;
  const totalLiabilities = debtTotal + propertyMortgages + vehicleLoans;
  const netWorth = totalAssets - totalLiabilities;
  
  // Chart data
  const assetBreakdown = [
    { name: 'Real Estate', value: propertyValue, color: '#3B82F6' },
    { name: 'Vehicles', value: vehicleValue, color: '#10B981' },
    { name: 'Bank Accounts', value: bankTotal, color: '#8B5CF6' },
    { name: 'Brokerage', value: brokerageTotal, color: '#F59E0B' },
    { name: 'Crypto', value: cryptoTotal, color: '#EC4899' },
    { name: 'Retirement', value: retirementTotal, color: '#06B6D4' },
    { name: 'Personal', value: personalTotal, color: '#84CC16' },
  ].filter(item => item.value > 0);
  
  const liabilityBreakdown = [
    { name: 'Mortgages', value: propertyMortgages, color: '#EF4444' },
    { name: 'Vehicle Loans', value: vehicleLoans, color: '#F97316' },
    { name: 'Other Debts', value: debtTotal, color: '#DC2626' },
  ].filter(item => item.value > 0);
  
  const comparisonData = [
    { name: 'Assets', value: totalAssets, fill: '#10B981' },
    { name: 'Liabilities', value: totalLiabilities, fill: '#EF4444' },
    { name: 'Net Worth', value: Math.max(0, netWorth), fill: '#3B82F6' },
  ];
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <CardGrid columns={3}>
        <StatCard
          label="Total Assets"
          value={formatCurrency(totalAssets)}
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
          value={formatCurrency(totalLiabilities)}
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
          value={formatCurrency(netWorth)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          }
          trend={netWorth > 0 ? 'up' : 'down'}
          trendValue={netWorth > 0 ? 'Positive' : 'Negative'}
        />
      </CardGrid>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Asset Breakdown">
          <div className="h-80">
            {assetBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {assetBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Add assets to see breakdown
              </div>
            )}
          </div>
        </Card>
        
        <Card title="Assets vs Liabilities">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="value" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      {/* Asset Sections */}
      <Card title="Assets" subtitle="Track all your assets in one place">
        <div className="space-y-4">
          {/* Real Estate */}
          <AssetSection 
            title="🏠 Real Estate & Land" 
            defaultOpen={data.properties.length > 0}
            onAdd={() => addProperty()}
            addLabel="Add Property"
            total={propertyTotal}
            count={data.properties.length}
          >
            {/* Sync from Mortgage Tab button */}
            {state.mortgageData.mortgages.length > 0 && (
              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-400">
                      📋 {state.mortgageData.mortgages.length} propert{state.mortgageData.mortgages.length === 1 ? 'y' : 'ies'} found in Mortgage tab
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click to sync property values and mortgage balances automatically
                    </p>
                  </div>
                  <button
                    onClick={syncMortgageToNetWorth}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Sync from Mortgage
                  </button>
                </div>
              </div>
            )}
            {data.properties.length === 0 ? (
              <p className="text-gray-500 text-sm">No properties added. Click below to add your first property.</p>
            ) : (
              <div className="space-y-4">
                {data.properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onUpdate={(d) => updateProperty(property.id, d)}
                    onRemove={() => removeProperty(property.id)}
                  />
                ))}
              </div>
            )}
          </AssetSection>
          
          {/* Vehicles */}
          <AssetSection 
            title="🚗 Vehicles" 
            defaultOpen={data.vehicles.length > 0}
            onAdd={() => addVehicle()}
            addLabel="Add Vehicle"
            total={vehicleTotal}
            count={data.vehicles.length}
          >
            {data.vehicles.length === 0 ? (
              <p className="text-gray-500 text-sm">No vehicles added. Click below to add a vehicle.</p>
            ) : (
              <div className="space-y-4">
                {data.vehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onUpdate={(d) => updateVehicle(vehicle.id, d)}
                    onRemove={() => removeVehicle(vehicle.id)}
                  />
                ))}
              </div>
            )}
          </AssetSection>
          
          {/* Bank Accounts */}
          <AssetSection 
            title="🏦 Bank Accounts" 
            defaultOpen={data.bankAccounts.length > 0}
            onAdd={() => addBankAccount()}
            addLabel="Add Bank Account"
            total={bankTotal}
            count={data.bankAccounts.length}
          >
            {data.bankAccounts.length === 0 ? (
              <p className="text-gray-500 text-sm">No bank accounts added. Click below to add an account.</p>
            ) : (
              <div className="space-y-4">
                {data.bankAccounts.map((account) => (
                  <BankAccountCard
                    key={account.id}
                    account={account}
                    onUpdate={(d) => updateBankAccount(account.id, d)}
                    onRemove={() => removeBankAccount(account.id)}
                  />
                ))}
              </div>
            )}
          </AssetSection>
          
          {/* Brokerage Accounts */}
          <AssetSection 
            title="📈 Brokerage & Investment Accounts" 
            defaultOpen={data.brokerageAccounts.length > 0}
            onAdd={() => addBrokerageAccount()}
            addLabel="Add Brokerage Account"
            total={brokerageTotal}
            count={data.brokerageAccounts.length}
          >
            {data.brokerageAccounts.length === 0 ? (
              <p className="text-gray-500 text-sm">No brokerage accounts added. Click below to add an account.</p>
            ) : (
              <div className="space-y-4">
                {data.brokerageAccounts.map((account) => (
                  <BrokerageCard
                    key={account.id}
                    account={account}
                    onUpdate={(d) => updateBrokerageAccount(account.id, d)}
                    onRemove={() => removeBrokerageAccount(account.id)}
                  />
                ))}
              </div>
            )}
          </AssetSection>
          
          {/* Crypto */}
          <AssetSection 
            title="₿ Cryptocurrency" 
            defaultOpen={data.cryptoHoldings.length > 0}
            onAdd={() => addCrypto()}
            addLabel="Add Cryptocurrency"
            total={cryptoTotal}
            count={data.cryptoHoldings.length}
          >
            {data.cryptoHoldings.length === 0 ? (
              <p className="text-gray-500 text-sm">No crypto holdings added. Click below to add crypto.</p>
            ) : (
              <div className="space-y-4">
                {data.cryptoHoldings.map((crypto) => (
                  <CryptoCard
                    key={crypto.id}
                    crypto={crypto}
                    onUpdate={(d) => updateCrypto(crypto.id, d)}
                    onRemove={() => removeCrypto(crypto.id)}
                  />
                ))}
              </div>
            )}
          </AssetSection>
          
          {/* Retirement Accounts */}
          <AssetSection 
            title="🎯 Retirement Accounts" 
            defaultOpen={data.retirementAccounts.length > 0}
            onAdd={() => addRetirementAccount()}
            addLabel="Add Retirement Account"
            total={retirementTotal}
            count={data.retirementAccounts.length}
          >
            {data.retirementAccounts.length === 0 ? (
              <p className="text-gray-500 text-sm">No retirement accounts added. Click below to add an account.</p>
            ) : (
              <div className="space-y-4">
                {data.retirementAccounts.map((account) => (
                  <RetirementCard
                    key={account.id}
                    account={account}
                    onUpdate={(d) => updateRetirementAccount(account.id, d)}
                    onRemove={() => removeRetirementAccount(account.id)}
                  />
                ))}
              </div>
            )}
          </AssetSection>
          
          {/* Personal Assets */}
          <AssetSection 
            title="💎 Personal Property & Other Assets" 
            defaultOpen={data.personalAssets.length > 0}
            onAdd={() => addPersonalAsset()}
            addLabel="Add Personal Asset"
            total={personalTotal}
            count={data.personalAssets.length}
          >
            {data.personalAssets.length === 0 ? (
              <p className="text-gray-500 text-sm">No personal assets added. Add electronics, jewelry, collectibles, etc.</p>
            ) : (
              <div className="space-y-4">
                {data.personalAssets.map((asset) => (
                  <PersonalAssetCard
                    key={asset.id}
                    asset={asset}
                    onUpdate={(d) => updatePersonalAsset(asset.id, d)}
                    onRemove={() => removePersonalAsset(asset.id)}
                  />
                ))}
              </div>
            )}
          </AssetSection>
        </div>
      </Card>
      
      {/* Liabilities Section */}
      <Card title="Liabilities" subtitle="Track all your debts and obligations">
        <div className="space-y-4">
          <AssetSection 
            title="💳 Debts & Loans" 
            defaultOpen={data.debts.length > 0}
            onAdd={() => addDebt()}
            addLabel="Add Debt"
            total={-totalLiabilities}
            count={data.debts.length + data.properties.filter(p => p.mortgageBalance > 0).length + data.vehicles.filter(v => v.loanBalance > 0).length}
          >
            {/* Show linked mortgages from properties */}
            {data.properties.filter(p => p.mortgageBalance > 0).length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Property Mortgages (linked from Real Estate)</h4>
                <div className="space-y-2">
                  {data.properties.filter(p => p.mortgageBalance > 0).map((p) => (
                    <div key={p.id} className="flex justify-between items-center text-sm bg-slate-600/50 p-2 rounded">
                      <span>{p.name || 'Unnamed Property'} - Mortgage</span>
                      <span className="text-red-600 font-medium">{formatCurrency(p.mortgageBalance)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Show linked vehicle loans */}
            {data.vehicles.filter(v => v.loanBalance > 0).length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vehicle Loans (linked from Vehicles)</h4>
                <div className="space-y-2">
                  {data.vehicles.filter(v => v.loanBalance > 0).map((v) => (
                    <div key={v.id} className="flex justify-between items-center text-sm bg-slate-600/50 p-2 rounded">
                      <span>{v.name || 'Unnamed Vehicle'} - Loan</span>
                      <span className="text-red-600 font-medium">{formatCurrency(v.loanBalance)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Other debts */}
            {data.debts.length === 0 ? (
              <p className="text-gray-500 text-sm">No additional debts added. Add credit cards, student loans, personal loans, etc.</p>
            ) : (
              <div className="space-y-4">
                {data.debts.map((debt) => (
                  <DebtCard
                    key={debt.id}
                    debt={debt}
                    onUpdate={(d) => updateDebt(debt.id, d)}
                    onRemove={() => removeDebt(debt.id)}
                  />
                ))}
              </div>
            )}
          </AssetSection>
        </div>
      </Card>
      
      {/* Liability Breakdown Chart */}
      {liabilityBreakdown.length > 0 && (
        <Card title="Liability Breakdown">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={liabilityBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {liabilityBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
