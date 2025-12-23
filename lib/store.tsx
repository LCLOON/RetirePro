'use client';

import { createContext, useContext, useReducer, ReactNode, useCallback, useEffect } from 'react';
import type { 
  RetirementData, 
  NetWorthData, 
  BudgetData, 
  TaxSettings,
  MortgageData,
  MortgageEntry,
  SocialSecurityData,
  ScenarioResults,
  MonteCarloResults,
  TabId,
  PropertyEntry,
  VehicleEntry,
  BankAccountEntry,
  BrokerageAccountEntry,
  CryptoEntry,
  RetirementAccountEntry,
  PersonalAssetEntry,
  DebtEntry,
} from './types';
import {
  DEFAULT_RETIREMENT_DATA,
  DEFAULT_NET_WORTH,
  DEFAULT_BUDGET,
  DEFAULT_TAX_SETTINGS,
  DEFAULT_MORTGAGE,
  DEFAULT_SOCIAL_SECURITY,
  createDefaultMortgage,
  createDefaultProperty,
  createDefaultVehicle,
  createDefaultBankAccount,
  createDefaultBrokerageAccount,
  createDefaultCrypto,
  createDefaultRetirementAccount,
  createDefaultPersonalAsset,
  createDefaultDebt,
} from './types';
import { calculateScenarioResults, performMonteCarloProjection } from './calculations';

// Migration helper to handle old data formats
function migrateData(data: Record<string, unknown>): Record<string, unknown> {
  const migrated = { ...data };
  
  // Migrate old NetWorthData format (flat assets/liabilities) to new array-based format
  if (data.netWorthData && typeof data.netWorthData === 'object') {
    const nw = data.netWorthData as Record<string, unknown>;
    // Check if it's old format (has 'assets' object with flat values instead of arrays)
    if (nw.assets && typeof nw.assets === 'object' && !Array.isArray(nw.properties)) {
      // Old format detected, use defaults instead
      migrated.netWorthData = DEFAULT_NET_WORTH;
    }
  }
  
  // Migrate old BudgetData format if needed
  if (data.budgetData) {
    const budget = data.budgetData as Record<string, unknown>;
    // Check if it has all required nested objects with correct structure
    const hasIncome = budget.income && typeof budget.income === 'object' && 'salary' in (budget.income as object);
    const hasFixed = budget.fixedExpenses && typeof budget.fixedExpenses === 'object';
    const hasDebt = budget.debtPayments && typeof budget.debtPayments === 'object';
    const hasSubs = budget.subscriptions && typeof budget.subscriptions === 'object';
    const hasVariable = budget.variableExpenses && typeof budget.variableExpenses === 'object';
    const hasSavings = budget.savings && typeof budget.savings === 'object';
    
    if (!hasIncome || !hasFixed || !hasDebt || !hasSubs || !hasVariable || !hasSavings) {
      // Old or incomplete format, use defaults
      migrated.budgetData = DEFAULT_BUDGET;
    }
  } else {
    // No budget data at all
    migrated.budgetData = DEFAULT_BUDGET;
  }
  
  return migrated;
}

// Theme type
export type Theme = 'light' | 'dark' | 'medium';

// App State
interface AppState {
  // Current tab
  activeTab: TabId;
  
  // Theme
  theme: Theme;
  
  // Data
  retirementData: RetirementData;
  netWorthData: NetWorthData;
  budgetData: BudgetData;
  taxSettings: TaxSettings;
  mortgageData: MortgageData;
  socialSecurityData: SocialSecurityData;
  
  // Calculation results
  scenarioResults: ScenarioResults | null;
  monteCarloResults: MonteCarloResults | null;
  
  // UI state
  isCalculating: boolean;
  hasUnsavedChanges: boolean;
  lastCalculated: Date | null;
}

