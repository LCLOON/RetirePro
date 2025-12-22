// RetirePro Types - Web Version

// Core retirement data types
export interface RetirementData {
  // Basic Information
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  filingStatus: 'single' | 'married' | 'head_of_household';
  
  // Current Savings (by tax type)
  currentSavingsPreTax: number;
  currentSavingsRoth: number;
  currentSavingsAfterTax: number;
  
  // Annual Contributions
  annualContributionPreTax: number;
  annualContributionRoth: number;
  annualContributionAfterTax: number;
  employerMatch: number;
  contributionGrowthRate: number;
  
  // Investment Returns
  preRetirementReturn: number;
  postRetirementReturn: number;
  inflationRate: number;
  standardDeviation: number;
  
  // Retirement Income Needs
  retirementExpenses: number;
  expenseGrowthRate: number;
  safeWithdrawalRate: number;
  
  // Social Security & Other Income
  socialSecurityBenefit: number;
  socialSecurityStartAge: number;
  pensionIncome: number;
  otherIncome: number;
  otherIncomeStartAge: number;
  otherIncomeEndAge: number;
  
  // Simulation Settings
  monteCarloRuns: number;
  successProbability: number;
  includeSocialSecurity: boolean;
  inflationAdjusted: boolean;
}

// Default values for web app
export const DEFAULT_RETIREMENT_DATA: RetirementData = {
  currentAge: 30,
  retirementAge: 65,
  lifeExpectancy: 90,
  filingStatus: 'single',
  
  currentSavingsPreTax: 50000,
  currentSavingsRoth: 25000,
  currentSavingsAfterTax: 10000,
  
  annualContributionPreTax: 10000,
  annualContributionRoth: 6000,
  annualContributionAfterTax: 5000,
  employerMatch: 5000,
  contributionGrowthRate: 0.02,
  
  preRetirementReturn: 0.07,
  postRetirementReturn: 0.05,
  inflationRate: 0.025,
  standardDeviation: 0.15,
  
  retirementExpenses: 60000,
  expenseGrowthRate: 0.02,
  safeWithdrawalRate: 0.04,
  
  socialSecurityBenefit: 25000,
  socialSecurityStartAge: 67,
  pensionIncome: 0,
  otherIncome: 0,
  otherIncomeStartAge: 65,
  otherIncomeEndAge: 90,
  
  monteCarloRuns: 1000,
  successProbability: 90,
  includeSocialSecurity: true,
  inflationAdjusted: true,
};

// Scenario projection for a single year
export interface YearProjection {
  age: number;
  year: number;
  balance: number;
  contribution: number;
  growth: number;
  withdrawal: number;
  income: number;
}

// Results for a scenario (expected, optimistic, pessimistic)
export interface ScenarioResult {
  atRetirement: number;
  atEnd: number;
  yearsLast: number;
  yearByYear: YearProjection[];
}

// All scenario results
export interface ScenarioResults {
  expected: ScenarioResult;
  optimistic: ScenarioResult;
  pessimistic: ScenarioResult;
}

// Monte Carlo results
export interface MonteCarloResults {
  successRate: number;
  median: number;
  percentile10: number;
  percentile25: number;
  percentile75: number;
  percentile90: number;
  mean: number;
  min: number;
  max: number;
}

// Net Worth Types - Simplified for web
export interface NetWorthData {
  assets: {
    cashSavings: number;
    checking: number;
    retirement: number;
    brokerage: number;
    realEstate: number;
    vehicles: number;
    other: number;
  };
  liabilities: {
    mortgage: number;
    autoLoans: number;
    studentLoans: number;
    creditCards: number;
    other: number;
  };
}

export const DEFAULT_NET_WORTH: NetWorthData = {
  assets: {
    cashSavings: 0,
    checking: 0,
    retirement: 0,
    brokerage: 0,
    realEstate: 0,
    vehicles: 0,
    other: 0,
  },
  liabilities: {
    mortgage: 0,
    autoLoans: 0,
    studentLoans: 0,
    creditCards: 0,
    other: 0,
  },
};

// Budget Types - Simplified for web
export interface BudgetData {
  income: {
    salary: number;
    spouseSalary: number;
    investment: number;
    other: number;
  };
  expenses: {
    housing: number;
    utilities: number;
    food: number;
    transportation: number;
    healthcare: number;
    insurance: number;
    entertainment: number;
    other: number;
  };
}

