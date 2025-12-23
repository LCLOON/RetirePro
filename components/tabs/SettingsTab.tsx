'use client';

import { ReactNode } from 'react';
import { Card, CardGrid } from '@/components/ui';
import { Button } from '@/components/ui';
import { useApp, Theme } from '@/lib/store';
import { useSubscription, TIER_INFO, SubscriptionTier, PRO_FEATURES, PREMIUM_FEATURES } from '@/lib/subscription';
import Link from 'next/link';

export function SettingsTab() {
  const { state, setTheme, saveToLocalStorage, loadFromLocalStorage, resetAll, exportToJSON } = useApp();
  const { tier, setTier } = useSubscription();
  
  const themes: { id: Theme; label: string; icon: ReactNode }[] = [
    {
      id: 'light',
      label: 'Light',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
    },
    {
      id: 'system',
      label: 'System',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];
  
  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card title="Appearance" subtitle="Customize how RetirePro looks">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Color Theme
            </label>
            <div className="grid grid-cols-3 gap-4">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setTheme(theme.id)}
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                    ${state.theme === theme.id
                      ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30'
                      : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500 bg-gray-50 dark:bg-transparent'
                    }
                  `}
                >
                  <div className={`
                    p-3 rounded-lg
                    ${state.theme === theme.id
                      ? 'bg-blue-500 dark:bg-blue-800 text-white dark:text-blue-300'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-slate-400'
                    }
                  `}>
                    {theme.icon}
                  </div>
                  <span className={`
                    text-sm font-medium
                    ${state.theme === theme.id
                      ? 'text-blue-600 dark:text-blue-300'
                      : 'text-gray-600 dark:text-slate-300'
                    }
                  `}>
                    {theme.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Data Management */}
      <Card title="Data Management" subtitle="Save, load, and export your data">
        <CardGrid columns={2}>
          <div className="p-4 bg-gray-100 dark:bg-slate-700/50 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Local Storage</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Save your data to browser storage for quick access.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={saveToLocalStorage}>
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={loadFromLocalStorage}>
                Load
              </Button>
            </div>
          </div>
          
          <div className="p-4 bg-gray-100 dark:bg-slate-700/50 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Export Data</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Download your data as a JSON file for backup.
            </p>
            <Button variant="outline" size="sm" onClick={exportToJSON}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Export JSON
            </Button>
          </div>
        </CardGrid>
      </Card>
      
      {/* Reset */}
      <Card title="Reset" subtitle="Clear all data and start fresh">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-red-700 dark:text-red-200 mb-1">Danger Zone</h4>
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                This action will reset all your data to defaults. This cannot be undone.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
                    resetAll();
                  }
                }}
                className="border-red-700 text-red-400 hover:bg-red-900/40"
              >
                Reset All Data
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Subscription Management */}
      <Card title="Subscription" subtitle="Manage your RetirePro subscription">
        <div className="space-y-6">
          {/* Current Plan */}
          <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-slate-700/50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Plan</p>
              <p className={`text-xl font-bold ${TIER_INFO[tier].color}`}>
                {TIER_INFO[tier].name}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full ${TIER_INFO[tier].badge}`}>
              {TIER_INFO[tier].price}
            </div>
          </div>

          {/* Plan Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Change Plan
            </label>
            <div className="grid grid-cols-3 gap-4">
              {(['free', 'pro', 'premium'] as SubscriptionTier[]).map((planTier) => (
                <button
                  key={planTier}
                  onClick={() => setTier(planTier)}
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                    ${tier === planTier
                      ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-900/30'
                      : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500 bg-gray-50 dark:bg-transparent'
                    }
                  `}
                >
                  <span className="text-2xl">
                    {planTier === 'free' ? '🆓' : planTier === 'pro' ? '⭐' : '💎'}
                  </span>
                  <span className={`
                    text-sm font-medium
                    ${tier === planTier
                      ? 'text-emerald-600 dark:text-emerald-300'
                      : 'text-gray-600 dark:text-slate-300'
                    }
                  `}>
                    {TIER_INFO[planTier].name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    {TIER_INFO[planTier].price}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              * For testing purposes. In production, this will sync with Stripe.
            </p>
          </div>

          {/* Feature List */}
          {tier !== 'premium' && (
            <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-purple-500/10 border border-emerald-500/20 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Upgrade to {tier === 'free' ? 'Pro' : 'Premium'} for:
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                {(tier === 'free' ? PRO_FEATURES : PREMIUM_FEATURES).slice(0, 4).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link 
                href="/#pricing"
                className="inline-block mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                View Pricing
              </Link>
            </div>
          )}
        </div>
      </Card>
      
      {/* About */}
      <Card title="About RetirePro" subtitle="Version and information">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">RetirePro</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Version 3.0 Web</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            A comprehensive retirement planning calculator with Monte Carlo simulations.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
            © 2025 RetirePro. All rights reserved.
          </p>
        </div>
      </Card>
    </div>
  );
}
