'use client';

import { TabId } from '@/lib/types';
import { useApp } from '@/lib/store';

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

export function Sidebar() {
  const { state, setActiveTab } = useApp();

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

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = state.activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 text-emerald-400 border border-emerald-500/30' 
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white border border-transparent'
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>© 2025 RetirePro</span>
        </div>
      </div>
    </aside>
  );
}
