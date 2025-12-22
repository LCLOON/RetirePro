'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Subscription tiers
export type SubscriptionTier = 'free' | 'pro' | 'premium';

// Feature definitions - which tier is required for each feature
export const FEATURE_TIERS: Record<string, SubscriptionTier> = {
  // Free tier features
  'start': 'free',
  'data': 'free',
  'results': 'free',           // Basic results only
  'social': 'free',            // Basic Social Security estimator
  'help': 'free',
  'about': 'free',
  'settings': 'free',
  
  // Pro tier features ($9/month)
  'charts': 'pro',             // Advanced charts
  'analysis': 'pro',           // Monte Carlo analysis
  'details': 'pro',            // Detailed projections
  'tax': 'pro',                // Tax planning
  'worth': 'pro',              // Net Worth tracking
  'mortgage': 'pro',           // Mortgage calculator
  'budget': 'pro',             // Budget planner
  
  // Premium tier features ($19/month)
  'advanced': 'premium',       // Advanced scenarios
  'legal': 'premium',          // Legal/Estate planning
  'ai': 'premium',             // AI Advisor
};

// Feature names for display
export const FEATURE_NAMES: Record<string, string> = {
  'start': 'Overview',
  'data': 'Data Entry',
  'results': 'Results',
  'charts': 'Advanced Charts',
  'analysis': 'Monte Carlo Analysis',
  'details': 'Detailed Projections',
  'social': 'Social Security',
  'tax': 'Tax Planning',
  'worth': 'Net Worth Tracking',
  'mortgage': 'Mortgage Calculator',
  'budget': 'Budget Planner',
  'advanced': 'Advanced Scenarios',
  'legal': 'Estate Planning',
  'ai': 'AI Retirement Advisor',
  'about': 'About',
  'settings': 'Settings',
  'help': 'Help',
};

// Tier hierarchy for comparison
const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  'free': 0,
  'pro': 1,
  'premium': 2,
};

// Check if a user's tier can access a feature
export function canAccessFeature(userTier: SubscriptionTier, featureId: string): boolean {
  const requiredTier = FEATURE_TIERS[featureId] || 'free';
  return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];
}

// Get the required tier for a feature
export function getRequiredTier(featureId: string): SubscriptionTier {
  return FEATURE_TIERS[featureId] || 'free';
}

// Subscription context
interface SubscriptionContextType {
  tier: SubscriptionTier;
  setTier: (tier: SubscriptionTier) => void;
  canAccess: (featureId: string) => boolean;
  getRequiredTierForFeature: (featureId: string) => SubscriptionTier;
  isLoading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

// Storage key for persisting tier
const STORAGE_KEY = 'retirepro_subscription_tier';

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [tier, setTierState] = useState<SubscriptionTier>('free');
  const [isLoading, setIsLoading] = useState(true);

  // Load tier from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ['free', 'pro', 'premium'].includes(stored)) {
      setTierState(stored as SubscriptionTier);
    }
    setIsLoading(false);
  }, []);

  // Save tier to localStorage
  const setTier = (newTier: SubscriptionTier) => {
    setTierState(newTier);
    localStorage.setItem(STORAGE_KEY, newTier);
  };

  const canAccess = (featureId: string) => canAccessFeature(tier, featureId);
  const getRequiredTierForFeature = (featureId: string) => getRequiredTier(featureId);

  return (
    <SubscriptionContext.Provider value={{ tier, setTier, canAccess, getRequiredTierForFeature, isLoading }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

// Tier display info
export const TIER_INFO: Record<SubscriptionTier, { name: string; color: string; price: string; badge: string }> = {
  free: {
    name: 'Free',
    color: 'text-slate-400',
    price: '$0',
    badge: 'bg-slate-700 text-slate-300',
  },
  pro: {
    name: 'Pro',
    color: 'text-emerald-400',
    price: '$9/mo',
    badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  },
  premium: {
    name: 'Premium',
    color: 'text-purple-400',
    price: '$19/mo',
    badge: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  },
};

// Features grouped by tier for upgrade modals
export const PRO_FEATURES = [
  'Advanced Charts & Visualizations',
  'Monte Carlo Simulations',
  '30-Year Projections',
  'Tax Optimization Strategies',
  'Net Worth Tracking',
  'Mortgage Calculator',
  'Budget Planning Tools',
  'Email Support',
];

export const PREMIUM_FEATURES = [
  'Everything in Pro',
  'AI Retirement Advisor',
  'Estate Planning Tools',
  'Custom Advanced Scenarios',
  'Unlimited Simulations',
  'Priority Support',
  'Export to PDF/Excel',
  'Family Sharing (Coming Soon)',
];