// Action types
type Action =
  | { type: 'SET_ACTIVE_TAB'; payload: TabId }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'UPDATE_RETIREMENT_DATA'; payload: Partial<RetirementData> }
  | { type: 'UPDATE_NET_WORTH_DATA'; payload: Partial<NetWorthData> }
  | { type: 'UPDATE_BUDGET_DATA'; payload: Partial<BudgetData> }
  | { type: 'UPDATE_TAX_SETTINGS'; payload: Partial<TaxSettings> }
  | { type: 'UPDATE_MORTGAGE_DATA'; payload: Partial<MortgageData> }
  | { type: 'UPDATE_SOCIAL_SECURITY_DATA'; payload: Partial<SocialSecurityData> }
  | { type: 'SET_SCENARIO_RESULTS'; payload: ScenarioResults }
  | { type: 'SET_MONTE_CARLO_RESULTS'; payload: MonteCarloResults }
  | { type: 'SET_IS_CALCULATING'; payload: boolean }
  | { type: 'MARK_SAVED' }
  | { type: 'RESET_ALL' }
  | { type: 'LOAD_DATA'; payload: Partial<AppState> };

// Initial state
const initialState: AppState = {
  activeTab: 'start',
  theme: 'dark',
  retirementData: DEFAULT_RETIREMENT_DATA,
  netWorthData: DEFAULT_NET_WORTH,
  budgetData: DEFAULT_BUDGET,
  taxSettings: DEFAULT_TAX_SETTINGS,
  mortgageData: DEFAULT_MORTGAGE,
  socialSecurityData: DEFAULT_SOCIAL_SECURITY,
  scenarioResults: null,
  monteCarloResults: null,
  isCalculating: false,
  hasUnsavedChanges: false,
  lastCalculated: null,
};

// Reducer
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    
    case 'SET_THEME':
      return { ...state, theme: action.payload };
      
    case 'UPDATE_RETIREMENT_DATA':
      return {
        ...state,
        retirementData: { ...state.retirementData, ...action.payload },
        hasUnsavedChanges: true,
      };
      
    case 'UPDATE_NET_WORTH_DATA':
      return {
        ...state,
        netWorthData: { ...state.netWorthData, ...action.payload },
        hasUnsavedChanges: true,
      };
      
    case 'UPDATE_BUDGET_DATA':
      return {
        ...state,
        budgetData: { ...state.budgetData, ...action.payload },
        hasUnsavedChanges: true,
      };
      
    case 'UPDATE_TAX_SETTINGS':
      return {
        ...state,
        taxSettings: { ...state.taxSettings, ...action.payload },
        hasUnsavedChanges: true,
      };
      
    case 'UPDATE_MORTGAGE_DATA':
      return {
        ...state,
        mortgageData: { ...state.mortgageData, ...action.payload },
        hasUnsavedChanges: true,
      };
      
    case 'UPDATE_SOCIAL_SECURITY_DATA':
      return {
        ...state,
        socialSecurityData: { ...state.socialSecurityData, ...action.payload },
        hasUnsavedChanges: true,
      };
      
    case 'SET_SCENARIO_RESULTS':
      return {
        ...state,
        scenarioResults: action.payload,
        lastCalculated: new Date(),
      };
      
    case 'SET_MONTE_CARLO_RESULTS':
      return {
        ...state,
        monteCarloResults: action.payload,
        lastCalculated: new Date(),
      };
      
    case 'SET_IS_CALCULATING':
      return { ...state, isCalculating: action.payload };
      
    case 'MARK_SAVED':
      return { ...state, hasUnsavedChanges: false };
      
    case 'RESET_ALL':
      return { ...initialState };
      
    case 'LOAD_DATA':
      const migratedPayload = migrateData(action.payload as Record<string, unknown>);
      return { ...state, ...migratedPayload, hasUnsavedChanges: false };
      
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  
  // Helper functions
  setActiveTab: (tab: TabId) => void;
  setTheme: (theme: Theme) => void;
  updateRetirementData: (data: Partial<RetirementData>) => void;
  updateNetWorthData: (data: Partial<NetWorthData>) => void;
  updateBudgetData: (data: Partial<BudgetData>) => void;
  updateTaxSettings: (data: Partial<TaxSettings>) => void;
  updateMortgageData: (data: Partial<MortgageData>) => void;
  updateSocialSecurityData: (data: Partial<SocialSecurityData>) => void;
  // Mortgage helpers
  addMortgage: (name?: string) => void;
  updateMortgageEntry: (id: string, data: Partial<MortgageEntry>) => void;
  removeMortgage: (id: string) => void;
  // Net Worth helpers
  addProperty: (name?: string) => void;
  updateProperty: (id: string, data: Partial<PropertyEntry>) => void;
  removeProperty: (id: string) => void;
  addVehicle: (name?: string) => void;
  updateVehicle: (id: string, data: Partial<VehicleEntry>) => void;
  removeVehicle: (id: string) => void;
  addBankAccount: (name?: string) => void;
  updateBankAccount: (id: string, data: Partial<BankAccountEntry>) => void;
  removeBankAccount: (id: string) => void;
  addBrokerageAccount: (name?: string) => void;
  updateBrokerageAccount: (id: string, data: Partial<BrokerageAccountEntry>) => void;
  removeBrokerageAccount: (id: string) => void;
  addCrypto: (name?: string) => void;
  updateCrypto: (id: string, data: Partial<CryptoEntry>) => void;
  removeCrypto: (id: string) => void;
  addRetirementAccount: (name?: string) => void;
  updateRetirementAccount: (id: string, data: Partial<RetirementAccountEntry>) => void;
  removeRetirementAccount: (id: string) => void;
  addPersonalAsset: (name?: string) => void;
  updatePersonalAsset: (id: string, data: Partial<PersonalAssetEntry>) => void;
  removePersonalAsset: (id: string) => void;
  addDebt: (name?: string) => void;
  updateDebt: (id: string, data: Partial<DebtEntry>) => void;
  removeDebt: (id: string) => void;
  runCalculations: () => Promise<void>;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  exportToJSON: () => void | Promise<void>;
  resetAll: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

