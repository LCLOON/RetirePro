'use client';

import { useApp } from '@/lib/store';
import { useSidebar } from './DashboardLayout';
import { Button } from '@/components/ui/Button';

export function TopBar() {
  const { state, runCalculations, saveToLocalStorage, exportToJSON } = useApp();
  const { toggle } = useSidebar();

  return (
    <header className="h-14 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 flex items-center justify-between px-4 md:px-6">
      {/* Left Side - Hamburger + Page Title */}
      <div className="flex items-center gap-3">
        {/* Hamburger Menu - Mobile Only */}
        <button
          onClick={toggle}
          className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h2 className="text-base md:text-lg font-semibold text-white truncate">
          {state.activeTab === 'start' && '📈 Overview'}
          {state.activeTab === 'data' && '📝 Data Entry'}
          {state.activeTab === 'results' && '📊 Results'}
          {state.activeTab === 'charts' && '📉 Charts'}
          {state.activeTab === 'analysis' && '🔍 Analysis'}
          {state.activeTab === 'details' && '📋 Details'}
          {state.activeTab === 'social' && '🏛️ Social Security'}
          {state.activeTab === 'tax' && '💰 Tax Planning'}
          {state.activeTab === 'worth' && '🏆 Net Worth'}
          {state.activeTab === 'mortgage' && '🏠 Mortgage'}
          {state.activeTab === 'budget' && '💳 Budget'}
          {state.activeTab === 'advanced' && '🎯 Advanced'}
          {state.activeTab === 'legal' && '⚖️ Legal'}
          {state.activeTab === 'ai' && '🤖 AI Advisor'}
          {state.activeTab === 'settings' && '⚙️ Settings'}
        </h2>
      </div>

      {/* Right Side - Actions */}
      <div className="flex items-center gap-2">
        {state.hasUnsavedChanges && (
          <span className="text-xs text-amber-400 mr-2 hidden sm:inline">● Unsaved</span>
        )}
        
        {/* Save Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={saveToLocalStorage}
          className="border-slate-600 text-slate-300 hover:bg-slate-700 hidden sm:flex"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save
        </Button>

        {/* Export Button - Hidden on very small screens */}
        <Button
          variant="outline"
          size="sm"
          onClick={exportToJSON}
          className="border-slate-600 text-slate-300 hover:bg-slate-700 hidden md:flex"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Export
        </Button>

        {/* Mobile Save Icon Only */}
        <button
          onClick={saveToLocalStorage}
          className="sm:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors"
          aria-label="Save"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
        </button>
      </div>
    </header>
  );
}