export const DEFAULT_BUDGET: BudgetData = {
  income: {
    salary: 0,
    spouseSalary: 0,
    investment: 0,
    other: 0,
  },
  expenses: {
    housing: 0,
    utilities: 0,
    food: 0,
    transportation: 0,
    healthcare: 0,
    insurance: 0,
    entertainment: 0,
    other: 0,
  },
};

// Tax Settings
export interface TaxSettings {
  filingStatus: 'single' | 'married' | 'head_of_household';
  state: string;
  federalBracketsYear: number;
  includeStateTax: boolean;
  capitalGainsRate: number;
  rmdStartAge: number;
  ssTaxationEnabled: boolean;
  annualIncome: number;
  stateTaxRate: number;
}

export const DEFAULT_TAX_SETTINGS: TaxSettings = {
  filingStatus: 'single',
  state: 'OTHER',
  federalBracketsYear: 2025,
  includeStateTax: true,
  capitalGainsRate: 0.15,
  rmdStartAge: 73,
  ssTaxationEnabled: true,
  annualIncome: 75000,
  stateTaxRate: 0.05,
};

// Mortgage Types
export interface MortgageData {
  homePrice: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  loanTermYears: number;
  extraPayment: number;
  propertyTax: number;
  insurance: number;
  pmi: number;
}

export const DEFAULT_MORTGAGE: MortgageData = {
  homePrice: 400000,
  downPayment: 80000,
  loanAmount: 320000,
  interestRate: 0.065,
  loanTermYears: 30,
  extraPayment: 0,
  propertyTax: 4800,
  insurance: 1200,
  pmi: 0,
};

// Social Security Types
export interface SocialSecurityData {
  averageEarnings: number;
  birthYear: number;
  estimatedBenefitAge62: number;
  estimatedBenefitFRA: number;
  estimatedBenefitAge70: number;
  claimingAge: number;
  spouseEstimatedBenefit: number;
  spouseClaimingAge: number;
}

export const DEFAULT_SOCIAL_SECURITY: SocialSecurityData = {
  averageEarnings: 75000,
  birthYear: 1965,
  estimatedBenefitAge62: 0,
  estimatedBenefitFRA: 0,
  estimatedBenefitAge70: 0,
  claimingAge: 67,
  spouseEstimatedBenefit: 0,
  spouseClaimingAge: 67,
};

// App Tab Types
export type TabId = 
  | 'start'
  | 'data'
  | 'results'
  | 'charts'
  | 'analysis'
  | 'details'
  | 'social'
  | 'tax'
  | 'worth'
  | 'mortgage'
  | 'budget'
  | 'advanced'
  | 'legal'
  | 'ai'
  | 'about'
  | 'settings'
  | 'help';

export interface Tab {
  id: TabId;
  label: string;
  icon?: React.ReactNode;
}

export const TABS: Tab[] = [
  { id: 'start', label: 'Start' },
  { id: 'data', label: 'Data Entry' },
  { id: 'results', label: 'Results' },
  { id: 'charts', label: 'Charts' },
  { id: 'analysis', label: 'Analysis' },
  { id: 'details', label: 'Details' },
  { id: 'worth', label: 'Net Worth' },
  { id: 'mortgage', label: 'Mortgage' },
  { id: 'budget', label: 'Budget' },
  { id: 'social', label: 'Social Security' },
  { id: 'tax', label: 'Tax' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'legal', label: 'Legal' },
  { id: 'ai', label: 'AI Advisor' },
  { id: 'about', label: 'About' },
  { id: 'settings', label: 'Settings' },
  { id: 'help', label: 'Help' },
];

// Chart colors matching desktop version
export const CHART_COLORS = {
  primary: '#059669',
  secondary: '#065f46',
  accent: '#10B981',
  warning: '#F59E0B',
  danger: '#DC2626',
  info: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',
};

// Social Security bend points (2025)
export const SS_BEND_POINTS = {
  firstBendPoint: 1174,
  secondBendPoint: 7078,
  wageBase: 176700,
};

export const SS_BENEFIT_MULTIPLIERS = {
  firstTier: 0.90,
  secondTier: 0.32,
  thirdTier: 0.15,
};
