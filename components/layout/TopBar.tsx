'use client';

import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/Button';

export function TopBar() {
  const { state, runCalculations, saveToLocalStorage, exportToJSON } = useApp();

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate quick stats (shown on larger screens)
  const totalSavings = state.retirementData.currentSavingsPreTax + 
    state.retirementData.currentSavingsRoth + 
    state.retirementData.currentSavingsAfterTax;

  const yearsToRetirement = state.retirementData.retirementAge - state.retirementData.currentAge;
  
  const successRate = state.monteCarloResults ? 
    Math.round(state.monteCarloResults.successRate * 100) : 0;

  return (
    <header className="h-14 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 flex items-center justify-between px-6">
      {/* Left Side - Page Title / Breadcrumb */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-white">
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
          <span className="text-xs text-amber-400 mr-2">● Unsaved</span>
        )}
        
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

        <Button
          variant="outline"
          size="sm"
          onClick={exportToJSON}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Export
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={runCalculations}
          loading={state.isCalculating}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-0"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Calculate
        </Button>
      </div>
    </header>
  );
}
