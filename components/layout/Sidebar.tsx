'use client';

import { useState } from 'react';
import { TabId } from '@/lib/types';
import { useApp } from '@/lib/store';
import { useSubscription, FEATURE_TIERS, TIER_INFO, SubscriptionTier } from '@/lib/subscription';
import { useSidebar } from './DashboardLayout';
import Link from 'next/link';

interface NavItem {
  id: TabId;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { id: 'start', label: 'Overview', icon: '📈' },
  { id: 'social', label: 'Social Security', icon: '🏛️' },
  { id: 'data', label: 'Data Entry', icon: '📝' },
  { id: 'results', label: 'Results', icon: '📊' },
  { id: 'charts', label: 'Charts', icon: '📉' },
  { id: 'analysis', label: 'Analysis', icon: '🔍' },
  { id: 'details', label: 'Details', icon: '📋' },
  { id: 'tax', label: 'Tax Planning', icon: '💰' },
  { id: 'worth', label: 'Net Worth', icon: '🏆' },
  { id: 'mortgage', label: 'Mortgage', icon: '🏠' },
  { id: 'budget', label: 'Budget', icon: '💳' },
  { id: 'advanced', label: 'Advanced', icon: '🎯' },
  { id: 'legal', label: 'Legal', icon: '⚖️' },
  { id: 'ai', label: 'AI Advisor', icon: '🤖' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
  { id: 'help', label: 'Help', icon: '❓' },
];

function TierBadge({ requiredTier, currentTier }: { requiredTier: SubscriptionTier; currentTier: SubscriptionTier }) {
  if (requiredTier === 'free') return null;
  
  const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
    'free': 0,
    'pro': 1,
    'premium': 2,
  };
  
  const hasAccess = TIER_HIERARCHY[currentTier] >= TIER_HIERARCHY[requiredTier];
  
  if (hasAccess) return null;
  
  return (
    <span 
      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
        requiredTier === 'premium' 
          ? 'bg-purple-500/20 text-purple-400' 
          : 'bg-emerald-500/20 text-emerald-400'
      }`}
      title={`Requires ${TIER_INFO[requiredTier].name}`}
    >
      {requiredTier === 'premium' ? 'PRO+' : 'PRO'}
    </span>
  );
}

export function Sidebar() {
  const { state, setActiveTab } = useApp();
  const { tier, setTier, canAccess } = useSubscription();
  const { isOpen, setIsOpen } = useSidebar();
  const [showTierDropdown, setShowTierDropdown] = useState(false);

  // Calculate stats
  const totalSavings = state.retirementData.currentSavingsPreTax + 
    state.retirementData.currentSavingsRoth + 
    state.retirementData.currentSavingsAfterTax;
  
  const yearsToRetirement = state.retirementData.retirementAge - state.retirementData.currentAge;
  
  const successRate = state.monteCarloResults ? 
    Math.round(state.monteCarloResults.successRate) : 0;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const tierColors: Record<SubscriptionTier, string> = {
    free: 'bg-slate-600 text-slate-200',
    pro: 'bg-emerald-600 text-white',
    premium: 'bg-purple-600 text-white',
  };

  const handleNavClick = (tabId: TabId) => {
    setActiveTab(tabId);
    // Close sidebar on mobile after navigation
    setIsOpen(false);
  };

  return (
    <aside className={`
      fixed left-0 top-0 h-full w-64 lg:w-56 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-slate-900 dark:to-slate-800 
      border-r border-gray-200 dark:border-slate-700/50 flex flex-col z-40
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <span className="text-xl">💎</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">RetirePro</h1>
            <p className="text-xs text-gray-500 dark:text-slate-400">Plan Your Future</p>
          </div>
        </div>
        {/* Close button - mobile only */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-2 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
          aria-label="Close menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Current Plan Section */}
      <div className="px-3 py-3 border-b border-gray-200 dark:border-slate-700/50 space-y-2">
        {/* Current Plan Badge */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Current Plan</span>
          <span className={`text-xs px-2 py-0.5 rounded font-bold ${tierColors[tier]}`}>
            {tier.toUpperCase()}
          </span>
        </div>

        {/* Upgrade Plan Button */}
        {tier !== 'premium' && (
          <Link 
            href="/landing#pricing"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm px-3 py-2 rounded-lg font-medium transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Upgrade Plan
          </Link>
        )}

        {/* Plan Tier Selector */}
        <div className="relative">
          <button
            onClick={() => setShowTierDropdown(!showTierDropdown)}
            className="flex items-center gap-2 w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-xs text-slate-300 hover:bg-slate-600/50 transition-colors"
          >
            <span className="text-emerald-400">⚡</span>
            <span className="flex-1 text-left">Switch Plan Tier</span>
            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showTierDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowTierDropdown(false)} 
              />
              <div className="absolute left-0 right-0 top-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-20 py-1">
                {(['free', 'pro', 'premium'] as SubscriptionTier[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTier(t);
                      setShowTierDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs hover:bg-slate-700 flex items-center gap-2 ${
                      tier === t ? 'bg-slate-700' : ''
                    }`}
                  >
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tierColors[t]}`}>
                      {t.toUpperCase()}
                    </span>
                    {tier === t && (
                      <svg className="w-3 h-3 text-emerald-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Stats - hidden on very small screens */}
      <div className="px-3 py-3 border-b border-gray-200 dark:border-slate-700/50 space-y-2 hidden sm:block">
        <div className="flex items-center gap-2">
          <span className="text-sm">📊</span>
          <div className="flex-1">
            <p className="text-[10px] text-gray-500 dark:text-slate-500">Total Savings</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(totalSavings)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm">⏱️</span>
          <div className="flex-1">
            <p className="text-[10px] text-gray-500 dark:text-slate-500">Years to Retire</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{yearsToRetirement} years</p>
          </div>
        </div>

        {state.monteCarloResults && (
          <div className="flex items-center gap-2">
            <span className="text-sm">🏆</span>
            <div className="flex-1">
              <p className="text-[10px] text-slate-500">Success Rate</p>
              <p className={`text-sm font-semibold ${
                successRate >= 80 ? 'text-emerald-400' : 
                successRate >= 60 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {successRate}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = state.activeTab === item.id;
            const requiredTier = FEATURE_TIERS[item.id] || 'free';
            const hasAccess = canAccess(item.id);
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                    : hasAccess
                      ? 'text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white border border-transparent'
                      : 'text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800/50 border border-transparent'
                  }
                `}
              >
                <span className={`text-base ${!hasAccess ? 'opacity-50' : ''}`}>{item.icon}</span>
                <span className={`text-sm font-medium flex-1 ${!hasAccess ? 'opacity-50' : ''}`}>{item.label}</span>
                <TierBadge requiredTier={requiredTier as SubscriptionTier} currentTier={tier} />
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-gray-200 dark:border-slate-700/50">
        <Link 
          href="/landing"
          onClick={() => setIsOpen(false)}
          className="flex items-center justify-center gap-2 w-full text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-700/50 text-sm px-3 py-2 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </Link>
      </div>
    </aside>
  );
}