// Lazy initializer for state with theme from localStorage
function getInitialState(): AppState {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('retirepro-theme-v3') as Theme | null;
    if (savedTheme && ['light', 'dark', 'medium'].includes(savedTheme)) {
      return { ...initialState, theme: savedTheme };
    }
  }
  // Default to dark if no saved theme
  return { ...initialState, theme: 'dark' };
}

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState, getInitialState);
  
  // Apply theme to document IMMEDIATELY on mount and when theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', state.theme === 'dark');
    root.classList.toggle('medium', state.theme === 'medium');
  }, [state.theme]);
  
  // AUTO-LOAD data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('retirepro-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with defaults to handle any new fields added in updates
        dispatch({ type: 'LOAD_DATA', payload: {
          retirementData: { ...DEFAULT_RETIREMENT_DATA, ...parsed.retirementData },
          netWorthData: { ...DEFAULT_NET_WORTH, ...parsed.netWorthData },
          budgetData: { ...DEFAULT_BUDGET, ...parsed.budgetData },
          taxSettings: { ...DEFAULT_TAX_SETTINGS, ...parsed.taxSettings },
          mortgageData: { ...DEFAULT_MORTGAGE, ...parsed.mortgageData },
          socialSecurityData: { ...DEFAULT_SOCIAL_SECURITY, ...parsed.socialSecurityData },
        }});
        console.log('RetirePro: Data loaded from browser storage');
      } catch (e) {
        console.error('Failed to load saved data:', e);
      }
    }
  }, []);
  
  // AUTO-SAVE data to localStorage when it changes
  useEffect(() => {
    // Skip initial render
    if (state.hasUnsavedChanges) {
      const dataToSave = {
        retirementData: state.retirementData,
        netWorthData: state.netWorthData,
        budgetData: state.budgetData,
        taxSettings: state.taxSettings,
        mortgageData: state.mortgageData,
        socialSecurityData: state.socialSecurityData,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem('retirepro-data', JSON.stringify(dataToSave));
      console.log('RetirePro: Data auto-saved');
    }
  }, [state.retirementData, state.netWorthData, state.budgetData, state.taxSettings, state.mortgageData, state.socialSecurityData, state.hasUnsavedChanges]);
  
  const setActiveTab = useCallback((tab: TabId) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  }, []);
  
  const setTheme = useCallback((theme: Theme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
    localStorage.setItem('retirepro-theme-v3', theme);
  }, []);
  
  const updateRetirementData = useCallback((data: Partial<RetirementData>) => {
    dispatch({ type: 'UPDATE_RETIREMENT_DATA', payload: data });
  }, []);
  
  const updateNetWorthData = useCallback((data: Partial<NetWorthData>) => {
    dispatch({ type: 'UPDATE_NET_WORTH_DATA', payload: data });
  }, []);
  
  const updateBudgetData = useCallback((data: Partial<BudgetData>) => {
    dispatch({ type: 'UPDATE_BUDGET_DATA', payload: data });
  }, []);
  
  const updateTaxSettings = useCallback((data: Partial<TaxSettings>) => {
    dispatch({ type: 'UPDATE_TAX_SETTINGS', payload: data });
  }, []);
  
  const updateMortgageData = useCallback((data: Partial<MortgageData>) => {
    dispatch({ type: 'UPDATE_MORTGAGE_DATA', payload: data });
  }, []);
  
  // Mortgage-specific helpers
  const addMortgage = useCallback((name?: string) => {
    const newId = `mortgage-${Date.now()}`;
    const newMortgage = createDefaultMortgage(newId, name || `Property ${state.mortgageData.mortgages.length + 1}`);
    dispatch({ 
      type: 'UPDATE_MORTGAGE_DATA', 
      payload: { 
        mortgages: [...state.mortgageData.mortgages, newMortgage] 
      } 
    });
  }, [state.mortgageData.mortgages]);
  
  const updateMortgageEntry = useCallback((id: string, data: Partial<MortgageEntry>) => {
    const updatedMortgages = state.mortgageData.mortgages.map(m => 
      m.id === id ? { ...m, ...data } : m
    );
    dispatch({ 
      type: 'UPDATE_MORTGAGE_DATA', 
      payload: { mortgages: updatedMortgages } 
    });
  }, [state.mortgageData.mortgages]);
  
  const removeMortgage = useCallback((id: string) => {
    // Prevent removing last mortgage
    if (state.mortgageData.mortgages.length <= 1) return;
    const filteredMortgages = state.mortgageData.mortgages.filter(m => m.id !== id);
    dispatch({ 
      type: 'UPDATE_MORTGAGE_DATA', 
      payload: { mortgages: filteredMortgages } 
    });
  }, [state.mortgageData.mortgages]);
  
  // Net Worth helpers - Properties
  const addProperty = useCallback((name?: string) => {
    const newProperty = createDefaultProperty();
    newProperty.name = name || `Property ${state.netWorthData.properties.length + 1}`;
    dispatch({ 
      type: 'UPDATE_NET_WORTH_DATA', 
      payload: { properties: [...state.netWorthData.properties, newProperty] } 
    });
  }, [state.netWorthData.properties]);
  
  const updateProperty = useCallback((id: string, data: Partial<PropertyEntry>) => {
    const updated = state.netWorthData.properties.map(p => 
      p.id === id ? { ...p, ...data } : p
    );
    dispatch({ type: 'UPDATE_NET_WORTH_DATA', payload: { properties: updated } });
  }, [state.netWorthData.properties]);
  
  const removeProperty = useCallback((id: string) => {
    const filtered = state.netWorthData.properties.filter(p => p.id !== id);
    dispatch({ type: 'UPDATE_NET_WORTH_DATA', payload: { properties: filtered } });
  }, [state.netWorthData.properties]);
  
  // Net Worth helpers - Vehicles
  const addVehicle = useCallback((name?: string) => {
    const newVehicle = createDefaultVehicle();
    newVehicle.name = name || `Vehicle ${state.netWorthData.vehicles.length + 1}`;
    dispatch({ 
      type: 'UPDATE_NET_WORTH_DATA', 
      payload: { vehicles: [...state.netWorthData.vehicles, newVehicle] } 
    });
  }, [state.netWorthData.vehicles]);
  
  const updateVehicle = useCallback((id: string, data: Partial<VehicleEntry>) => {
    const updated = state.netWorthData.vehicles.map(v => 
      v.id === id ? { ...v, ...data } : v
    );
    dispatch({ type: 'UPDATE_NET_WORTH_DATA', payload: { vehicles: updated } });
  }, [state.netWorthData.vehicles]);
  
  const removeVehicle = useCallback((id: string) => {
    const filtered = state.netWorthData.vehicles.filter(v => v.id !== id);
    dispatch({ type: 'UPDATE_NET_WORTH_DATA', payload: { vehicles: filtered } });
  }, [state.netWorthData.vehicles]);
  
  // Net Worth helpers - Bank Accounts
  const addBankAccount = useCallback((name?: string) => {
    const newAccount = createDefaultBankAccount();
    newAccount.name = name || `Account ${state.netWorthData.bankAccounts.length + 1}`;
    dispatch({ 
      type: 'UPDATE_NET_WORTH_DATA', 
      payload: { bankAccounts: [...state.netWorthData.bankAccounts, newAccount] } 
    });
  }, [state.netWorthData.bankAccounts]);
  
  const updateBankAccount = useCallback((id: string, data: Partial<BankAccountEntry>) => {
    const updated = state.netWorthData.bankAccounts.map(a => 
      a.id === id ? { ...a, ...data } : a
    );
    dispatch({ type: 'UPDATE_NET_WORTH_DATA', payload: { bankAccounts: updated } });
  }, [state.netWorthData.bankAccounts]);
  
  const removeBankAccount = useCallback((id: string) => {
    const filtered = state.netWorthData.bankAccounts.filter(a => a.id !== id);
    dispatch({ type: 'UPDATE_NET_WORTH_DATA', payload: { bankAccounts: filtered } });
  }, [state.netWorthData.bankAccounts]);
  
  // Net Worth helpers - Brokerage Accounts
  const addBrokerageAccount = useCallback((name?: string) => {
    const newAccount = createDefaultBrokerageAccount();
    newAccount.name = name || `Brokerage ${state.netWorthData.brokerageAccounts.length + 1}`;
    dispatch({ 
      type: 'UPDATE_NET_WORTH_DATA', 
      payload: { brokerageAccounts: [...state.netWorthData.brokerageAccounts, newAccount] } 
    });
  }, [state.netWorthData.brokerageAccounts]);
  
  const updateBrokerageAccount = useCallback((id: string, data: Partial<BrokerageAccountEntry>) => {
    const updated = state.netWorthData.brokerageAccounts.map(a => 
      a.id === id ? { ...a, ...data } : a
    );
    dispatch({ type: 'UPDATE_NET_WORTH_DATA', payload: { brokerageAccounts: updated } });
  }, [state.netWorthData.brokerageAccounts]);
  
  const removeBrokerageAccount = useCallback((id: string) => {
    const filtered = state.netWorthData.brokerageAccounts.filter(a => a.id !== id);
    dispatch({ type: 'UPDATE_NET_WORTH_DATA', payload: { brokerageAccounts: filtered } });
  }, [state.netWorthData.brokerageAccounts]);
  
  // Net Worth helpers - Crypto
  const addCrypto = useCallback((name?: string) => {
    const newCrypto = createDefaultCrypto();
    newCrypto.name = name || `Crypto ${state.netWorthData.cryptoHoldings.length + 1}`;
    dispatch({ 
      type: 'UPDATE_NET_WORTH_DATA', 
      payload: { cryptoHoldings: [...state.netWorthData.cryptoHoldings, newCrypto] } 
    });
  }, [state.netWorthData.cryptoHoldings]);
  
  const updateCrypto = useCallback((id: string, data: Partial<CryptoEntry>) => {
    const updated = state.netWorthData.cryptoHoldings.map(c => 
      c.id === id ? { ...c, ...data } : c
    );
    dispatch({ type: 'UPDATE_NET_WORTH_DATA', payload: { cryptoHoldings: updated } });
  }, [state.netWorthData.cryptoHoldings]);
  
  const removeCrypto = useCallback((id: string) => {
    const filtered = state.netWorthData.cryptoHoldings.filter(c => c.id !== id);
    dispatch({ type: 'UPDATE_NET_WORTH_DATA', payload: { cryptoHoldings: filtered } });
  }, [state.netWorthData.cryptoHoldings]);
  
  // Net Worth helpers - Retirement Accounts
  const addRetirementAccount = useCallback((name?: string) => {
    const newAccount = createDefaultRetirementAccount();
    newAccount.name = name || `Retirement ${state.netWorthData.retirementAccounts.length + 1}`;
    dispatch({ 
      type: 'UPDATE_NET_WORTH_DATA', 
      payload: { retirementAccounts: [...state.netWorthData.retirementAccounts, newAccount] } 
    });
  }, [state.netWorthData.retirementAccounts]);
  
  const updateRetirementAccount = useCallback((id: string, data: Partial<RetirementAccountEntry>) => {
    const updated = state.netWorthData.retirementAccounts.map(a => 
      a.id === id ? { ...a, ...data } : a
    );
    dispatch({ type: 'UPDATE_NET_WORTH_DATA', payload: { retirementAccounts: updated } });
  }, [state.netWorthData.retirementAccounts]);
  
  const removeRetirementAccount = useCallback((id: string) => {
    const filtered = state.netWorthData.retirementAccounts.filter(a => a.id !== id);
    dispatch({ type: 'UPDATE_NET_WORTH_DATA', payload: { retirementAccounts: filtered } });
  }, [state.netWorthData.retirementAccounts]);
  
  // Net Worth helpers - Personal Assets
  const addPersonalAsset = useCallback((name?: string) => {
    const newAsset = createDefaultPersonalAsset();
    newAsset.name = name || `Asset ${state.netWorthData.personalAssets.length + 1}`;
    dispatch({ 
      type: 'UPDATE_NET_WORTH_DATA', 
      payload: { personalAssets: [...state.netWorthData.personalAssets, newAsset] } 
    });
  }, [state.netWorthData.personalAssets]);
  
  const updatePersonalAsset = useCallback((id: string, data: Partial<PersonalAssetEntry>) => {
    const updated = state.netWorthData.personalAssets.map(a => 
      a.id === id ? { ...a, ...data } : a
    );
    dispatch({ type: 'UPDATE_NET_WORTH_DATA', payload: { personalAssets: updated } });
  }, [state.netWorthData.personalAssets]);
  
  const removePersonalAsset = useCallback((id: string) => {
    const filtered = state.netWorthData.personalAssets.filter(a => a.id !== id);
    dispatch({ type: 'UPDATE_NET_WORTH_DATA', payload: { personalAssets: filtered } });
  }, [state.netWorthData.personalAssets]);
  
  // Net Worth helpers - Debts
  const addDebt = useCallback((name?: string) => {
    const newDebt = createDefaultDebt();
    newDebt.name = name || `Debt ${state.netWorthData.debts.length + 1}`;
    dispatch({ 
      type: 'UPDATE_NET_WORTH_DATA', 
      payload: { debts: [...state.netWorthData.debts, newDebt] } 
    });
  }, [state.netWorthData.debts]);
  
  const updateDebt = useCallback((id: string, data: Partial<DebtEntry>) => {
    const updated = state.netWorthData.debts.map(d => 
      d.id === id ? { ...d, ...data } : d
    );
    dispatch({ type: 'UPDATE_NET_WORTH_DATA', payload: { debts: updated } });
  }, [state.netWorthData.debts]);
  
  const removeDebt = useCallback((id: string) => {
    const filtered = state.netWorthData.debts.filter(d => d.id !== id);
    dispatch({ type: 'UPDATE_NET_WORTH_DATA', payload: { debts: filtered } });
  }, [state.netWorthData.debts]);

  const updateSocialSecurityData = useCallback((data: Partial<SocialSecurityData>) => {
    dispatch({ type: 'UPDATE_SOCIAL_SECURITY_DATA', payload: data });
  }, []);
  
  const runCalculations = useCallback(async () => {
    dispatch({ type: 'SET_IS_CALCULATING', payload: true });
    
    try {
      // Run on next tick to allow UI to update
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Calculate scenario results
      const scenarioResults = calculateScenarioResults(state.retirementData);
      dispatch({ type: 'SET_SCENARIO_RESULTS', payload: scenarioResults });
      
      // Run Monte Carlo simulation
      const monteCarloResults = performMonteCarloProjection(state.retirementData);
      dispatch({ type: 'SET_MONTE_CARLO_RESULTS', payload: monteCarloResults });
    } finally {
      dispatch({ type: 'SET_IS_CALCULATING', payload: false });
    }
  }, [state.retirementData]);
  
  const saveToLocalStorage = useCallback(() => {
    const dataToSave = {
      retirementData: state.retirementData,
      netWorthData: state.netWorthData,
      budgetData: state.budgetData,
      taxSettings: state.taxSettings,
      mortgageData: state.mortgageData,
      socialSecurityData: state.socialSecurityData,
    };
    localStorage.setItem('retirepro-data', JSON.stringify(dataToSave));
    dispatch({ type: 'MARK_SAVED' });
  }, [state]);
  
  const loadFromLocalStorage = useCallback(() => {
    const saved = localStorage.getItem('retirepro-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_DATA', payload: parsed });
      } catch (e) {
        console.error('Failed to load saved data:', e);
      }
    }
  }, []);
  
  const exportToJSON = useCallback(async () => {
    const dataToExport = {
      version: '3.0',
      exportDate: new Date().toISOString(),
      retirementData: state.retirementData,
      netWorthData: state.netWorthData,
      budgetData: state.budgetData,
      taxSettings: state.taxSettings,
      mortgageData: state.mortgageData,
      socialSecurityData: state.socialSecurityData,
      scenarioResults: state.scenarioResults,
      monteCarloResults: state.monteCarloResults,
    };
    
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const fileName = `retirepro-export-${new Date().toISOString().split('T')[0]}.json`;

    try {
      // Try to use the File System Access API for "Save As" functionality
      if ('showSaveFilePicker' in window) {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: 'JSON File',
            accept: { 'application/json': ['.json'] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(jsonString);
        await writable.close();
        return;
      }
    } catch (err) {
      // If user cancels or API fails, fall back to download
      if ((err as Error).name === 'AbortError') {
        return; // User cancelled
      }
      console.error('Error saving file:', err);
    }
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);
  
  const resetAll = useCallback(() => {
    dispatch({ type: 'RESET_ALL' });
  }, []);
  
  return (
    <AppContext.Provider value={{
      state,
      dispatch,
      setActiveTab,
      setTheme,
      updateRetirementData,
      updateNetWorthData,
      updateBudgetData,
      updateTaxSettings,
      updateMortgageData,
      updateSocialSecurityData,
      addMortgage,
      updateMortgageEntry,
      removeMortgage,
      // Net Worth helpers
      addProperty,
      updateProperty,
      removeProperty,
      addVehicle,
      updateVehicle,
      removeVehicle,
      addBankAccount,
      updateBankAccount,
      removeBankAccount,
      addBrokerageAccount,
      updateBrokerageAccount,
      removeBrokerageAccount,
      addCrypto,
      updateCrypto,
      removeCrypto,
      addRetirementAccount,
      updateRetirementAccount,
      removeRetirementAccount,
      addPersonalAsset,
      updatePersonalAsset,
      removePersonalAsset,
      addDebt,
      updateDebt,
      removeDebt,
      runCalculations,
      saveToLocalStorage,
      loadFromLocalStorage,
      exportToJSON,
      resetAll,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
