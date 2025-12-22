// RetirePro Types - Web Version

// US States for tax purposes
export const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' }, { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'Washington D.C.' },
] as const;

// Inherited IRA type
export interface InheritedIRA {
  balance: number;
  inheritedYear: number;
  originalOwnerBirthYear: number;
  beneficiaryType: 'spouse' | 'non_spouse_eligible' | 'non_spouse_10_year';
  useStretchIRA: boolean; // For eligible designated beneficiaries
}

// Additional Income Source type
export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  startAge: number;
  endAge: number;
  adjustForInflation: boolean;
  type: 'rental' | 'part_time' | 'annuity' | 'trust' | 'royalty' | 'other';
}

// Drawdown Strategy
export type DrawdownStrategy = 
  | 'traditional' // Taxable → Tax-Deferred → Tax-Free
  | 'roth_first' // Tax-Free → Taxable → Tax-Deferred
  | 'proportional' // Pro-rata from all accounts
  | 'tax_efficient' // Optimize based on tax brackets
  | 'custom'; // User-defined order

export interface DrawdownOrder {
  priority: ('pretax' | 'roth' | 'aftertax' | 'hsa' | 'inherited_ira')[];
}

// Core retirement data types
export interface RetirementData {
  // Basic Information
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  filingStatus: 'single' | 'married' | 'head_of_household';
  state: string; // State for tax calculations
  
  // Spouse Information (for married)
  hasSpouse: boolean;
  spouseCurrentAge: number;
  spouseRetirementAge: number;
  spouseLifeExpectancy: number;
  spouseSocialSecurityBenefit: number;
  spouseSocialSecurityStartAge: number;
  
  // Current Savings (by tax type)
  currentSavingsPreTax: number;
  currentSavingsRoth: number;
  currentSavingsAfterTax: number;
  
  // HSA (Health Savings Account)
  currentHSA: number;
  annualHSAContribution: number;
  hsaCatchUp: boolean; // Age 55+ catch-up contribution
  
  // Inherited IRA
  hasInheritedIRA: boolean;
  inheritedIRA: InheritedIRA;
  
  // Annual Contributions
  annualContributionPreTax: number;
  annualContributionRoth: number;
  annualContributionAfterTax: number;
  employerMatch: number;
  contributionGrowthRate: number;
  
  // Catch-up Contributions (age 50+)
  includeCatchUpContributions: boolean;
  
  // Investment Returns
  preRetirementReturn: number;
  postRetirementReturn: number;
  inflationRate: number;
  standardDeviation: number;
  
  // Retirement Income Needs
  retirementExpenses: number;
  expenseGrowthRate: number;
  safeWithdrawalRate: number;
  
  // Healthcare Costs
  annualHealthcareCost: number;
  healthcareInflationRate: number; // Typically higher than general inflation
  medicareStartAge: number;
  medicarePremium: number; // Monthly Part B premium
  medicareSupplementPremium: number; // Medigap or Advantage premium
  
  // Social Security
  socialSecurityBenefit: number;
  socialSecurityStartAge: number;
  
  // Pension
  hasPension: boolean;
  pensionIncome: number;
  pensionStartAge: number;
  pensionCOLA: number; // Cost of living adjustment %
  pensionSurvivorBenefit: number; // % for spouse if applicable
  
  // Additional Income Sources
  additionalIncome: IncomeSource[];
  
  // Drawdown Strategy
  drawdownStrategy: DrawdownStrategy;
  customDrawdownOrder: DrawdownOrder;
  
  // RMD Settings
  includeRMD: boolean;
  rmdStartAge: number; // 73 for most, 75 for those born 1960+
  
  // Roth Conversion Strategy
  rothConversionEnabled: boolean;
  rothConversionAmount: number; // Annual conversion amount
  rothConversionStartAge: number;
  rothConversionEndAge: number;
  
  // Legacy/Estate Planning
  desiredLegacy: number; // Amount to leave to heirs
  
  // Simulation Settings
  monteCarloRuns: number;
  successProbability: number;
  includeSocialSecurity: boolean;
  inflationAdjusted: boolean;
}

// Default Inherited IRA
export const DEFAULT_INHERITED_IRA: InheritedIRA = {
  balance: 0,
  inheritedYear: new Date().getFullYear(),
  originalOwnerBirthYear: 1950,
  beneficiaryType: 'non_spouse_10_year',
  useStretchIRA: false,
};

// Default values for web app
export const DEFAULT_RETIREMENT_DATA: RetirementData = {
  currentAge: 30,
  retirementAge: 65,
  lifeExpectancy: 90,
  filingStatus: 'single',
  state: 'CA',
  
  // Spouse defaults
  hasSpouse: false,
  spouseCurrentAge: 30,
  spouseRetirementAge: 65,
  spouseLifeExpectancy: 90,
  spouseSocialSecurityBenefit: 0,
  spouseSocialSecurityStartAge: 67,
  
  currentSavingsPreTax: 50000,
  currentSavingsRoth: 25000,
  currentSavingsAfterTax: 10000,
  
  // HSA defaults
  currentHSA: 0,
  annualHSAContribution: 0,
  hsaCatchUp: false,
  
  // Inherited IRA defaults
  hasInheritedIRA: false,
  inheritedIRA: DEFAULT_INHERITED_IRA,
  
  annualContributionPreTax: 10000,
  annualContributionRoth: 6000,
  annualContributionAfterTax: 5000,
  employerMatch: 5000,
  contributionGrowthRate: 0.02,
  
  includeCatchUpContributions: false,
  
  preRetirementReturn: 0.07,
  postRetirementReturn: 0.05,
  inflationRate: 0.025,
  standardDeviation: 0.15,
  
  retirementExpenses: 60000,
  expenseGrowthRate: 0.02,
  safeWithdrawalRate: 0.04,
  
  // Healthcare defaults
  annualHealthcareCost: 8000,
  healthcareInflationRate: 0.05,
  medicareStartAge: 65,
  medicarePremium: 175, // 2024 standard Part B premium
  medicareSupplementPremium: 150,
  
  socialSecurityBenefit: 25000,
  socialSecurityStartAge: 67,
  
  // Pension defaults
  hasPension: false,
  pensionIncome: 0,
  pensionStartAge: 65,
  pensionCOLA: 0,
  pensionSurvivorBenefit: 0.5,
  
  // Additional income
  additionalIncome: [],
  
  // Drawdown defaults
  drawdownStrategy: 'traditional',
  customDrawdownOrder: { priority: ['aftertax', 'pretax', 'roth', 'hsa'] },
  
  // RMD defaults
  includeRMD: true,
  rmdStartAge: 73,
  
  // Roth conversion defaults
  rothConversionEnabled: false,
  rothConversionAmount: 0,
  rothConversionStartAge: 65,
  rothConversionEndAge: 72,
  
  // Legacy
  desiredLegacy: 0,
  
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
