'use client';

import { ReactNode, useState } from 'react';
import { Card, CardGrid } from '@/components/ui';
import { Button } from '@/components/ui';
import { useApp, Theme } from '@/lib/store';
import { useSubscription, TIER_INFO, SubscriptionTier, PRO_FEATURES, PREMIUM_FEATURES } from '@/lib/subscription';
import { formatCurrency } from '@/lib/calculations';
import Link from 'next/link';

// Report Generator Component
function ReportGenerator({ state }: { state: ReturnType<typeof useApp>['state'] }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const data = state.retirementData;
  const results = state.scenarioResults;
  const mcResults = state.monteCarloResults;

  const totalSavings = data.currentSavingsPreTax + data.currentSavingsRoth + data.currentSavingsAfterTax +
    (data.hasInheritedIRA ? data.inheritedIRA.balance : 0);
  const totalContributions = data.annualContributionPreTax + data.annualContributionRoth + 
    data.annualContributionAfterTax + data.employerMatch;
  const yearsToRetirement = data.retirementAge - data.currentAge;

  const handlePrint = () => {
    setIsGenerating(true);
    
    // Wait for preview to render, then print
    setTimeout(() => {
      window.print();
      setIsGenerating(false);
    }, 500);
  };

  const generateHTMLReport = () => {
    const reportHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>RetirePro Retirement Plan Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1e293b; }
    h1 { color: #059669; border-bottom: 3px solid #059669; padding-bottom: 10px; }
    h2 { color: #334155; margin-top: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
    .header { text-align: center; margin-bottom: 40px; }
    .logo { font-size: 48px; margin-bottom: 10px; }
    .date { color: #64748b; font-size: 14px; }
    .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
    .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
    .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; }
    .stat-value { font-size: 24px; font-weight: bold; color: #059669; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; }
    th { background: #f1f5f9; font-weight: 600; }
    .success { color: #059669; }
    .warning { color: #f59e0b; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px; }
    .disclaimer { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin-top: 30px; font-size: 12px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">💎</div>
    <h1>Retirement Plan Report</h1>
    <p class="date">Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <h2>📊 Executive Summary</h2>
  <div class="summary-grid">
    <div class="stat-card">
      <div class="stat-label">Current Age</div>
      <div class="stat-value">${data.currentAge}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Retirement Age</div>
      <div class="stat-value">${data.retirementAge}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Years to Retirement</div>
      <div class="stat-value">${yearsToRetirement}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Total Current Savings</div>
      <div class="stat-value">${formatCurrency(totalSavings)}</div>
    </div>
  </div>

  ${mcResults ? `
  <h2>🎲 Monte Carlo Analysis</h2>
  <div class="summary-grid">
    <div class="stat-card">
      <div class="stat-label">Success Rate</div>
      <div class="stat-value ${mcResults.successRate >= 80 ? 'success' : 'warning'}">${mcResults.successRate.toFixed(1)}%</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Median Outcome</div>
      <div class="stat-value">${formatCurrency(mcResults.median)}</div>
    </div>
  </div>
  ` : ''}

  <h2>💰 Current Savings Breakdown</h2>
  <table>
    <tr><th>Account Type</th><th>Balance</th></tr>
    <tr><td>Pre-Tax (401k/Traditional IRA)</td><td>${formatCurrency(data.currentSavingsPreTax)}</td></tr>
    <tr><td>Roth</td><td>${formatCurrency(data.currentSavingsRoth)}</td></tr>
    <tr><td>After-Tax/Brokerage</td><td>${formatCurrency(data.currentSavingsAfterTax)}</td></tr>
    ${data.hasInheritedIRA ? `<tr><td>Inherited IRA</td><td>${formatCurrency(data.inheritedIRA.balance)}</td></tr>` : ''}
    <tr><th>Total</th><th>${formatCurrency(totalSavings)}</th></tr>
  </table>

  <h2>📥 Annual Contributions</h2>
  <table>
    <tr><th>Contribution Type</th><th>Annual Amount</th></tr>
    <tr><td>Pre-Tax Contributions</td><td>${formatCurrency(data.annualContributionPreTax)}</td></tr>
    <tr><td>Roth Contributions</td><td>${formatCurrency(data.annualContributionRoth)}</td></tr>
    <tr><td>After-Tax Contributions</td><td>${formatCurrency(data.annualContributionAfterTax)}</td></tr>
    <tr><td>Employer Match</td><td>${formatCurrency(data.employerMatch)}</td></tr>
    <tr><th>Total Annual</th><th>${formatCurrency(totalContributions)}</th></tr>
  </table>

  <h2>🏦 Retirement Income Sources</h2>
  <table>
    <tr><th>Income Source</th><th>Annual Amount</th><th>Start Age</th></tr>
    <tr><td>Social Security</td><td>${formatCurrency(data.socialSecurityBenefit)}</td><td>${data.socialSecurityStartAge}</td></tr>
    ${data.hasSpouse ? `<tr><td>Spouse Social Security</td><td>${formatCurrency(data.spouseSocialSecurityBenefit)}</td><td>${data.spouseSocialSecurityStartAge}</td></tr>` : ''}
    ${data.hasPension ? `<tr><td>Pension</td><td>${formatCurrency(data.pensionIncome)}</td><td>${data.pensionStartAge}</td></tr>` : ''}
  </table>

  <h2>📈 Assumptions</h2>
  <table>
    <tr><th>Parameter</th><th>Value</th></tr>
    <tr><td>Pre-Retirement Return</td><td>${(data.preRetirementReturn * 100).toFixed(1)}%</td></tr>
    <tr><td>Post-Retirement Return</td><td>${(data.postRetirementReturn * 100).toFixed(1)}%</td></tr>
    <tr><td>Inflation Rate</td><td>${(data.inflationRate * 100).toFixed(1)}%</td></tr>
    <tr><td>Safe Withdrawal Rate</td><td>${(data.safeWithdrawalRate * 100).toFixed(1)}%</td></tr>
    <tr><td>Annual Retirement Expenses</td><td>${formatCurrency(data.retirementExpenses)}</td></tr>
    <tr><td>Life Expectancy</td><td>${data.lifeExpectancy}</td></tr>
  </table>

  ${results ? `
  <h2>📊 Projection Results</h2>
  <table>
    <tr><th>Scenario</th><th>At Retirement</th><th>At Age ${data.lifeExpectancy}</th></tr>
    <tr><td>Expected</td><td>${formatCurrency(results.expected.atRetirement)}</td><td>${formatCurrency(results.expected.atEnd)}</td></tr>
    <tr><td>Optimistic (+2%)</td><td>${formatCurrency(results.optimistic.atRetirement)}</td><td>${formatCurrency(results.optimistic.atEnd)}</td></tr>
    <tr><td>Pessimistic (-2%)</td><td>${formatCurrency(results.pessimistic.atRetirement)}</td><td>${formatCurrency(results.pessimistic.atEnd)}</td></tr>
  </table>
  ` : ''}

  <div class="disclaimer">
    <strong>⚠️ Disclaimer:</strong> This report is for educational and informational purposes only. It is not financial, investment, tax, or legal advice. 
    Projections are based on the assumptions provided and may not reflect actual future results. Past performance does not guarantee future results.
    Please consult with qualified financial, tax, and legal professionals before making any financial decisions.
  </div>

  <div class="footer">
    <p>Generated by RetirePro | ${new Date().toLocaleDateString()}</p>
    <p>© ${new Date().getFullYear()} RetirePro. All rights reserved.</p>
  </div>
</body>
</html>`;

    // Create blob and download
    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RetirePro_Report_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card title="📄 Report Generator" subtitle="Generate a professional retirement plan report">
      <div className="space-y-4">
        <p className="text-sm text-slate-400">
          Create a comprehensive retirement plan report that you can print or save as PDF.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handlePrint}
            disabled={isGenerating}
            className="flex items-center justify-center gap-3 p-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <div className="text-left">
              <p className="font-semibold">Print / Save as PDF</p>
              <p className="text-xs text-emerald-200">Use browser print dialog</p>
            </div>
          </button>
          
          <button
            onClick={generateHTMLReport}
            className="flex items-center justify-center gap-3 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <div className="text-left">
              <p className="font-semibold">Download HTML Report</p>
              <p className="text-xs text-blue-200">Open in any browser</p>
            </div>
          </button>
        </div>

        {/* Quick Summary Preview */}
        <div className="p-4 bg-slate-800/50 rounded-lg">
          <h4 className="font-medium text-white mb-3">Report Preview</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Current Savings</p>
              <p className="text-white font-semibold">{formatCurrency(totalSavings)}</p>
            </div>
            <div>
              <p className="text-slate-400">Annual Contributions</p>
              <p className="text-white font-semibold">{formatCurrency(totalContributions)}</p>
            </div>
            <div>
              <p className="text-slate-400">At Retirement</p>
              <p className="text-emerald-400 font-semibold">
                {results ? formatCurrency(results.expected.atRetirement) : 'Run calculations'}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Success Rate</p>
              <p className={`font-semibold ${mcResults && mcResults.successRate >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {mcResults ? `${mcResults.successRate.toFixed(0)}%` : 'Run analysis'}
              </p>
            </div>
          </div>
        </div>

        {!results && (
          <div className="p-3 bg-amber-900/30 border border-amber-600/50 rounded-lg">
            <p className="text-amber-300 text-sm">
              💡 Tip: Run calculations first to include projection results in your report.
            </p>
          </div>
        )}
      </div>

      {/* Print-only content (hidden on screen) */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print-report, .print-report * { visibility: visible; }
          .print-report { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>
    </Card>
  );
}

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
      id: 'medium',
      label: 'Medium',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0zM12 8a2 2 0 100-4 2 2 0 000 4z" />
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

      {/* Report Generator */}
      <ReportGenerator state={state} />
      
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
