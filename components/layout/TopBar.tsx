'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { useSubscription, SubscriptionTier } from '@/lib/subscription';
import Link from 'next/link';

export function TopBar() {
  const { state, saveToLocalStorage } = useApp();
  const { tier, setTier } = useSubscription();
  const [showTierDropdown, setShowTierDropdown] = useState(false);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate quick stats
  const totalSavings = state.retirementData.currentSavingsPreTax + 
    state.retirementData.currentSavingsRoth + 
    state.retirementData.currentSavingsAfterTax;

  const yearsToRetirement = state.retirementData.retirementAge - state.retirementData.currentAge;
  
  const successRate = state.monteCarloResults ? 
    Math.round(state.monteCarloResults.successRate * 100) : 0;

  // Tier badge colors
  const tierColors: Record<SubscriptionTier, string> = {
    free: 'bg-slate-600 text-slate-200',
    pro: 'bg-emerald-600 text-white',
    premium: 'bg-purple-600 text-white',
  };

  const tierLabels: Record<SubscriptionTier, string> = {
    free: 'FREE',
    pro: 'PRO',
    premium: 'PREMIUM',
  };

  return (
    <header className="h-16 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 flex items-center justify-between px-6">
      {/* Quick Stats */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-lg">
          <span className="text-lg">📊</span>
          <div>
            <p className="text-xs text-slate-400">Total Savings</p>
            <p className="text-sm font-semibold text-white">{formatCurrency(totalSavings)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-lg">
          <span className="text-lg">⏱️</span>
          <div>
            <p className="text-xs text-slate-400">Years to Retire</p>
            <p className="text-sm font-semibold text-white">{yearsToRetirement} years</p>
          </div>
        </div>

        {state.monteCarloResults && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-lg">
            <span className="text-lg">🏆</span>
            <div>
              <p className="text-xs text-slate-400">Success Rate</p>
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

      {/* Right Side - Tier & Actions */}
      <div className="flex items-center gap-3">
        {state.hasUnsavedChanges && (
          <span className="text-xs text-amber-400 mr-2">● Unsaved changes</span>
        )}

        {/* Save Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={saveToLocalStorage}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save
        </Button>

        {/* Demo Mode Tier Selector */}
        <div className="relative">
          <button
            onClick={() => setShowTierDropdown(!showTierDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-slate-300 hover:bg-slate-600/50 transition-colors"
          >
            <span className="text-yellow-400">🧪</span>
            <span>Demo Mode:</span>
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${tierColors[tier]}`}>
              {tierLabels[tier]}
            </span>
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showTierDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowTierDropdown(false)} 
              />
              <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-20 min-w-[140px] py-1">
                {(['free', 'pro', 'premium'] as SubscriptionTier[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTier(t);
                      setShowTierDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-700 flex items-center gap-2 ${
                      tier === t ? 'bg-slate-700' : ''
                    }`}
                  >
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${tierColors[t]}`}>
                      {tierLabels[t]}
                    </span>
                    {tier === t && (
                      <svg className="w-4 h-4 text-emerald-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Current Plan Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-lg border border-slate-600">
          <span className="text-lg">💎</span>
          <div className="text-left">
            <p className="text-[10px] text-slate-400 leading-none">RetirePro</p>
            <p className="text-xs text-slate-300 leading-tight">Current Plan</p>
          </div>
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${tierColors[tier]}`}>
            {tierLabels[tier]}
          </span>
        </div>

        {/* Upgrade Plan Button */}
        {tier !== 'premium' && (
          <Link href="/landing#pricing">
            <Button
              variant="primary"
              size="sm"
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-0"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              Upgrade Plan
            </Button>
          </Link>
        )}

        {/* Logout Button */}
        <Link href="/landing">
          <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </Link>
      </div>
    </header>
  );
}
