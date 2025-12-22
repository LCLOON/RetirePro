'use client';

import { TabId } from '@/lib/types';
import { useApp } from '@/lib/store';
import { useSubscription, FEATURE_TIERS, TIER_INFO, SubscriptionTier } from '@/lib/subscription';
import Link from 'next/link';

interface NavItem {
  id: TabId;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { id: 'start', label: 'Overview', icon: '📈' },
  { id: 'data', label: 'Data Entry', icon: '📝' },
  { id: 'results', label: 'Results', icon: '📊' },
  { id: 'charts', label: 'Charts', icon: '📉' },
  { id: 'analysis', label: 'Analysis', icon: '🔍' },
  { id: 'details', label: 'Details', icon: '📋' },
  { id: 'social', label: 'Social Security', icon: '🏛️' },
  { id: 'tax', label: 'Tax Planning', icon: '💰' },
  { id: 'worth', label: 'Net Worth', icon: '🏆' },
  { id: 'mortgage', label: 'Mortgage', icon: '🏠' },
  { id: 'budget', label: 'Budget', icon: '💳' },
  { id: 'advanced', label: 'Advanced', icon: '🎯' },
  { id: 'legal', label: 'Legal', icon: '⚖️' },
  { id: 'ai', label: 'AI Advisor', icon: '🤖' },
  { id: 'about', label: 'About', icon: 'ℹ️' },
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
  const { tier, canAccess } = useSubscription();

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700/50 flex flex-col z-40">
      {/* Logo */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <span className="text-xl">💎</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">RetirePro</h1>
            <p className="text-xs text-slate-400">Plan Your Future</p>
          </div>
        </div>
      </div>

      {/* Current Plan Badge */}
      <div className="px-4 py-3 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Current Plan</span>
          <span className={`text-xs px-2 py-1 rounded-full ${TIER_INFO[tier].badge}`}>
            {TIER_INFO[tier].name}
          </span>
        </div>
        {tier === 'free' && (
          <Link 
            href="/#pricing"
            className="text-xs text-emerald-400 hover:text-emerald-300 mt-1 block"
          >
            Upgrade →
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = state.activeTab === item.id;
            const requiredTier = FEATURE_TIERS[item.id] || 'free';
            const hasAccess = canAccess(item.id);
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 text-emerald-400 border border-emerald-500/30' 
                    : hasAccess
                      ? 'text-slate-300 hover:bg-slate-700/50 hover:text-white border border-transparent'
                      : 'text-slate-500 hover:bg-slate-800/50 border border-transparent'
                  }
                `}
              >
                <span className={`text-lg ${!hasAccess ? 'opacity-50' : ''}`}>{item.icon}</span>
                <span className={`text-sm font-medium flex-1 ${!hasAccess ? 'opacity-50' : ''}`}>{item.label}</span>
                <TierBadge requiredTier={requiredTier as SubscriptionTier} currentTier={tier} />
              </button>
            );
          })}
        </div>
      </nav>

      {/* Upgrade CTA for free users */}
      {tier === 'free' && (
        <div className="p-3 mx-2 mb-2 bg-gradient-to-r from-emerald-500/10 to-purple-500/10 rounded-lg border border-emerald-500/20">
          <p className="text-xs text-slate-300 mb-2">Unlock all features</p>
          <Link 
            href="/#pricing"
            className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-2 rounded-lg font-medium transition-colors"
          >
            Upgrade to Pro
          </Link>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>© 2025 RetirePro</span>
        </div>
      </div>
    </aside>
  );
}
